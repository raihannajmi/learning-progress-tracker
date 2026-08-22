import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
	BookOpen,
	Code2,
	ExternalLink,
	Globe,
	HelpCircle,
	MessageSquare,
	Palette,
	Send,
	Video,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import * as Yup from "yup";
import { api } from "../../lib/api.js";
import type { LearningSprint } from "../../types/index.js";
import { HabitBadge } from "./HabitBadge.js";

interface Props {
	sprint: LearningSprint;
}

const FeedbackSchema = Yup.object().shape({
	comment: Yup.string()
		.required("Tulis feedback yang konstruktif")
		.min(3, "Minimal 3 karakter"),
});

export const PeerFeedbackCard: React.FC<Props> = ({ sprint }) => {
	const queryClient = useQueryClient();
	const [showCommentForm, setShowCommentForm] = useState(false);

	const mutation = useMutation({
		mutationFn: async (comment: string) => {
			const res: any = await api.post(`/sprints/${sprint.id}/feedbacks`, {
				comment,
			});
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sprints"] });
			setShowCommentForm(false);
		},
	});

	const getEvidenceIcon = (type: string) => {
		switch (type) {
			case "GITHUB":
				return <Code2 size={13} />;
			case "GITHUB_PAGES":
			case "LIVE_DEMO":
				return <Globe size={13} />;
			case "LOOM":
				return <Video size={13} />;
			case "FIGMA":
				return <Palette size={13} />;
			default:
				return <ExternalLink size={13} />;
		}
	};

	return (
		<div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
			{/* Author Header */}
			<div className="flex justify-between items-start mb-3">
				<div className="flex items-center gap-2.5">
					<img
						src={
							sprint.user?.avatarUrl ||
							`https://ui-avatars.com/api/?name=${encodeURIComponent(
								sprint.user?.name || "Student",
							)}&background=6366f1&color=fff`
						}
						alt={sprint.user?.name}
						className="w-9 h-9 rounded-full ring-2 ring-slate-100 object-cover"
					/>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-xs font-bold text-slate-900">
								{sprint.user?.name}
							</span>
							{sprint.user?.className && (
								<span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
									{sprint.user.className}
								</span>
							)}
						</div>
						<span className="text-[11px] text-slate-400">
							{new Date(sprint.createdAt).toLocaleDateString("id-ID", {
								day: "numeric",
								month: "short",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5">
					{sprint.topic && (
						<span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
							{sprint.topic.title}
						</span>
					)}
					<HabitBadge durationMinutes={sprint.durationMinutes} />
				</div>
			</div>

			{/* Content */}
			<div className="space-y-2.5 my-3 text-xs">
				<div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
					<span className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
						<BookOpen size={13} className="text-indigo-600" />
						Yang Dipelajari:
					</span>
					<p className="text-slate-600 leading-relaxed">{sprint.whatLearned}</p>
				</div>

				<div className="bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100/60">
					<span className="font-semibold text-emerald-800 flex items-center gap-1.5 mb-1">
						<Code2 size={13} className="text-emerald-600" />
						Yang Dipraktekkan:
					</span>
					<p className="text-slate-600 leading-relaxed">
						{sprint.whatPracticed}
					</p>
				</div>

				{sprint.confusingParts && (
					<div className="bg-amber-50/40 p-2.5 rounded-lg border border-amber-100/60">
						<span className="font-semibold text-amber-800 flex items-center gap-1.5 mb-1">
							<HelpCircle size={13} className="text-amber-600" />
							Masih Membingungkan:
						</span>
						<p className="text-slate-600 leading-relaxed">
							{sprint.confusingParts}
						</p>
					</div>
				)}
			</div>

			{/* Evidence Button */}
			{sprint.evidenceUrl && (
				<div className="pt-2 mb-3">
					<a
						href={sprint.evidenceUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/80 px-2.5 py-1 rounded-md transition-colors"
					>
						{getEvidenceIcon(sprint.evidenceType)}
						<span>Lihat Bukti ({sprint.evidenceType.replace("_", " ")})</span>
						<ExternalLink size={11} />
					</a>
				</div>
			)}

			{/* Peer Feedbacks Thread */}
			<div className="mt-3 pt-3 border-t border-slate-100">
				<div className="flex justify-between items-center mb-2">
					<span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
						<MessageSquare size={13} />
						Feedback Teman ({sprint.feedbacks?.length || 0})
					</span>
					<button
						type="button"
						onClick={() => setShowCommentForm(!showCommentForm)}
						className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
					>
						{showCommentForm ? "Tutup" : "+ Beri Feedback"}
					</button>
				</div>

				{/* Existing Feedbacks */}
				{sprint.feedbacks && sprint.feedbacks.length > 0 ? (
					<div className="space-y-2 mb-2">
						{sprint.feedbacks.map((fb) => (
							<div
								key={fb.id}
								className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
							>
								<div className="flex items-center gap-1.5 mb-1">
									<span className="font-bold text-slate-800">
										{fb.author.name}
									</span>
									{fb.author.role === "ADMIN" && (
										<span className="text-[9px] font-semibold bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-xs">
											Dosen/TA
										</span>
									)}
									<span className="text-[10px] text-slate-400 ml-auto">
										{new Date(fb.createdAt).toLocaleDateString("id-ID", {
											day: "numeric",
											month: "short",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
								<p className="text-slate-600 leading-relaxed">{fb.comment}</p>
							</div>
						))}
					</div>
				) : (
					<p className="text-[11px] text-slate-400 italic py-1">
						Belum ada feedback. Jadilah yang pertama memberikan masukan
						konstruktif!
					</p>
				)}

				{/* Formik Add Feedback Form */}
				{showCommentForm && (
					<div className="mt-3 pt-2">
						<Formik
							initialValues={{ comment: "" }}
							validationSchema={FeedbackSchema}
							onSubmit={(values, { resetForm }) => {
								mutation.mutate(values.comment, {
									onSuccess: () => resetForm(),
								});
							}}
						>
							{({ isSubmitting }) => (
								<Form className="flex gap-2">
									<div className="flex-1">
										<Field
											type="text"
											name="comment"
											placeholder="Tulis masukan kualitatif yang membantu..."
											className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
										/>
										<ErrorMessage
											name="comment"
											component="div"
											className="text-[10px] text-rose-600 mt-0.5"
										/>
									</div>
									<button
										type="submit"
										disabled={isSubmitting || mutation.isPending}
										className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50 h-fit"
									>
										<Send size={13} />
										<span>{mutation.isPending ? "..." : "Kirim"}</span>
									</button>
								</Form>
							)}
						</Formik>
					</div>
				)}
			</div>
		</div>
	);
};
