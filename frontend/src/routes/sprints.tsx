import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
	BookOpen,
	CheckCircle2,
	Code2,
	Flame,
	Globe,
	HelpCircle,
	Link2,
	Pause,
	PenLine,
	Play,
	Plus,
	Sparkles,
	Timer,
	Video,
	Volume2,
	VolumeX,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { ConfirmModal } from "../components/common/ConfirmModal.js";
import { EmptyState } from "../components/common/EmptyState.js";
import { Pagination } from "../components/common/Pagination.js";
import { PeerFeedbackCard } from "../components/common/PeerFeedbackCard.js";
import { SelectDropdown } from "../components/common/SelectDropdown.js";
import { StatCard } from "../components/common/StatCard.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import { useTimerStore } from "../stores/timerStore.js";
import { toast } from "../stores/toastStore.js";
import type {
	ChecklistProgressStatus,
	LearningSprint,
	PaginatedResponse,
	RoadmapWeek,
	StudentDashboardData,
} from "../types/index.js";

interface SprintSearchParams {
	page?: number;
	limit?: number;
}

const countWords = (text?: string | null): number => {
	if (!text) return 0;
	return text.trim().split(/\s+/).filter(Boolean).length;
};

const InPageSprintSchema = Yup.object().shape({
	topicId: Yup.string()
		.nullable()
		.transform((curr, orig) => (orig === "" ? null : curr)),
	durationMinutes: Yup.number()
		.required("Durasi belajar wajib diisi")
		.min(1, "Durasi minimal 1 menit")
		.max(300, "Durasi maksimal 300 menit"),
	whatLearned: Yup.string()
		.required("Catatan pemahaman konsep wajib diisi")
		.test(
			"minWordsLearned",
			"Ceritakan minimal 15 kata tentang konsep yang Anda pahami",
			(val) => countWords(val) >= 15,
		),
	whatPracticed: Yup.string()
		.required("Catatan hasil praktek kode wajib diisi")
		.test(
			"minWordsPracticed",
			"Ceritakan minimal 15 kata tentang praktek / eksperimen kode yang Anda buat",
			(val) => countWords(val) >= 15,
		),
	confusingParts: Yup.string()
		.nullable()
		.transform((curr, orig) => (orig === "" ? null : curr)),
	evidenceUrl: Yup.string()
		.required("URL Repositori / Bukti GitHub wajib diisi")
		.url("Format URL tidak valid (harus diawali http:// atau https://)"),
	loomUrl: Yup.string()
		.url("Format URL Loom tidak valid (harus diawali http:// atau https://)")
		.nullable()
		.transform((curr, orig) => (orig === "" ? null : curr)),
	demoUrl: Yup.string()
		.url("Format URL Demo tidak valid (harus diawali http:// atau https://)")
		.nullable()
		.transform((curr, orig) => (orig === "" ? null : curr)),
	evidenceType: Yup.string()
		.oneOf(["GITHUB", "GITHUB_PAGES", "LOOM", "FIGMA", "LIVE_DEMO", "OTHER"])
		.default("GITHUB"),
});

export const Route = createFileRoute("/sprints")({
	validateSearch: (search: Record<string, unknown>): SprintSearchParams => {
		return {
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 10,
		};
	},
	component: SprintsPage,
});

function SprintsPage() {
	const navigate = useNavigate();
	const searchParams = useSearch({ from: "/sprints" });
	const { user, isAuthenticated } = useAuthStore();
	const queryClient = useQueryClient();

	const {
		status,
		targetSeconds,
		elapsedSeconds,
		selectedTopicTitle,
		isSoundEnabled,
		startSession,
		pauseSession,
		resumeSession,
		finishEarly,
		abandonSession,
		toggleSound,
		openReflectionModal,
	} = useTimerStore();

	const currentPage = searchParams.page || 1;
	const pageSize = searchParams.limit || 10;

	// View mode: 'TIMER' (Countdown & Focus) | 'DIRECT_LOG' (In-page Devlog Studio)
	const [workspaceTab, setWorkspaceTab] = useState<"TIMER" | "DIRECT_LOG">(
		"TIMER",
	);

	// Local state for setting up next session
	const [setupTopicId, setSetupTopicId] = useState<string>("");
	const [setupDurationMinutes, setSetupDurationMinutes] = useState<number>(25);
	const [isAbandonModalOpen, setIsAbandonModalOpen] = useState(false);
	const [inPageChecklistUpdates, setInPageChecklistUpdates] = useState<
		Record<string, ChecklistProgressStatus>
	>({});

	useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		} else if (user?.role === "ADMIN") {
			navigate({ to: "/admin" });
		}
	}, [isAuthenticated, user, navigate]);

	const updateFilters = (updates: Partial<SprintSearchParams>) => {
		navigate({
			to: "/sprints",
			search: {
				...searchParams,
				...updates,
			},
		});
	};

	// Fetch Roadmap for topic picker
	const { data: roadmapWeeks } = useQuery<RoadmapWeek[]>({
		queryKey: ["roadmap"],
		queryFn: async () => {
			const res: any = await api.get("/roadmap");
			return res.data;
		},
		enabled: isAuthenticated,
	});

	// Fetch global student dashboard summary for accurate cumulative KPIs
	const { data: dashboardData } = useQuery<StudentDashboardData>({
		queryKey: ["studentDashboard"],
		queryFn: async () => {
			const res: any = await api.get("/dashboard/student");
			return res.data;
		},
		enabled: isAuthenticated && user?.role !== "ADMIN",
	});

	const allTopics =
		roadmapWeeks?.flatMap((w) =>
			w.topics.map((t) => ({
				...t,
				weekNumber: w.weekNumber,
				weekTitle: w.title,
			})),
		) || [];

	// Fetch Sprints for this user (Server-Side Paginated)
	const { data: sprintResponse, isLoading } = useQuery<
		PaginatedResponse<LearningSprint>
	>({
		queryKey: [
			"sprints",
			{ userId: user?.id, page: currentPage, limit: pageSize },
		],
		queryFn: async () => {
			const params = new URLSearchParams();
			params.set("userId", user?.id || "");
			params.set("page", String(currentPage));
			params.set("limit", String(pageSize));

			const res: any = await api.get(`/sprints?${params.toString()}`);
			return res;
		},
		enabled: !!user?.id,
	});

	const sprints = sprintResponse?.data || [];
	const pagination = sprintResponse?.pagination;

	const totalMinutes =
		dashboardData?.summary?.totalMinutesLearned ??
		dashboardData?.summary?.totalDurationMinutes ??
		sprints?.reduce((acc, s) => acc + s.durationMinutes, 0) ??
		0;
	const habitReached =
		dashboardData?.summary?.habitReachedCount ??
		sprints?.filter((s) => s.isHabitQualified).length ??
		0;
	const totalSprintsCount =
		dashboardData?.summary?.totalSprints ??
		pagination?.total ??
		sprints?.length ??
		0;

	const handleStartSession = () => {
		const topic = allTopics.find((t) => t.id === setupTopicId);
		startSession(
			setupTopicId || null,
			topic ? `${topic.title}` : null,
			setupDurationMinutes,
		);
	};

	const saveInPageSprintMutation = useMutation({
		mutationFn: async ({
			values,
			checklists,
		}: {
			values: any;
			checklists: Record<string, ChecklistProgressStatus>;
		}) => {
			const payload = {
				...values,
				topicId: values.topicId || null,
				confusingParts: values.confusingParts || null,
				evidenceUrl: values.evidenceUrl || null,
				loomUrl: values.loomUrl || null,
				demoUrl: values.demoUrl || null,
				evidenceType: values.evidenceType || "GITHUB",
			};

			const res: any = await api.post("/sprints", payload);

			// Save checklists
			const checklistPromises = Object.entries(checklists).map(
				([checklistItemId, status]) =>
					api.post("/checklists/progress", { checklistItemId, status }),
			);
			if (checklistPromises.length > 0) {
				await Promise.allSettled(checklistPromises);
			}

			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sprints"] });
			queryClient.invalidateQueries({ queryKey: ["classSprints"] });
			queryClient.invalidateQueries({ queryKey: ["studentDashboard"] });
			queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
			queryClient.invalidateQueries({ queryKey: ["roadmap"] });
			toast.success("Jurnal belajar & progres kompetensi berhasil dicatat!");
			setInPageChecklistUpdates({});
			setWorkspaceTab("TIMER");
		},
		onError: (err: any) => {
			toast.error(
				err?.response?.data?.message ||
					"Gagal menyimpan jurnal belajar. Silakan coba lagi.",
			);
		},
	});

	// Timer calculations
	const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
	const remMinutes = Math.floor(remainingSeconds / 60);
	const remSecs = remainingSeconds % 60;
	const formattedRemaining = `${String(remMinutes).padStart(2, "0")}:${String(remSecs).padStart(2, "0")}`;

	const elapsedMinutes = Math.floor(elapsedSeconds / 60);
	const elapsedSecs = elapsedSeconds % 60;
	const formattedElapsed = `${String(elapsedMinutes).padStart(2, "0")}:${String(elapsedSecs).padStart(2, "0")}`;

	const progressPercent = Math.min(
		100,
		Math.round((elapsedSeconds / targetSeconds) * 100),
	);

	if (isLoading && !sprintResponse) {
		return (
			<div className="max-w-3xl mx-auto w-full space-y-6">
				<div className="h-48 bg-white border border-slate-200 rounded-xl animate-pulse" />
				<div className="grid grid-cols-3 gap-4">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-20 bg-white border border-slate-200 rounded-xl animate-pulse"
						/>
					))}
				</div>
				<div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto w-full space-y-6 min-w-0 max-w-full">
			{/* 1. Interactive Focus Session & In-Page Devlog Studio */}
			<div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
				{status === "IDLE" || status === "COMPLETED" ? (
					/* IDLE / WORKSPACE VIEW */
					<div className="p-6 md:p-7 space-y-6">
						{/* Mode Switcher Tabs Header */}
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
							<div>
								<div className="flex items-center gap-2">
									<span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">
										Workspace Belajar
									</span>
									<span className="text-slate-300">•</span>
									<span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-mono">
										<Flame size={11} className="text-amber-500" />
										<span>Standar Habit ≥25m</span>
									</span>
								</div>
								<h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-0.5">
									{workspaceTab === "TIMER"
										? "Mulai Sesi Fokus (Learning Sprint)"
										: "Studio Refleksi & Jurnal Belajar"}
								</h2>
							</div>

							{/* Tab Switcher */}
							<div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-center">
								<button
									type="button"
									onClick={() => setWorkspaceTab("TIMER")}
									className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
										workspaceTab === "TIMER"
											? "bg-white text-blue-700 shadow-xs"
											: "text-slate-600 hover:text-slate-900"
									}`}
								>
									<Timer size={13} />
									<span>Timer Fokus</span>
								</button>
								<button
									type="button"
									onClick={() => setWorkspaceTab("DIRECT_LOG")}
									className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
										workspaceTab === "DIRECT_LOG"
											? "bg-white text-blue-700 shadow-xs"
											: "text-slate-600 hover:text-slate-900"
									}`}
								>
									<PenLine size={13} />
									<span>Tulis Jurnal Langsung</span>
								</button>
							</div>
						</div>

						{/* TAB 1: TIMER SETUP */}
						{workspaceTab === "TIMER" ? (
							<div className="space-y-6">
								<p className="text-xs text-slate-500 leading-relaxed max-w-xl">
									Pilih materi yang ingin Anda pelajari tanpa distraksi. Sesi
									ini dilengkapi detak jarum jam audio mekanik dan transisi
									otomatis ke jurnal refleksi.
								</p>

								{/* Setup Controls: Target Topic & Duration Presets */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
									{/* Topic Selector */}
									<div className="md:col-span-2 space-y-1.5">
										<label className="block text-xs font-semibold text-slate-800">
											Pilih Topik Silabus yang Akan Dipelajari
										</label>
										<SelectDropdown
											value={setupTopicId}
											onChange={(val) => setSetupTopicId(val)}
											searchable
											allowClear
											placeholder="-- Belajar Mandiri / Topik Bebas --"
											options={[
												{
													value: "",
													label: "-- Belajar Mandiri / Topik Bebas --",
													badge: "Mandiri",
												},
												...allTopics.map((t) => ({
													value: t.id,
													label: `[M${t.weekNumber}] ${t.title}`,
													badge: t.category,
													description: `Minggu ${t.weekNumber}: ${t.weekTitle}`,
												})),
											]}
										/>
									</div>

									{/* Duration Presets */}
									<div className="space-y-1.5">
										<label className="block text-xs font-semibold text-slate-800">
											Target Durasi Fokus
										</label>
										<div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-lg">
											{[15, 25, 50].map((dur) => (
												<button
													key={dur}
													type="button"
													onClick={() => setSetupDurationMinutes(dur)}
													className={`py-1.5 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
														setupDurationMinutes === dur
															? "bg-white text-blue-700 shadow-xs font-semibold"
															: "text-slate-600 hover:text-slate-900"
													}`}
												>
													{dur}m
												</button>
											))}
										</div>
									</div>
								</div>

								{/* Launch Primary CTA */}
								<div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={toggleSound}
											className={`px-3 py-1.5 text-xs font-medium rounded-lg border inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
												isSoundEnabled
													? "bg-amber-50 border-amber-200 text-amber-800"
													: "bg-slate-50 border-slate-200 text-slate-500"
											}`}
										>
											{isSoundEnabled ? (
												<Volume2 size={13} className="text-amber-600" />
											) : (
												<VolumeX size={13} />
											)}
											<span>
												{isSoundEnabled ? "Suara Detak Aktif" : "Suara Mute"}
											</span>
										</button>
									</div>

									<button
										type="button"
										onClick={handleStartSession}
										className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-md"
									>
										<Play size={14} />
										<span>Mulai Sesi Fokus ({setupDurationMinutes} Menit)</span>
									</button>
								</div>
							</div>
						) : (
							/* TAB 2: IN-PAGE DEVLOG STUDIO FORM (NO POPUP) */
							<Formik
								initialValues={{
									topicId: setupTopicId || "",
									durationMinutes: setupDurationMinutes || 25,
									whatLearned: "",
									whatPracticed: "",
									confusingParts: "",
									evidenceUrl: "",
									loomUrl: "",
									demoUrl: "",
									evidenceType: "GITHUB",
									needsFeedback: false,
								}}
								validationSchema={InPageSprintSchema}
								onSubmit={async (values, { resetForm }) => {
									await saveInPageSprintMutation.mutateAsync({
										values,
										checklists: inPageChecklistUpdates,
									});
									resetForm();
								}}
							>
								{({ values, isSubmitting }) => {
									const selectedTopicObj = allTopics.find(
										(t) => t.id === values.topicId,
									);

									return (
										<Form className="space-y-5">
											{/* 1. Context & Scope */}
											<div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
												<div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
													<Sparkles size={13} className="text-blue-600" />
													<span>Konteks & Durasi Sesi Belajar</span>
												</div>

												<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
													<div className="sm:col-span-2">
														<label className="block text-xs font-medium text-slate-700 mb-1">
															Topik Silabus Terkait (Opsional)
														</label>
														<Field
															as="select"
															name="topicId"
															className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
														>
															<option value="">
																-- Belajar Mandiri Umum / Topik Bebas --
															</option>
															{allTopics.map((topic) => (
																<option key={topic.id} value={topic.id}>
																	[Mg {topic.weekNumber}] {topic.title} (
																	{topic.category})
																</option>
															))}
														</Field>
													</div>

													<div>
														<label className="block text-xs font-medium text-slate-700 mb-1">
															Durasi Fokus (Menit)
														</label>
														<Field
															type="number"
															name="durationMinutes"
															min={1}
															className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
														/>
													</div>
												</div>
											</div>

											{/* 2. Checklist (If topic selected) */}
											{selectedTopicObj?.checklists &&
												selectedTopicObj.checklists.length > 0 && (
													<div className="p-4 bg-blue-50/50 border border-blue-200/70 rounded-xl space-y-3">
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
																<Sparkles size={13} className="text-blue-600" />
																<span>
																	Validasi Mandiri Checklist Kompetensi
																</span>
															</div>
															<span className="text-[10px] text-blue-700 font-medium">
																Tentukan level penguasaanmu
															</span>
														</div>

														<div className="space-y-2">
															{selectedTopicObj.checklists.map((ci) => {
																const currentStatus =
																	inPageChecklistUpdates[ci.id] ||
																	ci.status ||
																	"NOT_STARTED";
																return (
																	<div
																		key={ci.id}
																		className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs space-y-2 text-xs"
																	>
																		<p className="text-slate-800 text-[11px] leading-relaxed">
																			{ci.statement}
																		</p>
																		<div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
																			{[
																				{ key: "NOT_STARTED", label: "Belum" },
																				{ key: "LEARNING", label: "Belajar" },
																				{ key: "PRACTICING", label: "Latihan" },
																				{
																					key: "CAN_DO_INDEPENDENTLY",
																					label: "Mandiri",
																				},
																			].map((opt) => {
																				const isSelected =
																					currentStatus === opt.key;
																				return (
																					<button
																						key={opt.key}
																						type="button"
																						onClick={() =>
																							setInPageChecklistUpdates(
																								(prev) => ({
																									...prev,
																									[ci.id]:
																										opt.key as ChecklistProgressStatus,
																								}),
																							)
																						}
																						className={`py-1 px-1.5 rounded text-[10px] font-medium transition-all text-center cursor-pointer ${
																							isSelected
																								? opt.key ===
																									"CAN_DO_INDEPENDENTLY"
																									? "bg-emerald-600 text-white font-semibold shadow-xs"
																									: opt.key === "PRACTICING"
																										? "bg-blue-600 text-white font-semibold shadow-xs"
																										: opt.key === "LEARNING"
																											? "bg-amber-600 text-white font-semibold shadow-xs"
																											: "bg-slate-700 text-white font-semibold shadow-xs"
																								: "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
																						}`}
																					>
																						{opt.label}
																					</button>
																				);
																			})}
																		</div>
																	</div>
																);
															})}
														</div>
													</div>
												)}

											{/* 3. Devlog Storytelling Cards */}
											<div className="space-y-4">
												{/* Story 1: Konsep */}
												<div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
															<BookOpen size={14} className="text-blue-600" />
															<span>
																Apa konsep & insight baru yang kamu pahami?
															</span>
															<span className="text-rose-500 font-bold">*</span>
														</div>
														<span
															className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full transition-colors ${
																countWords(values.whatLearned) >= 15
																	? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold"
																	: "bg-slate-100 text-slate-500"
															}`}
														>
															{countWords(values.whatLearned)} / 15 kata min.
														</span>
													</div>
													<p className="text-[11px] text-slate-500 leading-normal">
														Ceritakan dengan kata-katamu sendiri bagaimana
														konsep ini bekerja, logika kodenya, atau analogi
														pemahamannya.
													</p>
													<Field
														as="textarea"
														name="whatLearned"
														rows={3}
														placeholder="Contoh: Hari ini saya memahami cara kerja lifecycle rendering pada React dan bagaimana dependency array pada useEffect mencegah terjadinya infinite loop..."
														className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none break-words whitespace-pre-wrap leading-relaxed"
													/>
													<ErrorMessage
														name="whatLearned"
														component="div"
														className="text-rose-500 text-[11px]"
													/>
												</div>

												{/* Story 2: Praktek */}
												<div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
															<Code2 size={14} className="text-emerald-600" />
															<span>
																Apa yang kamu bangun, slicing, atau uji kodenya?
															</span>
															<span className="text-rose-500 font-bold">*</span>
														</div>
														<span
															className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full transition-colors ${
																countWords(values.whatPracticed) >= 15
																	? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold"
																	: "bg-slate-100 text-slate-500"
															}`}
														>
															{countWords(values.whatPracticed)} / 15 kata min.
														</span>
													</div>
													<p className="text-[11px] text-slate-500 leading-normal">
														Ceritakan implementasi yang kamu buat: fungsi yang
														kamu coding, komponen yang berhasil dibuat jalan,
														atau eksperimen sintaks yang kamu coba.
													</p>
													<Field
														as="textarea"
														name="whatPracticed"
														rows={3}
														placeholder="Contoh: Saya membuat custom hook untuk fetching data menggunakan AbortController, serta menambahkan unit testing untuk menangani kasus request timeout..."
														className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none break-words whitespace-pre-wrap leading-relaxed"
													/>
													<ErrorMessage
														name="whatPracticed"
														component="div"
														className="text-rose-500 text-[11px]"
													/>
												</div>

												{/* Story 3: Kendala */}
												<div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
													<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
														<HelpCircle size={14} className="text-amber-600" />
														<span>
															Kendala / blocker yang kamu temukan? (Opsional)
														</span>
													</div>
													<p className="text-[11px] text-slate-500 leading-normal">
														Tuliskan bagian yang masih membingungkan atau error
														yang belum ketemu solusinya agar Dosen/TA dan teman
														kelas bisa bantu.
													</p>
													<Field
														as="textarea"
														name="confusingParts"
														rows={2}
														placeholder="Contoh: Masih sedikit ragu kapan harus menggunakan useMemo vs useCallback saat mengoptimasi re-render pada nested component..."
														className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none break-words whitespace-pre-wrap leading-relaxed"
													/>
												</div>
											</div>

											{/* 4. Multi-Evidence */}
											<div className="p-4 bg-slate-50/90 border border-slate-200 rounded-xl space-y-3.5">
												<div className="flex items-center justify-between">
													<span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
														<Link2 size={14} className="text-blue-600" />
														<span>Tautan Bukti Kode & Video (Evidence)</span>
													</span>
													<span className="text-[11px] text-slate-500 font-mono">
														GitHub Repo + Loom Video
													</span>
												</div>

												<div>
													<label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
														<span className="flex items-center gap-1.5">
															<span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
															<span>URL GitHub Repository / Commit / PR</span>
															<span className="text-rose-500 font-bold">*</span>
														</span>
														<span className="text-[10px] text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
															Wajib
														</span>
													</label>
													<Field
														type="url"
														name="evidenceUrl"
														placeholder="https://github.com/username/project-repo"
														className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
													/>
													<ErrorMessage
														name="evidenceUrl"
														component="div"
														className="text-rose-500 text-[11px] mt-1"
													/>
												</div>

												<div>
													<label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
														<span className="flex items-center gap-1.5 text-indigo-950">
															<Video size={13} className="text-indigo-600" />
															<span>URL Video Penjelasan Loom (1–3 Menit)</span>
														</span>
														<span className="text-[10px] text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
															Sangat Disarankan
														</span>
													</label>
													<Field
														type="url"
														name="loomUrl"
														placeholder="https://www.loom.com/share/..."
														className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
													/>
													<ErrorMessage
														name="loomUrl"
														component="div"
														className="text-rose-500 text-[11px] mt-1"
													/>
													<p className="text-[11px] text-slate-400 mt-1">
														Rekam demo jalan aplikasi & jelaskan secara lisan
														cara kerja kode yang kamu buat.
													</p>
												</div>

												<div>
													<label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
														<span className="flex items-center gap-1.5 text-emerald-950">
															<Globe size={13} className="text-emerald-600" />
															<span>
																URL Live Demo / GitHub Pages (Opsional)
															</span>
														</span>
														<span className="text-[10px] text-slate-400 font-mono">
															Opsional
														</span>
													</label>
													<Field
														type="url"
														name="demoUrl"
														placeholder="https://username.github.io/..."
														className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
													/>
													<ErrorMessage
														name="demoUrl"
														component="div"
														className="text-rose-500 text-[11px] mt-1"
													/>
												</div>
											</div>

											{/* 5. Request Assistance Toggle */}
											<div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-xl flex items-start gap-3">
												<Field
													type="checkbox"
													name="needsFeedback"
													id="inPageNeedsFeedback"
													className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
												/>
												<div>
													<label
														htmlFor="inPageNeedsFeedback"
														className="text-xs font-semibold text-slate-800 block cursor-pointer"
													>
														Tandai untuk Asistensi & Review Dosen / TA
													</label>
													<p className="text-[11px] text-slate-500 mt-0.5">
														Submisi ini akan masuk ke antrean prioritas review
														dosen untuk evaluasi resmi.
													</p>
												</div>
											</div>

											{/* Form Footer Action */}
											<div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
												<button
													type="button"
													onClick={() => setWorkspaceTab("TIMER")}
													className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
												>
													Kembali ke Timer
												</button>
												<button
													type="submit"
													disabled={
														isSubmitting ||
														saveInPageSprintMutation.isPending ||
														countWords(values.whatLearned) < 15 ||
														countWords(values.whatPracticed) < 15 ||
														!values.evidenceUrl
													}
													className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
												>
													{isSubmitting || saveInPageSprintMutation.isPending
														? "Mempublikasikan..."
														: "Publikasikan Jurnal Belajar"}
												</button>
											</div>
										</Form>
									);
								}}
							</Formik>
						)}
					</div>
				) : (
					/* ACTIVE / PAUSED RUNNING SESSION VIEW */
					<div className="p-6 md:p-8 space-y-6 bg-slate-900 text-white">
						{/* Top Bar: Topic Badge & Habit Indicator */}
						<div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
							<div className="flex items-center gap-2 min-w-0">
								<div className="relative flex items-center justify-center">
									<div
										className={`w-3 h-3 rounded-full ${
											status === "RUNNING"
												? "bg-emerald-400 animate-ping"
												: "bg-amber-400"
										}`}
									/>
									<div
										className={`w-3 h-3 rounded-full absolute ${
											status === "RUNNING" ? "bg-emerald-500" : "bg-amber-500"
										}`}
									/>
								</div>

								<span className="text-xs font-mono uppercase tracking-wider text-slate-400">
									{status === "RUNNING"
										? "Sesi Sedang Berjalan"
										: "Sesi Dijeda"}
								</span>
								<span className="text-slate-600">•</span>
								<span className="text-xs font-semibold text-slate-200 truncate">
									{selectedTopicTitle || "Sesi Belajar Mandiri"}
								</span>
							</div>

							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={toggleSound}
									className={`p-1.5 rounded-lg text-xs font-mono border transition-colors cursor-pointer inline-flex items-center gap-1 ${
										isSoundEnabled
											? "text-amber-400 border-amber-500/30 bg-amber-950/40 hover:bg-amber-950/60"
											: "text-slate-500 border-slate-800 bg-slate-800/60 hover:bg-slate-800"
									}`}
									title={
										isSoundEnabled
											? "Mute suara detak jam"
											: "Aktifkan suara detak jam"
									}
								>
									{isSoundEnabled ? (
										<Volume2 size={13} />
									) : (
										<VolumeX size={13} />
									)}
									<span className="text-[11px]">
										{isSoundEnabled ? "Suara Detak On" : "Suara Mute"}
									</span>
								</button>

								{elapsedMinutes >= 25 && (
									<span className="inline-flex items-center gap-1 text-xs font-mono text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
										<Flame size={12} className="text-amber-400" />
										<span>Target Habit ≥25m Tercapai!</span>
									</span>
								)}
							</div>
						</div>

						{/* Central Timer & Progress Ring Display */}
						<div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
							<div className="text-6xl sm:text-7xl font-mono font-bold tracking-tighter text-white">
								{formattedRemaining}
							</div>

							<p className="text-xs text-slate-400 font-mono">
								{formattedElapsed} waktu fokus berlalu ({progressPercent}%
								selesai)
							</p>

							{/* Progress Line */}
							<div className="w-full max-w-md bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
								<div
									className="h-full bg-blue-500 transition-all duration-300 rounded-full"
									style={{ width: `${progressPercent}%` }}
								/>
							</div>
						</div>

						{/* Bottom Controls: Pause/Resume, Finish Early, Abandon */}
						<div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-800">
							{status === "RUNNING" ? (
								<button
									type="button"
									onClick={pauseSession}
									className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
								>
									<Pause size={14} />
									<span>Jeda Sesi</span>
								</button>
							) : (
								<button
									type="button"
									onClick={resumeSession}
									className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
								>
									<Play size={14} />
									<span>Lanjutkan Fokus</span>
								</button>
							)}

							<button
								type="button"
								onClick={finishEarly}
								className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
							>
								<CheckCircle2 size={14} />
								<span>Selesaikan Sesi & Catat Refleksi</span>
							</button>

							<button
								type="button"
								onClick={() => setIsAbandonModalOpen(true)}
								className="px-3.5 py-2 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
							>
								<XCircle size={14} />
								<span>Batalkan</span>
							</button>
						</div>
					</div>
				)}
			</div>

			{/* 2. KPI Metrics Bar */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<StatCard
					label="Total Sesi Sprint"
					value={totalSprintsCount}
					subtext="Sesi refleksi terdokumentasi"
					icon={Timer}
					iconColor="text-slate-500"
				/>
				<StatCard
					label="Total Waktu Belajar"
					value={`${totalMinutes} menit`}
					subtext={`Rata-rata ${
						totalSprintsCount ? Math.round(totalMinutes / totalSprintsCount) : 0
					}m / sesi`}
					icon={Timer}
					iconColor="text-blue-600"
				/>
				<StatCard
					label="Target Kebiasaan (≥25m)"
					value={`${habitReached}x`}
					subtext="Memenuhi standar habit harian"
					icon={Flame}
					iconColor="text-amber-500"
				/>
			</div>

			{/* 3. Action Bar */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-sm font-semibold text-slate-900">
						Daftar Refleksi Sprint Anda
					</h3>
					<p className="text-xs text-slate-500">
						Dokumentasi progres belajar dan link bukti submission
					</p>
				</div>

				<button
					type="button"
					onClick={() => openReflectionModal(null, 25)}
					className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
				>
					<Plus size={14} />
					<span>Catat Refleksi Manual</span>
				</button>
			</div>

			{/* 4. Sprints Stream */}
			<div className="space-y-4">
				{sprints && sprints.length > 0 ? (
					<>
						{sprints.map((sprint) => (
							<PeerFeedbackCard key={sprint.id} sprint={sprint} />
						))}

						{pagination && pagination.totalPages > 1 && (
							<Pagination
								currentPage={currentPage}
								totalPages={pagination.totalPages}
								onPageChange={(page) => updateFilters({ page })}
								pageSize={pageSize}
								totalItems={pagination.total}
								onPageSizeChange={(limit) => updateFilters({ limit, page: 1 })}
								pageSizeOptions={[5, 10, 20]}
							/>
						)}
					</>
				) : (
					<EmptyState
						icon={Timer}
						title="Belum ada catatan sprint belajar"
						description="Pilih topik di atas dan mulai sesi fokus 25 menit untuk mendokumentasikan proses belajar Anda."
						actionLabel="Mulai Sesi Fokus Pertama"
						onAction={handleStartSession}
					/>
				)}
			</div>

			{/* Abandon Session Confirm Dialog */}
			<ConfirmModal
				isOpen={isAbandonModalOpen}
				title="Batalkan Sesi Fokus?"
				description="Progres waktu pada sesi fokus ini tidak akan dicatat ke riwayat sprint Anda."
				confirmText="Ya, Batalkan Sesi"
				cancelText="Lanjutkan Belajar"
				variant="warning"
				onConfirm={() => {
					setIsAbandonModalOpen(false);
					abandonSession();
				}}
				onCancel={() => setIsAbandonModalOpen(false)}
			/>
		</div>
	);
}
