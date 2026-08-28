import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import {
	AlertCircle,
	CheckCircle2,
	ChevronRight,
	ClipboardCheck,
	Code2,
	ExternalLink,
	Eye,
	Flame,
	Globe,
	HelpCircle,
	MessageSquare,
	MessageSquareQuote,
	Timer,
	Users,
	Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "../components/common/EmptyState.js";
import { SelectDropdown } from "../components/common/SelectDropdown.js";
import { StatCard } from "../components/common/StatCard.js";
import { StudentDetailModal } from "../components/common/StudentDetailModal.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type {
	AdminDashboardData,
	ClassGroup,
	PaginatedResponse,
	ReviewQueueItem,
} from "../types/index.js";

type AdminTab = "confusions" | "attention" | "activity";

interface AdminSearchParams {
	classId?: string;
	tab?: AdminTab;
}

export const Route = createFileRoute("/admin")({
	validateSearch: (search: Record<string, unknown>): AdminSearchParams => {
		return {
			classId: (search.classId as string) || undefined,
			tab: ["confusions", "attention", "activity"].includes(
				search.tab as string,
			)
				? (search.tab as AdminTab)
				: "confusions",
		};
	},
	component: AdminDashboardPage,
});

// Indonesian relative time formatter
function formatRelativeTime(dateString?: string | Date | null): string {
	if (!dateString) return "Belum pernah aktif";
	const now = new Date();
	const past = new Date(dateString);
	const diffMs = now.getTime() - past.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHours = Math.floor(diffMin / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSec < 60) return "Baru saja";
	if (diffMin < 60) return `${diffMin}m lalu`;
	if (diffHours < 24) return `${diffHours}j lalu`;
	if (diffDays === 1) return "Kemarin";
	if (diffDays < 7) return `${diffDays}h lalu`;
	return past.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
	});
}

function AdminDashboardPage() {
	const navigate = useNavigate();
	const searchParams = useSearch({ from: "/admin" });
	const { user, isAuthenticated } = useAuthStore();

	const selectedClassId = searchParams.classId || "";
	const currentTab: AdminTab = searchParams.tab || "confusions";

	// Inspected student for detail modal
	const [inspectedStudent, setInspectedStudent] = useState<any | null>(null);

	useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		} else if (user?.role !== "ADMIN") {
			navigate({ to: "/dashboard" });
		}
	}, [isAuthenticated, user, navigate]);

	// Fetch classes for dropdown filter
	const { data: classesList } = useQuery<ClassGroup[]>({
		queryKey: ["classes"],
		queryFn: async () => {
			const res: any = await api.get("/classes");
			return res.data;
		},
	});

	// Fetch TA Dashboard metrics
	const { data, isLoading } = useQuery<AdminDashboardData>({
		queryKey: ["adminDashboard", { classId: selectedClassId }],
		queryFn: async () => {
			const param = selectedClassId ? `?classId=${selectedClassId}` : "";
			const res: any = await api.get(`/dashboard/admin${param}`);
			return res.data;
		},
	});

	// Fetch Pending Reviews count
	const { data: reviewQueueData } = useQuery<
		PaginatedResponse<ReviewQueueItem>
	>({
		queryKey: ["adminReviewQueueCount", { classId: selectedClassId }],
		queryFn: async () => {
			const param = selectedClassId ? `&classId=${selectedClassId}` : "";
			const res: any = await api.get(
				`/sprints/reviews?status=PENDING&limit=1${param}`,
			);
			return res;
		},
	});

	const pendingReviewsCount = reviewQueueData?.pagination?.total ?? 0;

	const handleTabChange = (newTab: AdminTab) => {
		navigate({
			to: "/admin",
			search: {
				...searchParams,
				tab: newTab,
			},
		});
	};

	const handleClassChange = (newClassId: string) => {
		navigate({
			to: "/admin",
			search: {
				...searchParams,
				classId: newClassId || undefined,
			},
		});
	};

	if (isLoading) {
		return (
			<div className="max-w-5xl mx-auto w-full space-y-6">
				<div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="h-24 bg-slate-100 rounded-xl animate-pulse"
						/>
					))}
				</div>
				<div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
			</div>
		);
	}

	if (!data) return null;

	const activePercent =
		data.totalStudents > 0
			? Math.round((data.activeStudentsThisWeek / data.totalStudents) * 100)
			: 0;

	const confusions = data.commonConfusions || [];
	const studentsNeedingAttention = data.studentsNeedingAttention || [];
	const recentEvidences = data.recentEvidences || [];

	return (
		<div className="max-w-5xl mx-auto w-full space-y-7 min-w-0 max-w-full pb-12">
			{/* 1. Header with Class Selector & Quick Review CTA */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 min-w-0">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md bg-blue-100 text-blue-800 border border-blue-200">
							Pusat Kendali Asistensi
						</span>
						<span className="text-xs text-slate-400 font-mono">
							Semester 2026/2027 Ganjil
						</span>
					</div>
					<h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
						Monitoring & Kesehatan Belajar Kelas
					</h1>
					<p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
						Pantau kebiasaan fokus mahasiswa, identifikasi materi yang
						membingungkan secara cepat, dan berikan intervensi asistensi
						langsung.
					</p>
				</div>

				{/* Class Selector & Direct Review Link */}
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
					<div className="w-full sm:w-56">
						<SelectDropdown
							value={selectedClassId}
							onChange={handleClassChange}
							placeholder="Semua Kelas Mahasiswa"
							allowClear
							options={[
								{ value: "", label: "Semua Kelas Mahasiswa" },
								...(classesList?.map((cls) => ({
									value: cls.id,
									label: cls.name,
									badge: cls.academicTerm,
								})) || []),
							]}
						/>
					</div>

					<Link
						to="/admin-review"
						search={{ classId: selectedClassId || undefined }}
						className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-all shrink-0 cursor-pointer"
					>
						<ClipboardCheck size={15} />
						<span>Antrean Review</span>
						{pendingReviewsCount > 0 && (
							<span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 rounded-full text-[10px] font-bold font-mono">
								{pendingReviewsCount}
							</span>
						)}
					</Link>
				</div>
			</div>

			{/* 2. Executive KPI Overview */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
				<StatCard
					label="Mahasiswa Aktif Minggu Ini"
					value={`${data.activeStudentsThisWeek} / ${data.totalStudents}`}
					subtext={`${activePercent}% aktif sprint belajar`}
					icon={Users}
					iconColor="text-blue-600"
				/>
				<StatCard
					label="Total Learning Sprints"
					value={data.totalSprints}
					subtext="Sesi fokus tercatat"
					icon={Timer}
					iconColor="text-emerald-600"
				/>
				<StatCard
					label="Tanggapan & Diskusi"
					value={data.totalFeedbackGiven}
					subtext="Peer & Dosen feedback"
					icon={MessageSquare}
					iconColor="text-sky-600"
				/>
				<StatCard
					label="Perlu Perhatian"
					value={studentsNeedingAttention.length}
					subtext="Tidak aktif ≥7 hari"
					icon={AlertCircle}
					iconColor={
						studentsNeedingAttention.length > 0
							? "text-rose-600"
							: "text-slate-400"
					}
				/>
			</div>

			{/* 3. In-Page Tab Navigation (Unified Workspace) */}
			<div className="space-y-5">
				{/* Tab Header Switcher */}
				<div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto [scrollbar-width:none]">
					<button
						type="button"
						onClick={() => handleTabChange("confusions")}
						className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
							currentTab === "confusions"
								? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
								: "text-slate-600 hover:text-slate-900 hover:bg-slate-50/60"
						}`}
					>
						<HelpCircle size={15} className="text-amber-500" />
						<span>Hambatan Materi Belajar</span>
						<span
							className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
								currentTab === "confusions"
									? "bg-amber-100 text-amber-800"
									: "bg-slate-200 text-slate-600"
							}`}
						>
							{confusions.length}
						</span>
					</button>

					<button
						type="button"
						onClick={() => handleTabChange("attention")}
						className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
							currentTab === "attention"
								? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
								: "text-slate-600 hover:text-slate-900 hover:bg-slate-50/60"
						}`}
					>
						<AlertCircle
							size={15}
							className={
								studentsNeedingAttention.length > 0
									? "text-rose-500"
									: "text-slate-400"
							}
						/>
						<span>Mahasiswa Perlu Perhatian</span>
						<span
							className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
								currentTab === "attention"
									? "bg-rose-100 text-rose-800"
									: "bg-slate-200 text-slate-600"
							}`}
						>
							{studentsNeedingAttention.length}
						</span>
					</button>

					<button
						type="button"
						onClick={() => handleTabChange("activity")}
						className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
							currentTab === "activity"
								? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
								: "text-slate-600 hover:text-slate-900 hover:bg-slate-50/60"
						}`}
					>
						<Flame size={15} className="text-blue-500" />
						<span>Log Aktivitas & Bukti Terbaru</span>
						<span
							className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
								currentTab === "activity"
									? "bg-blue-100 text-blue-800"
									: "bg-slate-200 text-slate-600"
							}`}
						>
							{recentEvidences.length}
						</span>
					</button>
				</div>

				{/* Tab 1 Content: Hambatan Materi Belajar */}
				{currentTab === "confusions" && (
					<div className="space-y-4">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl">
							<div className="flex items-start gap-3">
								<HelpCircle
									size={18}
									className="text-amber-600 shrink-0 mt-0.5"
								/>
								<div>
									<h2 className="text-xs font-bold text-amber-950">
										Analisis Hambatan Materi & Blocker Pembelajaran
									</h2>
									<p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
										Daftar topik yang dilaporkan membingungkan oleh mahasiswa
										pada jurnal sprint. Gunakan wawasan ini untuk mengulang
										penjelasan di kelas atau sesi asistensi.
									</p>
								</div>
							</div>
						</div>

						{confusions.length === 0 ? (
							<EmptyState
								icon={CheckCircle2}
								title="Tidak Ada Hambatan Materi yang Dilaporkan"
								description="Mahasiswa di kelas ini tidak mencatat kendala pemahaman materi pada jurnal sprint terbaru mereka."
							/>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{confusions.map((c, index) => (
									<div
										key={c.topicTitle || c.topic || index}
										className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3.5 flex flex-col justify-between"
									>
										<div className="space-y-2">
											<div className="flex items-start justify-between gap-3">
												<div className="space-y-0.5">
													<span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
														Topik #{index + 1}
													</span>
													<h3 className="text-sm font-bold text-slate-900">
														{c.topicTitle || c.topic}
													</h3>
												</div>
												<span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 shrink-0">
													<Users size={12} />
													<span>{c.mentions} mahasiswa</span>
												</span>
											</div>

											{/* Verbatim quotes from students */}
											{c.examples && c.examples.length > 0 && (
												<div className="space-y-1.5 pt-1">
													<span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
														Catatan Refleksi Mahasiswa:
													</span>
													<div className="space-y-1.5">
														{c.examples.map((example, i) => (
															<div
																key={i}
																className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-700 flex items-start gap-2"
															>
																<MessageSquareQuote
																	size={13}
																	className="text-slate-400 shrink-0 mt-0.5"
																/>
																<p className="italic text-[11px] leading-relaxed line-clamp-3">
																	"{example}"
																</p>
															</div>
														))}
													</div>
												</div>
											)}
										</div>

										<div className="pt-2 border-t border-slate-100 flex items-center justify-between">
											<span className="text-[11px] text-slate-400">
												Prioritas asistensi materi
											</span>
											<Link
												to="/class"
												search={{ classId: selectedClassId || undefined }}
												className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
											>
												<span>Bahas di Forum Kelas</span>
												<ChevronRight size={13} />
											</Link>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Tab 2 Content: Mahasiswa Perlu Perhatian */}
				{currentTab === "attention" && (
					<div className="space-y-4">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-rose-50/60 border border-rose-200/70 rounded-xl">
							<div className="flex items-start gap-3">
								<AlertCircle
									size={18}
									className="text-rose-600 shrink-0 mt-0.5"
								/>
								<div>
									<h2 className="text-xs font-bold text-rose-950">
										Deteksi Dini Mahasiswa Pasif (Inactivity Tracker)
									</h2>
									<p className="text-[11px] text-rose-800/90 mt-0.5 leading-relaxed">
										Daftar mahasiswa yang belum mencatatkan sprint belajar dalam
										7 hari terakhir. Lakukan pengecekan portofolio atau kontak
										langsung untuk memberikan dorongan belajar.
									</p>
								</div>
							</div>
						</div>

						{studentsNeedingAttention.length === 0 ? (
							<EmptyState
								icon={CheckCircle2}
								title="Seluruh Mahasiswa Aktif Belajar!"
								description="Hebat! Tidak ada mahasiswa yang pasif lebih dari 7 hari di kelas ini. Semua mahasiswa aktif menyelesaikan sprint belajar."
							/>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{studentsNeedingAttention.map((s) => (
									<div
										key={s.id}
										className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3.5 flex flex-col justify-between"
									>
										<div className="flex items-start gap-3.5">
											{/* Avatar */}
											<div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
												{s.avatarUrl ? (
													<img
														src={s.avatarUrl}
														alt={s.name}
														className="w-full h-full object-cover rounded-xl"
													/>
												) : (
													s.name.charAt(0).toUpperCase()
												)}
											</div>

											<div className="min-w-0 flex-1 space-y-1">
												<div className="flex items-center justify-between gap-2">
													<h3 className="text-sm font-bold text-slate-900 truncate">
														{s.name}
													</h3>
													<span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 shrink-0">
														Pasif
													</span>
												</div>

												<p className="text-xs text-slate-500 truncate">
													{s.email}
												</p>

												<div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
													{s.nim && (
														<span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
															NIM: {s.nim}
														</span>
													)}
													<span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
														{s.className || "Tanpa Kelas"}
													</span>
													<span className="text-rose-600 font-medium">
														•{" "}
														{s.statusLabel ||
															`Terakhir: ${formatRelativeTime(s.lastActivity)}`}
													</span>
												</div>
											</div>
										</div>

										<div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
											<button
												type="button"
												onClick={() => setInspectedStudent(s)}
												className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
											>
												<Eye size={13} />
												<span>Inspeksi Progres Belajar</span>
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Tab 3 Content: Log Aktivitas & Bukti Belajar */}
				{currentTab === "activity" && (
					<div className="space-y-4">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-blue-50/60 border border-blue-200/70 rounded-xl">
							<div className="flex items-start gap-3">
								<Flame size={18} className="text-blue-600 shrink-0 mt-0.5" />
								<div>
									<h2 className="text-xs font-bold text-blue-950">
										Log Aktivitas Sesi Fokus & Bukti Pembelajaran
									</h2>
									<p className="text-[11px] text-blue-800/90 mt-0.5 leading-relaxed">
										Daftar submisi sprint terbaru mahasiswa lengkap dengan
										durasi habit, jurnal refleksi, dan link bukti repositori
										GitHub / Loom / Demo.
									</p>
								</div>
							</div>
						</div>

						{recentEvidences.length === 0 ? (
							<EmptyState
								icon={Timer}
								title="Belum Ada Aktivitas Sesi Belajar"
								description="Belum ada mahasiswa yang mencatatkan sprint belajar di kelas ini."
							/>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{recentEvidences.map((ev) => (
									<div
										key={ev.id}
										className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3.5 flex flex-col justify-between"
									>
										<div className="space-y-2.5">
											<div className="flex items-start justify-between gap-2">
												<div>
													<h3 className="text-sm font-bold text-slate-900 truncate">
														{ev.studentName}
													</h3>
													<p className="text-[11px] text-slate-500 font-mono">
														{ev.className} • {formatRelativeTime(ev.createdAt)}
													</p>
												</div>

												{ev.durationMinutes && (
													<span
														className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
															ev.durationMinutes >= 25
																? "bg-emerald-50 text-emerald-700 border-emerald-200"
																: "bg-slate-100 text-slate-600 border-slate-200"
														}`}
													>
														<Timer size={12} />
														<span>{ev.durationMinutes}m</span>
													</span>
												)}
											</div>

											<div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs text-slate-700 space-y-1">
												<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
													Insight Pembelajaran:
												</span>
												<p className="line-clamp-3 leading-relaxed text-slate-800">
													{ev.whatLearned}
												</p>
											</div>

											{/* Multi-Evidence Links */}
											<div className="flex flex-wrap items-center gap-2 pt-1">
												{ev.evidenceUrl && (
													<a
														href={ev.evidenceUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
													>
														<Code2 size={12} />
														<span>GitHub Repo</span>
														<ExternalLink size={10} />
													</a>
												)}

												{ev.loomUrl && (
													<a
														href={ev.loomUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
													>
														<Video size={12} />
														<span>Loom Video</span>
														<ExternalLink size={10} />
													</a>
												)}

												{ev.demoUrl && (
													<a
														href={ev.demoUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
													>
														<Globe size={12} />
														<span>Live Demo</span>
														<ExternalLink size={10} />
													</a>
												)}
											</div>
										</div>

										<div className="pt-2 border-t border-slate-100 flex items-center justify-between">
											<span className="text-[11px] text-slate-400 font-mono">
												Tercatat di sistem
											</span>
											<Link
												to="/class"
												search={{ classId: selectedClassId || undefined }}
												className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
											>
												<span>Buka di Feed Diskusi</span>
												<ChevronRight size={13} />
											</Link>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Student Detail Modal */}
			<StudentDetailModal
				isOpen={!!inspectedStudent}
				onClose={() => setInspectedStudent(null)}
				student={inspectedStudent}
			/>
		</div>
	);
}
