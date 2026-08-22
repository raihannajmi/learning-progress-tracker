import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Flame, PlusCircle, Timer } from "lucide-react";
import React, { useState } from "react";
import { PeerFeedbackCard } from "../components/common/PeerFeedbackCard.js";
import { SprintModal } from "../components/common/SprintModal.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type { LearningSprint } from "../types/index.js";

export const Route = createFileRoute("/sprints")({ component: SprintsPage });

function SprintsPage() {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const [isModalOpen, setIsModalOpen] = useState(false);

	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		}
	}, [isAuthenticated, navigate]);

	const { data: sprints, isLoading } = useQuery<LearningSprint[]>({
		queryKey: ["sprints", { userId: user?.id }],
		queryFn: async () => {
			const res: any = await api.get(`/sprints?userId=${user?.id}`);
			return res.data;
		},
		enabled: !!user?.id,
	});

	const totalMinutes =
		sprints?.reduce((acc, s) => acc + s.durationMinutes, 0) || 0;
	const habitReached = sprints?.filter((s) => s.isHabitQualified).length || 0;

	if (isLoading) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-10">
				<div className="animate-pulse space-y-4">
					<div className="h-28 bg-slate-200 rounded-2xl" />
					<div className="h-36 bg-slate-200 rounded-xl" />
					<div className="h-36 bg-slate-200 rounded-xl" />
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			{/* Header Banner */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
						<Flame size={13} />
						<span>25-Minute Learning Habit</span>
					</div>
					<h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
						Log Sprint & Refleksi Belajar
					</h1>
					<p className="text-xs text-slate-500 mt-1 max-w-lg">
						Catat proses belajar minimal 25 menit, apa yang dipraktekkan, dan
						refleksi hal yang membingungkan.
					</p>
				</div>

				<button
					onClick={() => setIsModalOpen(true)}
					className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 inline-flex items-center gap-2 transition-all cursor-pointer shrink-0"
				>
					<PlusCircle size={16} />
					<span>Catat Sprint Baru</span>
				</button>
			</div>

			{/* Habit Metrics Bar */}
			<div className="grid grid-cols-3 gap-3">
				<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
					<span className="text-[11px] text-slate-500 font-semibold block">
						Total Sesi Sprint
					</span>
					<span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
						{sprints?.length || 0}
					</span>
				</div>
				<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
					<span className="text-[11px] text-slate-500 font-semibold block">
						Total Waktu Belajar
					</span>
					<span className="text-xl sm:text-2xl font-bold text-indigo-600 font-mono">
						{totalMinutes}{" "}
						<span className="text-xs font-normal text-slate-500">m</span>
					</span>
				</div>
				<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
					<span className="text-[11px] text-slate-500 font-semibold block">
						Target ≥25m Tercapai
					</span>
					<span className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono">
						{habitReached}x
					</span>
				</div>
			</div>

			{/* Sprints Feed */}
			<div className="space-y-4">
				{sprints && sprints.length > 0 ? (
					sprints.map((sprint) => (
						<PeerFeedbackCard key={sprint.id} sprint={sprint} />
					))
				) : (
					<div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs">
						<Timer size={40} className="mx-auto text-slate-300 mb-3" />
						<h3 className="text-sm font-bold text-slate-800">
							Belum ada catatan sprint belajar
						</h3>
						<p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
							Luangkan waktu 25 menit untuk mempelajari konsep web development
							dan catat hasilnya.
						</p>
						<button
							onClick={() => setIsModalOpen(true)}
							className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
						>
							<PlusCircle size={14} />
							<span>Mulai Catat Sekarang</span>
						</button>
					</div>
				)}
			</div>

			<SprintModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
		</div>
	);
}
