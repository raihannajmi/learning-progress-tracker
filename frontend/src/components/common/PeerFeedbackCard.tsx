import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Flame, MessageSquare, Send } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { api } from "../../lib/api.js";
import type { LearningSprint } from "../../types/index.js";

interface Props {
	sprint: LearningSprint;
}

export const PeerFeedbackCard: React.FC<Props> = ({ sprint }) => {
	const queryClient = useQueryClient();
	const [commentText, setCommentText] = useState("");
	const [isReplying, setIsReplying] = useState(false);

	const addFeedbackMutation = useMutation({
		mutationFn: async (comment: string) => {
			const res: any = await api.post(`/sprints/${sprint.id}/feedbacks`, {
				comment,
			});
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sprints"] });
			setCommentText("");
			setIsReplying(false);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!commentText.trim()) return;
		addFeedbackMutation.mutate(commentText);
	};

	const isHabit = sprint.durationMinutes >= 25;

	return (
		<div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
			{/* Student Author Header */}
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-3 min-w-0">
					<div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-semibold text-xs text-slate-700 shrink-0">
						{sprint.user.avatarUrl ? (
							<img
								src={sprint.user.avatarUrl}
								alt={sprint.user.name}
								className="w-full h-full object-cover rounded-lg"
							/>
						) : (
							sprint.user.name.charAt(0).toUpperCase()
						)}
					</div>
					<div className="min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-xs font-semibold text-slate-900 truncate">
								{sprint.user.name}
							</span>
							{sprint.user.className && (
								<span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm">
									{sprint.user.className}
								</span>
							)}
						</div>
						<span className="text-[11px] text-slate-400 font-normal">
							{new Date(sprint.createdAt).toLocaleDateString("id-ID", {
								day: "numeric",
								month: "short",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2 shrink-0">
					{isHabit && (
						<span className="inline-flex items-center gap-1 text-[11px] font-medium font-mono rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5">
							<Flame size={12} className="text-amber-500" />
							<span>{sprint.durationMinutes}m</span>
						</span>
					)}
				</div>
			</div>

			{/* Topic Title if attached */}
			{sprint.topic && (
				<div className="text-xs font-medium text-blue-600 bg-blue-50/70 border border-blue-100 px-2.5 py-1 rounded-md w-fit">
					Topik: {sprint.topic.title}
				</div>
			)}

			{/* Reflection Content */}
			<div className="space-y-2 text-xs">
				<div>
					<span className="font-semibold text-slate-800">Pelajari: </span>
					<span className="text-slate-600 leading-relaxed">
						{sprint.whatLearned}
					</span>
				</div>
				<div>
					<span className="font-semibold text-slate-800">Praktek: </span>
					<span className="text-slate-600 leading-relaxed">
						{sprint.whatPracticed}
					</span>
				</div>
				{sprint.confusingParts && (
					<div className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-lg text-amber-900 leading-relaxed">
						<span className="font-semibold">Kendala / Pertanyaan: </span>
						<span>{sprint.confusingParts}</span>
					</div>
				)}
			</div>

			{/* Evidence Link */}
			{sprint.evidenceUrl && (
				<div className="pt-1">
					<a
						href={sprint.evidenceUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md transition-colors"
					>
						<span>Buka Bukti ({sprint.evidenceType})</span>
						<ExternalLink size={12} className="text-slate-400" />
					</a>
				</div>
			)}

			{/* Feedback Section */}
			<div className="pt-3 border-t border-slate-100 space-y-3">
				<div className="flex items-center justify-between">
					<button
						type="button"
						onClick={() => setIsReplying(!isReplying)}
						className="text-xs font-medium text-slate-500 hover:text-blue-600 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
					>
						<MessageSquare size={14} />
						<span>{sprint.feedbacks?.length || 0} Peer Feedback</span>
					</button>
				</div>

				{/* Existing Comments */}
				{sprint.feedbacks && sprint.feedbacks.length > 0 && (
					<div className="space-y-2 pl-3 border-l-2 border-slate-100">
						{sprint.feedbacks.map((fb) => (
							<div key={fb.id} className="text-xs space-y-0.5">
								<div className="flex items-center gap-1.5">
									<span className="font-semibold text-slate-800">
										{fb.author.name}
									</span>
									{fb.author.role === "ADMIN" && (
										<span className="text-[9px] font-mono font-bold bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded-xs border border-purple-200">
											DOSEN/TA
										</span>
									)}
									<span className="text-[10px] text-slate-400">
										{new Date(fb.createdAt).toLocaleDateString("id-ID", {
											day: "numeric",
											month: "short",
										})}
									</span>
								</div>
								<p className="text-slate-600 leading-relaxed">{fb.comment}</p>
							</div>
						))}
					</div>
				)}

				{/* Reply Input Form */}
				{isReplying && (
					<form
						onSubmit={handleSubmit}
						className="flex items-center gap-2 pt-1"
					>
						<input
							type="text"
							value={commentText}
							onChange={(e) => setCommentText(e.target.value)}
							placeholder="Berikan masukan konstruktif atau saran..."
							className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
						/>
						<button
							type="submit"
							disabled={addFeedbackMutation.isPending || !commentText.trim()}
							className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer transition-colors"
						>
							<Send size={12} />
							<span>Kirim</span>
						</button>
					</form>
				)}
			</div>
		</div>
	);
};
