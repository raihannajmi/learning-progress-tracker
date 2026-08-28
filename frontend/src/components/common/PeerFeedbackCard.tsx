import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	ArrowUpRight,
	BookOpen,
	Check,
	Code2,
	Edit2,
	Flame,
	Globe,
	HelpCircle,
	MessageSquare,
	MoreHorizontal,
	Send,
	Trash2,
	Video,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { api } from "../../lib/api.js";
import { useAuthStore } from "../../stores/authStore.js";
import { toast } from "../../stores/toastStore.js";
import type { LearningSprint, PeerFeedback } from "../../types/index.js";
import { ConfirmModal } from "./ConfirmModal.js";
import { SprintModal } from "./SprintModal.js";

interface Props {
	sprint: LearningSprint;
}

// Indonesian relative time formatter
function formatRelativeTime(dateString: string): string {
	const now = new Date();
	const past = new Date(dateString);
	const diffMs = now.getTime() - past.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHours = Math.floor(diffMin / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSec < 45) return "baru saja";
	if (diffMin < 60) return `${diffMin}m lalu`;
	if (diffHours < 24) return `${diffHours}j lalu`;
	if (diffDays === 1) return "kemarin";
	if (diffDays < 7) return `${diffDays}h lalu`;

	return past.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
	});
}

export const PeerFeedbackCard: React.FC<Props> = ({ sprint }) => {
	const { user } = useAuthStore();
	const queryClient = useQueryClient();

	const [commentText, setCommentText] = useState("");
	const [showAllComments, setShowAllComments] = useState(false);

	// Comment inline edit & delete state
	const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(
		null,
	);
	const [editingFeedbackText, setEditingFeedbackText] = useState("");
	const [feedbackToDelete, setFeedbackToDelete] = useState<PeerFeedback | null>(
		null,
	);

	// Sprint post edit & delete state
	const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
	const [isEditSprintModalOpen, setIsEditSprintModalOpen] = useState(false);
	const [isDeleteSprintConfirmOpen, setIsDeleteSprintConfirmOpen] =
		useState(false);

	// Active comment menu popover
	const [activeCommentMenuId, setActiveCommentMenuId] = useState<string | null>(
		null,
	);

	const isSprintOwner = user?.id === sprint.user?.id || user?.role === "ADMIN";

	// 1. Add Feedback Mutation
	const addFeedbackMutation = useMutation({
		mutationFn: async (comment: string) => {
			const res: any = await api.post(`/sprints/${sprint.id}/feedbacks`, {
				comment,
			});
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sprints"] });
			queryClient.invalidateQueries({ queryKey: ["classSprints"] });
			queryClient.invalidateQueries({ queryKey: ["adminActivities"] });
			queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
			queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
			setCommentText("");
			toast.success("Tanggapan berhasil dikirim!");
		},
		onError: (err: any) => {
			toast.error(
				err?.response?.data?.message ||
					"Gagal mengirim tanggapan. Silakan coba lagi.",
			);
		},
	});

	// 2. Edit Feedback Mutation
	const editFeedbackMutation = useMutation({
		mutationFn: async ({
			feedbackId,
			comment,
		}: {
			feedbackId: string;
			comment: string;
		}) => {
			const res: any = await api.patch(
				`/sprints/${sprint.id}/feedbacks/${feedbackId}`,
				{ comment },
			);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sprints"] });
			queryClient.invalidateQueries({ queryKey: ["classSprints"] });
			queryClient.invalidateQueries({ queryKey: ["adminActivities"] });
			queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
			queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
			setEditingFeedbackId(null);
			setEditingFeedbackText("");
			toast.success("Komentar berhasil diperbarui!");
		},
		onError: (err: any) => {
			toast.error(
				err?.response?.data?.message || "Gagal memperbarui komentar.",
			);
		},
	});

	// 3. Delete Feedback Mutation
	const deleteFeedbackMutation = useMutation({
		mutationFn: async (feedbackId: string) => {
			const res: any = await api.delete(
				`/sprints/${sprint.id}/feedbacks/${feedbackId}`,
			);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sprints"] });
			queryClient.invalidateQueries({ queryKey: ["classSprints"] });
			queryClient.invalidateQueries({ queryKey: ["adminActivities"] });
			queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
			queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
			setFeedbackToDelete(null);
			toast.success("Komentar berhasil dihapus!");
		},
		onError: (err: any) => {
			toast.error(err?.response?.data?.message || "Gagal menghapus komentar.");
		},
	});

	// 4. Delete Sprint Mutation
	const deleteSprintMutation = useMutation({
		mutationFn: async () => {
			const res: any = await api.delete(`/sprints/${sprint.id}`);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sprints"] });
			queryClient.invalidateQueries({ queryKey: ["classSprints"] });
			queryClient.invalidateQueries({ queryKey: ["adminActivities"] });
			queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
			queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
			queryClient.invalidateQueries({ queryKey: ["classSprints"] });
			queryClient.invalidateQueries({ queryKey: ["studentDashboard"] });
			queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
			setIsDeleteSprintConfirmOpen(false);
			toast.success("Sesi belajar berhasil dihapus!");
		},
		onError: (err: any) => {
			toast.error(
				err?.response?.data?.message || "Gagal menghapus sesi belajar.",
			);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!commentText.trim()) return;
		addFeedbackMutation.mutate(commentText.trim());
	};

	const handleStartEditFeedback = (fb: PeerFeedback) => {
		setEditingFeedbackId(fb.id);
		setEditingFeedbackText(fb.comment);
		setActiveCommentMenuId(null);
	};

	const handleSaveEditFeedback = (feedbackId: string) => {
		if (!editingFeedbackText.trim()) return;
		editFeedbackMutation.mutate({
			feedbackId,
			comment: editingFeedbackText.trim(),
		});
	};

	const student = sprint.user || {
		name: "Mahasiswa",
		avatarUrl: null,
		className: null,
		nim: null,
	};

	const isHabit = sprint.durationMinutes >= 25;
	const feedbacks = sprint.feedbacks || [];

	// Messenger Thread Order: Chronological ascending (oldest on top -> newest at bottom)
	const sortedFeedbacks = useMemo(() => {
		return [...feedbacks].sort(
			(a, b) =>
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		);
	}, [feedbacks]);

	// Progressive Disclosure: show last 2 most recent comments by default, or all
	const displayedFeedbacks = showAllComments
		? sortedFeedbacks
		: sortedFeedbacks.slice(-2);

	return (
		<article className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 md:p-6 space-y-4 transition-all">
			{/* 1. Author Header & Post Meta */}
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-center gap-3 min-w-0">
					<div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 shrink-0">
						{student.avatarUrl ? (
							<img
								src={student.avatarUrl}
								alt={student.name}
								className="w-full h-full object-cover rounded-full"
							/>
						) : (
							student.name.charAt(0).toUpperCase()
						)}
					</div>

					<div className="min-w-0 space-y-0.5">
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-xs font-bold text-slate-900 truncate">
								{student.name}
							</span>
							{student.className && (
								<span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-sm">
									{student.className}
								</span>
							)}
							{sprint.needsFeedback && (
								<span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-mono">
									<HelpCircle size={11} className="text-amber-500" />
									<span>Minta Asistensi Dosen</span>
								</span>
							)}
						</div>

						<p className="text-[11px] text-slate-400 font-normal">
							{formatRelativeTime(sprint.createdAt)} •{" "}
							{new Date(sprint.createdAt).toLocaleDateString("id-ID", {
								day: "numeric",
								month: "short",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
					</div>
				</div>

				{/* Right: Duration Pill & Post Owner Action Menu */}
				<div className="flex items-center gap-2 shrink-0">
					{isHabit ? (
						<span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-0.5">
							<Flame size={12} className="text-amber-500" />
							<span>{sprint.durationMinutes}m Fokus</span>
						</span>
					) : (
						<span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
							{sprint.durationMinutes}m
						</span>
					)}

					{/* Sprint Post Actions Menu (For author or Admin) */}
					{isSprintOwner && (
						<div className="relative">
							<button
								type="button"
								onClick={() => setIsPostMenuOpen(!isPostMenuOpen)}
								className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
								title="Opsi Sesi Belajar"
							>
								<MoreHorizontal size={16} />
							</button>

							{isPostMenuOpen && (
								<>
									<button
										type="button"
										aria-label="Tutup menu opsi"
										className="fixed inset-0 z-20 cursor-default border-0 w-full h-full"
										onClick={() => setIsPostMenuOpen(false)}
									/>
									<div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 text-xs">
										<button
											type="button"
											onClick={() => {
												setIsPostMenuOpen(false);
												setIsEditSprintModalOpen(true);
											}}
											className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
										>
											<Edit2 size={13} className="text-slate-500" />
											<span>Edit Sesi Belajar</span>
										</button>
										<button
											type="button"
											onClick={() => {
												setIsPostMenuOpen(false);
												setIsDeleteSprintConfirmOpen(true);
											}}
											className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
										>
											<Trash2 size={13} className="text-rose-500" />
											<span>Hapus Sesi Belajar</span>
										</button>
									</div>
								</>
							)}
						</div>
					)}
				</div>
			</div>

			{/* 2. Topic Indicator */}
			{sprint.topic && (
				<div className="flex items-center gap-2">
					<span className="text-[10px] font-mono font-bold uppercase text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-sm">
						{sprint.topic.category}
					</span>
					<span className="text-xs font-semibold text-slate-800">
						{sprint.topic.title}
					</span>
				</div>
			)}

			{/* 3. Reflection Chat Bubbles & Narrative Cards */}
			<div className="space-y-2.5">
				{/* Bubble 1: Apa yang dipelajari */}
				<div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl rounded-tl-xs space-y-1.5 shadow-2xs">
					<div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-900">
						<BookOpen size={13} className="text-blue-600 shrink-0" />
						<span className="font-mono uppercase tracking-wider text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.2 rounded-xs border border-blue-200">
							Konsep
						</span>
						<span>Apa yang dipelajari:</span>
					</div>
					<p className="text-xs text-slate-700 leading-relaxed break-words whitespace-pre-wrap pl-3.5 border-l-2 border-blue-300">
						{sprint.whatLearned}
					</p>
				</div>

				{/* Bubble 2: Apa yang dibuat / dipraktekkan */}
				<div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl rounded-tl-xs space-y-1.5 shadow-2xs">
					<div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-900">
						<Code2 size={13} className="text-emerald-600 shrink-0" />
						<span className="font-mono uppercase tracking-wider text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded-xs border border-emerald-200">
							Praktek
						</span>
						<span>Apa yang dibuat / dipraktekkan:</span>
					</div>
					<p className="text-xs text-slate-700 leading-relaxed break-words whitespace-pre-wrap pl-3.5 border-l-2 border-emerald-300">
						{sprint.whatPracticed}
					</p>
				</div>

				{/* Bubble 3: Kendala / Pertanyaan (Opsional) */}
				{sprint.confusingParts && (
					<div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl rounded-tl-xs space-y-1.5 shadow-2xs">
						<div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900">
							<HelpCircle size={13} className="text-amber-600 shrink-0" />
							<span className="font-mono uppercase tracking-wider text-[10px] text-amber-800 font-bold bg-amber-100/70 px-1.5 py-0.2 rounded-xs border border-amber-300">
								Kendala
							</span>
							<span>Kendala / Diskusi Mahasiswa:</span>
						</div>
						<p className="text-xs text-amber-950/90 leading-relaxed italic break-words whitespace-pre-wrap pl-3.5 border-l-2 border-amber-400">
							"{sprint.confusingParts}"
						</p>
					</div>
				)}
			</div>

			{/* 4. Multi-Evidence Action Buttons (GitHub, Loom Video, Live Demo) */}
			{(sprint.evidenceUrl || sprint.loomUrl || sprint.demoUrl) && (
				<div className="flex flex-wrap items-center gap-2 pt-1">
					{/* Primary GitHub / Evidence Link */}
					{sprint.evidenceUrl && (
						<a
							href={sprint.evidenceUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-300/80 px-2.5 py-1.2 rounded-md transition-colors"
						>
							<span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
							<span>
								{sprint.evidenceUrl.includes("github.com")
									? "GitHub Repo / PR"
									: `Bukti (${sprint.evidenceType || "Link"})`}
							</span>
							<ArrowUpRight size={12} className="text-slate-500" />
						</a>
					)}

					{/* Loom Video Link */}
					{sprint.loomUrl && (
						<a
							href={sprint.loomUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 px-2.5 py-1.2 rounded-md transition-colors shadow-2xs"
						>
							<Video size={12} className="text-indigo-600" />
							<span>Tonton Loom Video</span>
							<ArrowUpRight size={12} className="text-indigo-400" />
						</a>
					)}

					{/* Live Demo Link */}
					{sprint.demoUrl && (
						<a
							href={sprint.demoUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-2.5 py-1.2 rounded-md transition-colors shadow-2xs"
						>
							<Globe size={12} className="text-emerald-600" />
							<span>Live Demo</span>
							<ArrowUpRight size={12} className="text-emerald-400" />
						</a>
					)}
				</div>
			)}

			{/* 5. Instagram-Style Social Comments & Discussion Thread */}
			<div className="pt-4 border-t border-slate-100 space-y-3">
				{/* Comment Count Header & Progressive Disclosure Toggle */}
				<div className="flex items-center justify-between text-xs text-slate-500">
					<span className="font-medium flex items-center gap-1.5">
						<MessageSquare size={13} className="text-slate-400" />
						<span>{sortedFeedbacks.length} Tanggapan & Diskusi</span>
					</span>

					{sortedFeedbacks.length > 2 && (
						<button
							type="button"
							onClick={() => setShowAllComments(!showAllComments)}
							className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
						>
							<span>
								{showAllComments
									? "Sembunyikan komentar sebelumnya"
									: `Lihat ${sortedFeedbacks.length - 2} komentar sebelumnya`}
							</span>
						</button>
					)}
				</div>

				{/* Comments List (Messenger-Style Kanan-Kiri Bubble Thread) */}
				{displayedFeedbacks.length > 0 && (
					<div
						className={`space-y-3 pt-2 ${
							showAllComments && feedbacks.length > 3
								? "max-h-80 overflow-y-auto pr-1.5"
								: ""
						}`}
					>
						{displayedFeedbacks.map((fb) => {
							const isFromMe = user?.id === fb.author.id;
							const isAuthor = isFromMe || user?.role === "ADMIN";
							const isEditing = editingFeedbackId === fb.id;

							return (
								<div
									key={fb.id}
									className={`flex flex-col ${
										isFromMe ? "items-end ml-auto" : "items-start mr-auto"
									} max-w-[90%] sm:max-w-[82%] space-y-1`}
								>
									{/* Bubble Header (Sender Name & Badge) */}
									<div
										className={`flex items-center gap-1.5 px-1 text-[10px] ${
											isFromMe ? "flex-row-reverse" : "flex-row"
										}`}
									>
										{/* Avatar */}
										<div className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-bold shrink-0">
											{fb.author.avatarUrl ? (
												<img
													src={fb.author.avatarUrl}
													alt={fb.author.name}
													className="w-full h-full object-cover rounded-full"
												/>
											) : (
												fb.author.name.charAt(0).toUpperCase()
											)}
										</div>

										<span className="font-semibold text-slate-700">
											{isFromMe ? "Saya" : fb.author.name}
										</span>

										<span className="text-slate-400 font-mono text-[10px]">
											{formatRelativeTime(fb.createdAt)}
										</span>
									</div>

									{/* Bubble Body */}
									<div
										className={`relative group p-3 rounded-2xl text-xs space-y-1 transition-all ${
											isFromMe
												? "bg-blue-600 text-white rounded-tr-xs shadow-xs"
												: "bg-slate-100/90 border border-slate-200/70 text-slate-800 rounded-tl-xs shadow-2xs"
										}`}
									>
										{isEditing ? (
											<div className="space-y-2">
												<textarea
													rows={2}
													value={editingFeedbackText}
													onChange={(e) =>
														setEditingFeedbackText(e.target.value)
													}
													onKeyDown={(e) => {
														if (e.key === "Enter" && !e.shiftKey) {
															e.preventDefault();
															handleSaveEditFeedback(fb.id);
														} else if (e.key === "Escape") {
															setEditingFeedbackId(null);
														}
													}}
													className="w-full px-3 py-1.5 text-xs rounded-lg border border-blue-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
													placeholder="Edit komentar..."
												/>
												<div className="flex items-center justify-end gap-2 text-xs">
													<button
														type="button"
														onClick={() => setEditingFeedbackId(null)}
														className="px-2 py-0.5 text-slate-300 hover:text-white rounded transition-colors cursor-pointer text-[11px]"
													>
														Batal
													</button>
													<button
														type="button"
														disabled={
															editFeedbackMutation.isPending ||
															!editingFeedbackText.trim()
														}
														onClick={() => handleSaveEditFeedback(fb.id)}
														className="px-2.5 py-0.5 bg-white text-blue-700 font-semibold rounded shadow-xs inline-flex items-center gap-1 transition-colors cursor-pointer text-[11px] disabled:opacity-50"
													>
														<Check size={11} />
														<span>
															{editFeedbackMutation.isPending
																? "Menyimpan..."
																: "Simpan"}
														</span>
													</button>
												</div>
											</div>
										) : (
											<div className="flex items-start justify-between gap-2">
												<p
													className={`leading-relaxed break-words whitespace-pre-wrap ${
														isFromMe ? "text-white" : "text-slate-800"
													}`}
												>
													{fb.comment}
												</p>

												{/* Action Menu if author */}
												{isAuthor && (
													<div className="relative shrink-0">
														<button
															type="button"
															onClick={() =>
																setActiveCommentMenuId(
																	activeCommentMenuId === fb.id ? null : fb.id,
																)
															}
															className={`p-1 rounded-sm transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer ${
																isFromMe
																	? "text-blue-200 hover:text-white hover:bg-blue-700"
																	: "text-slate-400 hover:text-slate-700 hover:bg-slate-200"
															}`}
															title="Opsi Komentar"
														>
															<MoreHorizontal size={12} />
														</button>

														{activeCommentMenuId === fb.id && (
															<>
																<button
																	type="button"
																	aria-label="Tutup menu komentar"
																	className="fixed inset-0 z-20 cursor-default border-0 w-full h-full"
																	onClick={() => setActiveCommentMenuId(null)}
																/>
																<div
																	className={`absolute top-full mt-1 w-28 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 text-xs text-slate-800 ${
																		isFromMe ? "right-0" : "left-0"
																	}`}
																>
																	<button
																		type="button"
																		onClick={() => handleStartEditFeedback(fb)}
																		className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
																	>
																		<Edit2
																			size={11}
																			className="text-slate-500"
																		/>
																		<span>Edit</span>
																	</button>
																	<button
																		type="button"
																		onClick={() => {
																			setActiveCommentMenuId(null);
																			setFeedbackToDelete(fb);
																		}}
																		className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer"
																	>
																		<Trash2
																			size={11}
																			className="text-rose-500"
																		/>
																		<span>Hapus</span>
																	</button>
																</div>
															</>
														)}
													</div>
												)}
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* Instagram-Style Direct Reply Form */}
				<form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
					<div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 hidden sm:flex">
						{user?.avatarUrl ? (
							<img
								src={user.avatarUrl}
								alt={user?.name || "User"}
								className="w-full h-full object-cover rounded-full"
							/>
						) : (
							user?.name?.charAt(0).toUpperCase() || "U"
						)}
					</div>

					<input
						type="text"
						value={commentText}
						onChange={(e) => setCommentText(e.target.value)}
						placeholder={
							user?.role === "ADMIN"
								? "Beri tanggapan atau evaluasi dosen resmi..."
								: "Beri masukan konstruktif atau diskusikan kode..."
						}
						className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
					/>
					<button
						type="submit"
						disabled={addFeedbackMutation.isPending || !commentText.trim()}
						className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer transition-colors shrink-0"
					>
						<Send size={12} />
						<span className="hidden sm:inline">Kirim</span>
					</button>
				</form>
			</div>

			{/* Confirm Modal for Deleting Feedback */}
			<ConfirmModal
				isOpen={Boolean(feedbackToDelete)}
				onClose={() => setFeedbackToDelete(null)}
				onConfirm={() =>
					feedbackToDelete && deleteFeedbackMutation.mutate(feedbackToDelete.id)
				}
				title="Hapus Tanggapan Komentar"
				message="Apakah Anda yakin ingin menghapus tanggapan komentar ini? Tindakan ini tidak dapat dibatalkan."
				confirmLabel="Hapus Komentar"
				variant="danger"
				isLoading={deleteFeedbackMutation.isPending}
			/>

			{/* Confirm Modal for Deleting Sprint Post */}
			<ConfirmModal
				isOpen={isDeleteSprintConfirmOpen}
				onClose={() => setIsDeleteSprintConfirmOpen(false)}
				onConfirm={() => deleteSprintMutation.mutate()}
				title="Hapus Catatan Sesi Belajar"
				message="Apakah Anda yakin ingin menghapus sesi belajar ini beserta seluruh diskusinya? Tindakan ini tidak dapat dibatalkan."
				confirmLabel="Hapus Sesi Belajar"
				variant="danger"
				isLoading={deleteSprintMutation.isPending}
			/>

			{/* Edit Sprint Modal */}
			<SprintModal
				isOpen={isEditSprintModalOpen}
				onClose={() => setIsEditSprintModalOpen(false)}
				sprintToEdit={sprint}
			/>
		</article>
	);
};
