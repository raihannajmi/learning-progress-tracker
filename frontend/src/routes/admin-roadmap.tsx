import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
	AlertTriangle,
	BookOpen,
	ChevronDown,
	ChevronUp,
	Edit2,
	Layers,
	Plus,
	Star,
	Trash2,
	X,
} from "lucide-react";
import React, { useState } from "react";
import * as Yup from "yup";
import { EmptyState } from "../components/common/EmptyState.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type { ChecklistItem, RoadmapWeek, Topic } from "../types/index.js";

export const Route = createFileRoute("/admin-roadmap")({
	component: AdminRoadmapPage,
});

// Validation Schemas
const WeekSchema = Yup.object().shape({
	weekNumber: Yup.number().required("Nomor minggu wajib diisi").min(1),
	title: Yup.string().required("Judul minggu wajib diisi").min(3),
	description: Yup.string().nullable(),
	isCurrent: Yup.boolean(),
});

const TopicSchema = Yup.object().shape({
	title: Yup.string().required("Judul topik wajib diisi").min(3),
	category: Yup.string().required("Kategori materi wajib dipilih"),
	sortOrder: Yup.number().default(1),
});

const ChecklistSchema = Yup.object().shape({
	statement: Yup.string().required("Pernyataan checklist wajib diisi").min(5),
	sortOrder: Yup.number().default(1),
});

function AdminRoadmapPage() {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const queryClient = useQueryClient();

	// Modal States
	const [weekModalData, setWeekModalData] = useState<{
		isOpen: boolean;
		week?: RoadmapWeek | null;
	}>({ isOpen: false, week: null });

	const [topicModalData, setTopicModalData] = useState<{
		isOpen: boolean;
		weekId: string;
		topic?: Topic | null;
	}>({ isOpen: false, weekId: "", topic: null });

	const [checklistModalData, setChecklistModalData] = useState<{
		isOpen: boolean;
		topicId: string;
		checklist?: ChecklistItem | null;
	}>({ isOpen: false, topicId: "", checklist: null });

	const [deleteModalData, setDeleteModalData] = useState<{
		isOpen: boolean;
		type: "WEEK" | "TOPIC" | "CHECKLIST";
		id: string;
		name: string;
	}>({ isOpen: false, type: "WEEK", id: "", name: "" });

	const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>(
		{},
	);

	// Auth Guard
	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		} else if (user?.role !== "ADMIN") {
			navigate({ to: "/dashboard" });
		}
	}, [isAuthenticated, user, navigate]);

	// Fetch Roadmap
	const { data: roadmapData, isLoading } = useQuery<RoadmapWeek[]>({
		queryKey: ["roadmap"],
		queryFn: async () => {
			const res: any = await api.get("/roadmap");
			return res.data;
		},
		enabled: isAuthenticated && user?.role === "ADMIN",
	});

	// Auto-expand current or first week
	React.useEffect(() => {
		if (
			roadmapData &&
			roadmapData.length > 0 &&
			Object.keys(expandedWeeks).length === 0
		) {
			const current = roadmapData.find((w) => w.isCurrent) || roadmapData[0];
			setExpandedWeeks({ [current.id]: true });
		}
	}, [roadmapData, expandedWeeks]);

	const toggleWeek = (id: string) => {
		setExpandedWeeks((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	// Mutations
	const createWeekMutation = useMutation({
		mutationFn: async (values: any) => {
			const res: any = await api.post("/admin/roadmap/weeks", values);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roadmap"] });
			setWeekModalData({ isOpen: false, week: null });
		},
	});

	const updateWeekMutation = useMutation({
		mutationFn: async ({ id, values }: { id: string; values: any }) => {
			const res: any = await api.patch(`/admin/roadmap/weeks/${id}`, values);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roadmap"] });
			setWeekModalData({ isOpen: false, week: null });
		},
	});

	const setCurrentWeekMutation = useMutation({
		mutationFn: async (id: string) => {
			const res: any = await api.patch(
				`/admin/roadmap/weeks/${id}/current`,
				{},
			);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roadmap"] });
		},
	});

	const createTopicMutation = useMutation({
		mutationFn: async (values: any) => {
			const res: any = await api.post("/admin/roadmap/topics", values);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roadmap"] });
			setTopicModalData({ isOpen: false, weekId: "", topic: null });
		},
	});

	const updateTopicMutation = useMutation({
		mutationFn: async ({ id, values }: { id: string; values: any }) => {
			const res: any = await api.patch(`/admin/roadmap/topics/${id}`, values);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roadmap"] });
			setTopicModalData({ isOpen: false, weekId: "", topic: null });
		},
	});

	const createChecklistMutation = useMutation({
		mutationFn: async (values: any) => {
			const res: any = await api.post("/admin/roadmap/checklists", values);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roadmap"] });
			setChecklistModalData({ isOpen: false, topicId: "", checklist: null });
		},
	});

	const updateChecklistMutation = useMutation({
		mutationFn: async ({ id, values }: { id: string; values: any }) => {
			const res: any = await api.patch(
				`/admin/roadmap/checklists/${id}`,
				values,
			);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roadmap"] });
			setChecklistModalData({ isOpen: false, topicId: "", checklist: null });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async ({ type, id }: { type: string; id: string }) => {
			if (type === "WEEK") await api.delete(`/admin/roadmap/weeks/${id}`);
			if (type === "TOPIC") await api.delete(`/admin/roadmap/topics/${id}`);
			if (type === "CHECKLIST")
				await api.delete(`/admin/roadmap/checklists/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roadmap"] });
			setDeleteModalData({ isOpen: false, type: "WEEK", id: "", name: "" });
		},
	});

	const getCategoryBadge = (category: string) => {
		switch (category) {
			case "HTML":
				return "text-orange-700 bg-orange-50 border-orange-200";
			case "CSS":
				return "text-sky-700 bg-sky-50 border-sky-200";
			case "JAVASCRIPT":
				return "text-amber-700 bg-amber-50 border-amber-200";
			case "BACKEND":
				return "text-emerald-700 bg-emerald-50 border-emerald-200";
			case "FULLSTACK":
				return "text-blue-700 bg-blue-50 border-blue-200";
			default:
				return "text-slate-700 bg-slate-100 border-slate-200";
		}
	};

	return (
		<div className="max-w-5xl mx-auto w-full space-y-6">
			{/* 1. Header & Primary Action */}
			<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
							Kurikulum
						</span>
						<span className="text-slate-300">•</span>
						<span className="text-xs font-medium text-slate-600">
							Syllabus Manager
						</span>
					</div>

					<h2 className="text-lg font-semibold text-slate-900 tracking-tight">
						Kelola Roadmap & Silabus
					</h2>

					<p className="text-xs text-slate-500 leading-relaxed max-w-xl">
						Buat dan kelola minggu silabus, topik materi, serta butir pernyataan
						self-assessment mandiri untuk mahasiswa.
					</p>
				</div>

				<button
					type="button"
					onClick={() => setWeekModalData({ isOpen: true, week: null })}
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
				>
					<Plus size={14} />
					<span>Tambah Minggu Silabus</span>
				</button>
			</div>

			{/* 2. Main Roadmap Weeks Accordion List */}
			{isLoading ? (
				<div className="space-y-4">
					<div className="h-20 bg-white border border-slate-200 rounded-xl animate-pulse" />
					<div className="h-44 bg-white border border-slate-200 rounded-xl animate-pulse" />
				</div>
			) : roadmapData && roadmapData.length > 0 ? (
				<div className="space-y-4">
					{roadmapData.map((week) => {
						const isExpanded = !!expandedWeeks[week.id];
						const totalChecklists = week.topics.reduce(
							(acc, t) => acc + (t.checklists?.length || 0),
							0,
						);

						return (
							<div
								key={week.id}
								className={`bg-white rounded-xl border transition-all duration-150 overflow-hidden shadow-xs ${
									week.isCurrent
										? "border-blue-300"
										: "border-slate-200 hover:border-slate-300"
								}`}
							>
								{/* Week Accordion Header */}
								<div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
									<div className="flex items-start sm:items-center gap-3">
										<button
											type="button"
											onClick={() => toggleWeek(week.id)}
											className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer mt-0.5 sm:mt-0 shrink-0"
										>
											{isExpanded ? (
												<ChevronUp size={16} />
											) : (
												<ChevronDown size={16} />
											)}
										</button>

										<div>
											<div className="flex items-center gap-2 flex-wrap">
												<span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
													Minggu {week.weekNumber}
												</span>

												{week.isCurrent && (
													<span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.2 rounded-full inline-flex items-center gap-1 font-mono">
														<Star
															size={11}
															className="fill-blue-600 text-blue-600"
														/>
														<span>Minggu Berjalan</span>
													</span>
												)}

												<span className="text-xs text-slate-400">
													{week.topics.length} Topik • {totalChecklists}{" "}
													Checklist
												</span>
											</div>

											<h3 className="text-sm font-semibold text-slate-900 mt-1">
												{week.title}
											</h3>
											{week.description && (
												<p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
													{week.description}
												</p>
											)}
										</div>
									</div>

									{/* Week Actions */}
									<div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
										{!week.isCurrent && (
											<button
												type="button"
												onClick={() => setCurrentWeekMutation.mutate(week.id)}
												disabled={setCurrentWeekMutation.isPending}
												title="Jadikan Minggu Aktif"
												className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer"
											>
												<Star size={13} />
												<span>Set Aktif</span>
											</button>
										)}

										<button
											type="button"
											onClick={() =>
												setTopicModalData({
													isOpen: true,
													weekId: week.id,
													topic: null,
												})
											}
											className="px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer"
										>
											<Plus size={13} />
											<span>Tambah Topik</span>
										</button>

										<button
											type="button"
											onClick={() => setWeekModalData({ isOpen: true, week })}
											title="Edit Minggu"
											className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
										>
											<Edit2 size={14} />
										</button>

										<button
											type="button"
											onClick={() =>
												setDeleteModalData({
													isOpen: true,
													type: "WEEK",
													id: week.id,
													name: `Minggu ${week.weekNumber}: ${week.title}`,
												})
											}
											title="Hapus Minggu"
											className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
										>
											<Trash2 size={14} />
										</button>
									</div>
								</div>

								{/* Topics & Checklists Expanded Body */}
								{isExpanded && (
									<div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4">
										{week.topics.length === 0 ? (
											<div className="text-center py-6 border border-dashed border-slate-200 rounded-lg">
												<BookOpen
													size={20}
													className="mx-auto text-slate-300 mb-1"
												/>
												<p className="text-xs text-slate-500">
													Belum ada topik materi di minggu ini.
												</p>
												<button
													type="button"
													onClick={() =>
														setTopicModalData({
															isOpen: true,
															weekId: week.id,
															topic: null,
														})
													}
													className="mt-1.5 text-xs font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
												>
													<Plus size={12} />
													<span>Tambah Topik Pertama</span>
												</button>
											</div>
										) : (
											week.topics.map((topic) => (
												<div
													key={topic.id}
													className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4 space-y-3"
												>
													{/* Topic Subheader */}
													<div className="flex items-center justify-between gap-2 flex-wrap">
														<div className="flex items-center gap-2">
															<span
																className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm border ${getCategoryBadge(
																	topic.category,
																)}`}
															>
																{topic.category}
															</span>
															<h4 className="text-xs font-semibold text-slate-900">
																{topic.title}
															</h4>
														</div>

														<div className="flex items-center gap-1">
															<button
																type="button"
																onClick={() =>
																	setChecklistModalData({
																		isOpen: true,
																		topicId: topic.id,
																		checklist: null,
																	})
																}
																className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md inline-flex items-center gap-1 transition-colors cursor-pointer"
															>
																<Plus size={12} />
																<span>+ Butir Checklist</span>
															</button>

															<button
																type="button"
																onClick={() =>
																	setTopicModalData({
																		isOpen: true,
																		weekId: week.id,
																		topic,
																	})
																}
																title="Edit Topik"
																className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
															>
																<Edit2 size={13} />
															</button>

															<button
																type="button"
																onClick={() =>
																	setDeleteModalData({
																		isOpen: true,
																		type: "TOPIC",
																		id: topic.id,
																		name: `Topik: ${topic.title}`,
																	})
																}
																title="Hapus Topik"
																className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
															>
																<Trash2 size={13} />
															</button>
														</div>
													</div>

													{/* Checklist Statements */}
													<div className="space-y-1.5 pl-2 sm:pl-3 border-l-2 border-slate-200">
														{topic.checklists && topic.checklists.length > 0 ? (
															topic.checklists.map((item, idx) => (
																<div
																	key={item.id}
																	className="group flex items-start justify-between gap-3 p-2 bg-white rounded-md border border-slate-200/60 hover:border-blue-200 text-xs transition-colors"
																>
																	<div className="flex items-start gap-2 min-w-0">
																		<span className="font-mono text-[10px] text-slate-400 mt-0.5 shrink-0">
																			#{idx + 1}
																		</span>
																		<p className="text-slate-700 leading-snug">
																			{item.statement}
																		</p>
																	</div>

																	<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
																		<button
																			type="button"
																			onClick={() =>
																				setChecklistModalData({
																					isOpen: true,
																					topicId: topic.id,
																					checklist: item,
																				})
																			}
																			className="p-1 text-slate-400 hover:text-blue-600 rounded-sm cursor-pointer"
																			title="Edit Statement"
																		>
																			<Edit2 size={12} />
																		</button>
																		<button
																			type="button"
																			onClick={() =>
																				setDeleteModalData({
																					isOpen: true,
																					type: "CHECKLIST",
																					id: item.id,
																					name: item.statement,
																				})
																			}
																			className="p-1 text-slate-400 hover:text-rose-600 rounded-sm cursor-pointer"
																			title="Hapus Butir"
																		>
																			<Trash2 size={12} />
																		</button>
																	</div>
																</div>
															))
														) : (
															<p className="text-xs text-slate-400 italic py-1">
																Belum ada checklist butir mandiri di topik ini.
															</p>
														)}
													</div>
												</div>
											))
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			) : (
				<EmptyState
					icon={Layers}
					title="Belum Ada Silabus"
					description="Mulai bangun roadmap pembelajaran semester dengan menambahkan minggu pertama."
					actionLabel="Tambah Minggu Pertama"
					onAction={() => setWeekModalData({ isOpen: true, week: null })}
				/>
			)}

			{/* Week Modal */}
			{weekModalData.isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg border border-slate-200">
						<div className="flex items-center justify-between pb-3 border-b border-slate-100">
							<h3 className="text-base font-semibold text-slate-900">
								{weekModalData.week
									? "Edit Minggu Silabus"
									: "Tambah Minggu Silabus"}
							</h3>
							<button
								type="button"
								onClick={() => setWeekModalData({ isOpen: false, week: null })}
								className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
							>
								<X size={18} />
							</button>
						</div>

						<Formik
							enableReinitialize={true}
							initialValues={{
								weekNumber:
									weekModalData.week?.weekNumber ||
									(roadmapData?.length || 0) + 1,
								title: weekModalData.week?.title || "",
								description: weekModalData.week?.description || "",
								isCurrent: weekModalData.week?.isCurrent || false,
							}}
							validationSchema={WeekSchema}
							onSubmit={async (values) => {
								if (weekModalData.week) {
									await updateWeekMutation.mutateAsync({
										id: weekModalData.week.id,
										values,
									});
								} else {
									await createWeekMutation.mutateAsync(values);
								}
							}}
						>
							{({ isSubmitting }) => (
								<Form className="space-y-4 mt-4">
									<div className="grid grid-cols-3 gap-3">
										<div>
											<label className="block text-xs font-medium text-slate-700 mb-1">
												Minggu Ke-
											</label>
											<Field
												type="number"
												name="weekNumber"
												className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
											/>
											<ErrorMessage
												name="weekNumber"
												component="div"
												className="text-rose-500 text-[11px] mt-0.5"
											/>
										</div>

										<div className="col-span-2">
											<label className="block text-xs font-medium text-slate-700 mb-1">
												Judul Minggu Silabus
											</label>
											<Field
												type="text"
												name="title"
												placeholder="Contoh: CSS Flexbox & Grid"
												className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
											/>
											<ErrorMessage
												name="title"
												component="div"
												className="text-rose-500 text-[11px] mt-0.5"
											/>
										</div>
									</div>

									<div>
										<label className="block text-xs font-medium text-slate-700 mb-1">
											Deskripsi Capaian
										</label>
										<Field
											as="textarea"
											name="description"
											rows={3}
											placeholder="Ringkasan apa yang akan dipelajari mahasiswa pada minggu ini..."
											className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
										/>
									</div>

									<div className="flex items-center gap-2">
										<Field
											type="checkbox"
											name="isCurrent"
											id="isCurrentWeek"
											className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
										/>
										<label
											htmlFor="isCurrentWeek"
											className="text-xs text-slate-700 cursor-pointer"
										>
											Jadikan minggu berjalan aktif saat ini
										</label>
									</div>

									<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
										<button
											type="button"
											onClick={() =>
												setWeekModalData({ isOpen: false, week: null })
											}
											className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
										>
											Batal
										</button>
										<button
											type="submit"
											disabled={isSubmitting}
											className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs disabled:opacity-50 cursor-pointer"
										>
											{isSubmitting ? "Menyimpan..." : "Simpan Minggu"}
										</button>
									</div>
								</Form>
							)}
						</Formik>
					</div>
				</div>
			)}

			{/* Topic Modal */}
			{topicModalData.isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg border border-slate-200">
						<div className="flex items-center justify-between pb-3 border-b border-slate-100">
							<h3 className="text-base font-semibold text-slate-900">
								{topicModalData.topic
									? "Edit Topik Materi"
									: "Tambah Topik Materi"}
							</h3>
							<button
								type="button"
								onClick={() =>
									setTopicModalData({ isOpen: false, weekId: "", topic: null })
								}
								className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
							>
								<X size={18} />
							</button>
						</div>

						<Formik
							enableReinitialize={true}
							initialValues={{
								title: topicModalData.topic?.title || "",
								category: topicModalData.topic?.category || "HTML",
								sortOrder: topicModalData.topic?.sortOrder || 1,
							}}
							validationSchema={TopicSchema}
							onSubmit={async (values) => {
								if (topicModalData.topic) {
									await updateTopicMutation.mutateAsync({
										id: topicModalData.topic.id,
										values,
									});
								} else {
									await createTopicMutation.mutateAsync({
										weekId: topicModalData.weekId,
										...values,
									});
								}
							}}
						>
							{({ isSubmitting }) => (
								<Form className="space-y-4 mt-4">
									<div>
										<label className="block text-xs font-medium text-slate-700 mb-1">
											Judul Topik
										</label>
										<Field
											type="text"
											name="title"
											placeholder="Contoh: Modern CSS Grid Layout"
											className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
										/>
										<ErrorMessage
											name="title"
											component="div"
											className="text-rose-500 text-[11px] mt-0.5"
										/>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="block text-xs font-medium text-slate-700 mb-1">
												Kategori Materi
											</label>
											<Field
												as="select"
												name="category"
												className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
											>
												<option value="HTML">HTML</option>
												<option value="CSS">CSS</option>
												<option value="JAVASCRIPT">JavaScript</option>
												<option value="BACKEND">Backend</option>
												<option value="FULLSTACK">Fullstack</option>
											</Field>
										</div>

										<div>
											<label className="block text-xs font-medium text-slate-700 mb-1">
												Urutan Tampil
											</label>
											<Field
												type="number"
												name="sortOrder"
												className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
											/>
										</div>
									</div>

									<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
										<button
											type="button"
											onClick={() =>
												setTopicModalData({
													isOpen: false,
													weekId: "",
													topic: null,
												})
											}
											className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
										>
											Batal
										</button>
										<button
											type="submit"
											disabled={isSubmitting}
											className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs disabled:opacity-50 cursor-pointer"
										>
											{isSubmitting ? "Menyimpan..." : "Simpan Topik"}
										</button>
									</div>
								</Form>
							)}
						</Formik>
					</div>
				</div>
			)}

			{/* Checklist Item Modal */}
			{checklistModalData.isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg border border-slate-200">
						<div className="flex items-center justify-between pb-3 border-b border-slate-100">
							<h3 className="text-base font-semibold text-slate-900">
								{checklistModalData.checklist
									? "Edit Butir Checklist"
									: "Tambah Butir Checklist Mandiri"}
							</h3>
							<button
								type="button"
								onClick={() =>
									setChecklistModalData({
										isOpen: false,
										topicId: "",
										checklist: null,
									})
								}
								className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
							>
								<X size={18} />
							</button>
						</div>

						<Formik
							enableReinitialize={true}
							initialValues={{
								statement: checklistModalData.checklist?.statement || "",
								sortOrder: checklistModalData.checklist?.sortOrder || 1,
							}}
							validationSchema={ChecklistSchema}
							onSubmit={async (values) => {
								if (checklistModalData.checklist) {
									await updateChecklistMutation.mutateAsync({
										id: checklistModalData.checklist.id,
										values,
									});
								} else {
									await createChecklistMutation.mutateAsync({
										topicId: checklistModalData.topicId,
										...values,
									});
								}
							}}
						>
							{({ isSubmitting }) => (
								<Form className="space-y-4 mt-4">
									<div>
										<label className="block text-xs font-medium text-slate-700 mb-1">
											Pernyataan Kemampuan Mandiri
										</label>
										<Field
											as="textarea"
											name="statement"
											rows={3}
											placeholder="Contoh: Saya dapat membuat grid responsif menggunakan repeat(auto-fit, minmax(...))"
											className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
										/>
										<ErrorMessage
											name="statement"
											component="div"
											className="text-rose-500 text-[11px] mt-0.5"
										/>
									</div>

									<div>
										<label className="block text-xs font-medium text-slate-700 mb-1">
											Urutan Butir
										</label>
										<Field
											type="number"
											name="sortOrder"
											className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
										/>
									</div>

									<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
										<button
											type="button"
											onClick={() =>
												setChecklistModalData({
													isOpen: false,
													topicId: "",
													checklist: null,
												})
											}
											className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
										>
											Batal
										</button>
										<button
											type="submit"
											disabled={isSubmitting}
											className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs disabled:opacity-50 cursor-pointer"
										>
											{isSubmitting ? "Menyimpan..." : "Simpan Checklist"}
										</button>
									</div>
								</Form>
							)}
						</Formik>
					</div>
				</div>
			)}

			{/* Delete Confirmation Dialog Modal */}
			{deleteModalData.isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-lg border border-slate-200 text-center">
						<div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
							<AlertTriangle size={20} />
						</div>
						<h3 className="text-sm font-semibold text-slate-900">
							Konfirmasi Hapus
						</h3>
						<p className="text-xs text-slate-600 mt-1 leading-relaxed">
							Apakah Anda yakin ingin menghapus{" "}
							<strong>"{deleteModalData.name}"</strong>?
						</p>
						<p className="text-[11px] text-rose-600 mt-1">
							Tindakan ini tidak dapat dibatalkan.
						</p>

						<div className="flex justify-center gap-2 mt-5">
							<button
								type="button"
								onClick={() =>
									setDeleteModalData({
										isOpen: false,
										type: "WEEK",
										id: "",
										name: "",
									})
								}
								className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={() =>
									deleteMutation.mutate({
										type: deleteModalData.type,
										id: deleteModalData.id,
									})
								}
								disabled={deleteMutation.isPending}
								className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs disabled:opacity-50 cursor-pointer"
							>
								{deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
