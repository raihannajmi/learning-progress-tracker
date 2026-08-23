import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	ArrowUpRight,
	Flame,
	HelpCircle,
	MessageSquare,
	Send,
	ShieldCheck,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { api } from "../../lib/api.js";
import { useAuthStore } from "../../stores/authStore.js";
import type { LearningSprint } from "../../types/index.js";

interface Props {
	sprint: LearningSprint;
}

export const PeerFeedbackCard: React.FC<Props> = ({ sprint }) => {
	const { user } = useAuthStore();
	const queryClient = useQueryClient();
	const [commentText, setCommentText] = useState("");
	const [showAllComments, setShowAllComments] = useState(false);

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
			setCommentText("");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!commentText.trim()) return;
		addFeedbackMutation.mutate(commentText);
	};

	const student = sprint.user || {
		name: "Mahasiswa",
		avatarUrl: null,
		className: null,
		nim: null,
	};

	const isHabit = sprint.durationMinutes >= 25;
	const feedbacks = sprint.feedbacks || [];
	const displayedFeedbacks = showAllComments
		? feedbacks
		: feedbacks.slice(0, 3);

	return (
		<article className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-4 transition-all">
			{/* 1. Author Header & Meta */}
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
							{new Date(sprint.createdAt).toLocaleDateString("id-ID", {
								day: "numeric",
								month: "short",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
					</div>
				</div>

				{/* Duration / Habit Pill */}
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

			{/* 3. Learning Story Content */}
			<div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
				<div>
					<p className="text-slate-800">
						<strong className="font-semibold text-slate-900">
							Apa yang dipelajari:
						</strong>{" "}
						{sprint.whatLearned}
					</p>
				</div>

				<div>
					<p className="text-slate-800">
						<strong className="font-semibold text-slate-900">
							Praktek & Pembuktian:
						</strong>{" "}
						{sprint.whatPracticed}
					</p>
				</div>

				{sprint.confusingParts && (
					<div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-slate-800 space-y-1">
						<span className="text-[11px] font-semibold text-amber-900 flex items-center gap-1 font-mono">
							<HelpCircle size={12} className="text-amber-600" />
							<span>Kendala / Pertanyaan Mahasiswa:</span>
						</span>
						<p className="text-slate-700 text-xs italic">
							"{sprint.confusingParts}"
						</p>
					</div>
				)}
			</div>

			{/* 4. Evidence Link Button */}
			{sprint.evidenceUrl && (
				<div className="pt-1">
					<a
						href={sprint.evidenceUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
					>
						<span>Tautan Bukti ({sprint.evidenceType})</span>
						<ArrowUpRight size={13} />
					</a>
				</div>
			)}

			{/* 5. Unified Social Discussion Thread */}
			<div className="pt-4 border-t border-slate-100 space-y-3">
				<div className="flex items-center justify-between text-xs text-slate-500">
					<span className="font-medium flex items-center gap-1.5">
						<MessageSquare size={13} className="text-slate-400" />
						<span>{feedbacks.length} Tanggapan & Diskusi</span>
					</span>

					{feedbacks.length > 3 && (
						<button
							type="button"
							onClick={() => setShowAllComments(!showAllComments)}
							className="text-xs text-blue-600 hover:underline cursor-pointer"
						>
							{showAllComments
								? "Tampilkan ringkas"
								: `Lihat semua ${feedbacks.length} komentar`}
						</button>
					)}
				</div>

				{/* Comments List */}
				{displayedFeedbacks.length > 0 && (
					<div className="space-y-2.5 pt-1">
						{displayedFeedbacks.map((fb) => {
							const isInstructor = fb.author.role === "ADMIN";

							return (
								<div
									key={fb.id}
									className={`p-3 rounded-lg text-xs space-y-1 transition-colors ${
										isInstructor
											? "bg-blue-50/80 border border-blue-200/90 text-slate-800"
											: "bg-slate-50 border border-slate-200/70 text-slate-700"
									}`}
								>
									<div className="flex items-center justify-between gap-2">
										<div className="flex items-center gap-1.5 flex-wrap">
											<span className="font-semibold text-slate-900">
												{fb.author.name}
											</span>
											<span className="text-slate-300">•</span>
											{isInstructor ? (
												<span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded-xs border border-blue-300">
													<ShieldCheck size={11} className="text-blue-700" />
													<span>DOSEN / TA</span>
												</span>
											) : (
												<span className="text-[10px] text-slate-500 font-mono">
													Mahasiswa
												</span>
											)}
										</div>

										<span className="text-[10px] text-slate-400 font-mono">
											{new Date(fb.createdAt).toLocaleDateString("id-ID", {
												day: "numeric",
												month: "short",
											})}
										</span>
									</div>

									<p className="leading-relaxed pl-0.5">{fb.comment}</p>
								</div>
							);
						})}
					</div>
				)}

				{/* Direct Reply Form */}
				<form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2">
					<input
						type="text"
						value={commentText}
						onChange={(e) => setCommentText(e.target.value)}
						placeholder={
							user?.role === "ADMIN"
								? "Beri tanggapan atau evaluasi dosen resmi..."
								: "Beri masukan konstruktif atau diskusikan kode..."
						}
						className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
					/>
					<button
						type="submit"
						disabled={addFeedbackMutation.isPending || !commentText.trim()}
						className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer transition-colors"
					>
						<Send size={12} />
						<span>Kirim</span>
					</button>
				</form>
			</div>
		</article>
	);
};
