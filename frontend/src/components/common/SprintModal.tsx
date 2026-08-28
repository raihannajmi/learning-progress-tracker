import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
	BookOpen,
	Code2,
	Globe,
	HelpCircle,
	Link2,
	Sparkles,
	Timer,
	Video,
	X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import * as Yup from "yup";
import { api } from "../../lib/api.js";
import { toast } from "../../stores/toastStore.js";
import type {
	ChecklistProgressStatus,
	LearningSprint,
	RoadmapWeek,
} from "../../types/index.js";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	defaultTopicId?: string;
	defaultDurationMinutes?: number;
	sprintToEdit?: LearningSprint | null;
}

const countWords = (text?: string | null): number => {
	if (!text) return 0;
	return text.trim().split(/\s+/).filter(Boolean).length;
};

const SprintSchema = Yup.object().shape({
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

export const SprintModal: React.FC<Props> = ({
	isOpen,
	onClose,
	defaultTopicId,
	defaultDurationMinutes = 25,
	sprintToEdit,
}) => {
	const queryClient = useQueryClient();
	const [checklistUpdates, setChecklistUpdates] = useState<
		Record<string, ChecklistProgressStatus>
	>({});

	const { data: roadmapWeeks } = useQuery<RoadmapWeek[]>({
		queryKey: ["roadmap"],
		queryFn: async () => {
			const res: any = await api.get("/roadmap");
			return res.data;
		},
		enabled: isOpen,
	});

	const allTopics =
		roadmapWeeks?.flatMap((w) =>
			w.topics.map((t) => ({
				...t,
				weekNumber: w.weekNumber,
			})),
		) || [];

	const saveSprintMutation = useMutation({
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

			let sprintResult: any;
			if (sprintToEdit) {
				const res: any = await api.patch(
					`/sprints/${sprintToEdit.id}`,
					payload,
				);
				sprintResult = res.data;
			} else {
				const res: any = await api.post("/sprints", payload);
				sprintResult = res.data;
			}

			// Save all updated checklist competency statuses
			const checklistPromises = Object.entries(checklists).map(
				([checklistItemId, status]) =>
					api.post("/checklists/progress", { checklistItemId, status }),
			);
			if (checklistPromises.length > 0) {
				await Promise.allSettled(checklistPromises);
			}

			return sprintResult;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sprints"] });
			queryClient.invalidateQueries({ queryKey: ["classSprints"] });
			queryClient.invalidateQueries({ queryKey: ["studentDashboard"] });
			queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
			queryClient.invalidateQueries({ queryKey: ["roadmap"] });
			toast.success(
				sprintToEdit
					? "Jurnal sesi belajar berhasil diperbarui!"
					: "Jurnal belajar & progres kompetensi berhasil dicatat!",
			);
			setChecklistUpdates({});
			onClose();
		},
		onError: (err: any) => {
			toast.error(
				err?.response?.data?.message ||
					"Gagal menyimpan sesi belajar. Silakan coba lagi.",
			);
		},
	});

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs">
			<div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 max-h-[92dvh] overflow-y-auto space-y-5">
				{/* Modal Header */}
				<div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
							<Timer size={20} />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">
									Jurnal Pembelajaran
								</span>
								<span className="text-slate-300">•</span>
								<span className="text-[10px] font-medium text-slate-500 font-mono">
									Developer Devlog
								</span>
							</div>
							<h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
								{sprintToEdit
									? "Edit Catatan Jurnal Belajar"
									: "Catat Jurnal & Refleksi Belajar"}
							</h2>
							<p className="text-xs text-slate-500 mt-0.5">
								{sprintToEdit
									? "Perbarui narasi pemahaman konsep atau tautan bukti latihan Anda."
									: "Dokumentasikan pemahaman konsep, eksperimen kode, dan bukti praktekmu."}
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
					>
						<X size={20} />
					</button>
				</div>

				{/* Form */}
				<Formik
					enableReinitialize={true}
					initialValues={{
						topicId: sprintToEdit
							? sprintToEdit.topic?.id || ""
							: defaultTopicId || "",
						durationMinutes: sprintToEdit
							? sprintToEdit.durationMinutes
							: defaultDurationMinutes,
						whatLearned: sprintToEdit ? sprintToEdit.whatLearned : "",
						whatPracticed: sprintToEdit ? sprintToEdit.whatPracticed : "",
						confusingParts: sprintToEdit?.confusingParts || "",
						evidenceUrl: sprintToEdit?.evidenceUrl || "",
						loomUrl: sprintToEdit?.loomUrl || "",
						demoUrl: sprintToEdit?.demoUrl || "",
						evidenceType: sprintToEdit?.evidenceType || "GITHUB",
						needsFeedback: Boolean(sprintToEdit?.needsFeedback),
					}}
					validationSchema={SprintSchema}
					onSubmit={async (values) => {
						await saveSprintMutation.mutateAsync({
							values,
							checklists: checklistUpdates,
						});
					}}
				>
					{({ values, isSubmitting }) => {
						const selectedTopicObj = allTopics.find(
							(t) => t.id === values.topicId,
						);

						return (
							<Form className="space-y-5">
								{/* 1. Context & Scope Section (Topik Silabus & Durasi Waktu) */}
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

								{/* 2. Checklist Competency Section (If Selected Topic has checklist) */}
								{selectedTopicObj?.checklists &&
									selectedTopicObj.checklists.length > 0 && (
										<div className="p-4 bg-blue-50/50 border border-blue-200/70 rounded-xl space-y-3">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
													<Sparkles size={13} className="text-blue-600" />
													<span>Validasi Mandiri Checklist Kompetensi</span>
												</div>
												<span className="text-[10px] text-blue-700 font-medium">
													Tentukan level penguasaanmu
												</span>
											</div>

											<div className="space-y-2">
												{selectedTopicObj.checklists.map((ci) => {
													const currentStatus =
														checklistUpdates[ci.id] ||
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
																	const isSelected = currentStatus === opt.key;
																	return (
																		<button
																			key={opt.key}
																			type="button"
																			onClick={() =>
																				setChecklistUpdates((prev) => ({
																					...prev,
																					[ci.id]:
																						opt.key as ChecklistProgressStatus,
																				}))
																			}
																			className={`py-1 px-1.5 rounded text-[10px] font-medium transition-all text-center cursor-pointer ${
																				isSelected
																					? opt.key === "CAN_DO_INDEPENDENTLY"
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

								{/* 3. Devlog Narrative / Storytelling Section */}
								<div className="space-y-4">
									{/* Story 1: Pemahaman Konsep */}
									<div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
												<BookOpen size={14} className="text-blue-600" />
												<span>Apa konsep & insight baru yang kamu pahami?</span>
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
											Ceritakan dengan kata-katamu sendiri bagaimana konsep ini
											bekerja, logika kodenya, atau analogi pemahamannya.
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

									{/* Story 2: Praktek & Eksperimen Kode */}
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
											Ceritakan implementasi yang kamu buat: fungsi yang kamu
											coding, komponen yang berhasil dibuat jalan, atau
											eksperimen sintaks yang kamu coba.
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

									{/* Story 3: Kendala & Diskusi */}
									<div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
										<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
											<HelpCircle size={14} className="text-amber-600" />
											<span>
												Kendala / blocker yang kamu temukan? (Opsional)
											</span>
										</div>
										<p className="text-[11px] text-slate-500 leading-normal">
											Tuliskan bagian yang masih membingungkan atau error yang
											belum ketemu solusinya agar Dosen/TA dan teman kelas bisa
											bantu.
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

								{/* 4. Multi-Evidence Section */}
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

									{/* 1. GitHub (Wajib) */}
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

									{/* 2. Loom (Disarankan) */}
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
											Rekam demo jalan aplikasi & jelaskan secara lisan cara
											kerja kode yang kamu buat.
										</p>
									</div>

									{/* 3. Live Demo (Opsional) */}
									<div>
										<label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
											<span className="flex items-center gap-1.5 text-emerald-950">
												<Globe size={13} className="text-emerald-600" />
												<span>URL Live Demo / GitHub Pages (Opsional)</span>
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
										id="needsFeedback"
										className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
									/>
									<div>
										<label
											htmlFor="needsFeedback"
											className="text-xs font-semibold text-slate-800 block cursor-pointer"
										>
											Tandai untuk Asistensi & Review Dosen / TA
										</label>
										<p className="text-[11px] text-slate-500 mt-0.5">
											Submisi ini akan masuk ke antrean prioritas review dosen
											untuk evaluasi resmi.
										</p>
									</div>
								</div>

								{/* Footer Buttons */}
								<div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
									<button
										type="button"
										onClick={onClose}
										className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
									>
										Batal
									</button>
									<button
										type="submit"
										disabled={isSubmitting || saveSprintMutation.isPending}
										className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
									>
										{isSubmitting || saveSprintMutation.isPending
											? "Menyimpan Jurnal..."
											: sprintToEdit
												? "Simpan Perubahan Jurnal"
												: "Publikasikan Jurnal Belajar"}
									</button>
								</div>
							</Form>
						);
					}}
				</Formik>
			</div>
		</div>
	);
};
