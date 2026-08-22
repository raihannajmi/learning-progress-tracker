import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	Calendar,
	CheckCircle2,
	Compass,
	ExternalLink,
	Flame,
	PlusCircle,
	Sparkles,
	Timer,
} from "lucide-react";
import React, { useState } from "react";
import { HabitBadge } from "../components/common/HabitBadge.js";
import { ProgressBar } from "../components/common/ProgressBar.js";
import { SprintModal } from "../components/common/SprintModal.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type { StudentDashboardData } from "../types/index.js";

export const Route = createFileRoute("/dashboard")({
	component: StudentDashboard,
});

function StudentDashboard() {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuthStore();
	const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);

	// Redirect to login if not authenticated
	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		}
	}, [isAuthenticated, navigate]);

	const { data, isLoading, error } = useQuery<StudentDashboardData>({
		queryKey: ["studentDashboard"],
		queryFn: async () => {
			const res: any = await api.get("/dashboard/student");
			return res.data;
		},
		enabled: isAuthenticated,
	});

	if (isLoading) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
				<div className="animate-pulse space-y-6">
					<div className="h-32 bg-slate-200 rounded-2xl w-full" />
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="h-28 bg-slate-200 rounded-xl" />
						<div className="h-28 bg-slate-200 rounded-xl" />
						<div className="h-28 bg-slate-200 rounded-xl" />
					</div>
					<div className="h-64 bg-slate-200 rounded-2xl" />
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="max-w-7xl mx-auto px-4 py-12 text-center">
				<p className="text-sm text-rose-600">Gagal memuat data dashboard.</p>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
			{/* 1. Hero: SAYA HARUS BELAJAR APA? (PRD §17.1) */}
			<div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
				<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
					<div className="max-w-2xl">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-3">
							<Calendar size={13} />
							<span>
								FOKUS MINGGU INI — MINGGU {data.currentWeek.weekNumber}
							</span>
						</div>
						<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
							{data.currentWeek.title}
						</h1>
						<p className="mt-2 text-xs sm:text-sm text-indigo-100/80 leading-relaxed">
							{data.currentWeek.description}
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-3">
						<button
							onClick={() => setIsSprintModalOpen(true)}
							className="px-5 py-3 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold shadow-lg inline-flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
						>
							<Timer size={16} className="text-indigo-600" />
							<span>Mulai 25-Min Sprint</span>
						</button>
						<Link
							to="/roadmap"
							className="px-4 py-3 rounded-xl bg-indigo-700/50 hover:bg-indigo-700 text-white text-xs font-semibold border border-indigo-500/40 inline-flex items-center justify-center gap-1.5 transition-all"
						>
							<span>Buka Roadmap</span>
							<ArrowRight size={14} />
						</Link>
					</div>
				</div>
			</div>

			{/* KPI Cards: Habit & Activity Tracker */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-slate-500">
							Progres Self-Assessment
						</span>
						<CheckCircle2 size={18} className="text-emerald-600" />
					</div>
					<div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
						{data.summary.overallPercentage}%
					</div>
					<span className="text-[11px] text-slate-400 mt-1 block">
						{data.summary.completedChecklists} dari{" "}
						{data.summary.totalChecklists} poin dikuasai mandiri
					</span>
				</div>

				<div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-slate-500">
							Habit ≥25 Menit
						</span>
						<Flame size={18} className="text-amber-500" />
					</div>
					<div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
						{data.summary.habitReachedCount}x
					</div>
					<span className="text-[11px] text-slate-400 mt-1 block">
						Target kebiasaan fokus tercapai
					</span>
				</div>

				<div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-slate-500">
							Total Waktu Belajar
						</span>
						<Timer size={18} className="text-indigo-600" />
					</div>
					<div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
						{data.summary.totalMinutesLearned}{" "}
						<span className="text-sm font-normal text-slate-500">menit</span>
					</div>
					<span className="text-[11px] text-slate-400 mt-1 block">
						Dari total {data.summary.totalSprints} sesi sprint
					</span>
				</div>

				<div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-slate-500">
							Aktivitas Minggu Ini
						</span>
						<Sparkles size={18} className="text-sky-600" />
					</div>
					<div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
						{data.summary.sprintsThisWeek}{" "}
						<span className="text-sm font-normal text-slate-500">sprint</span>
					</div>
					<span className="text-[11px] text-slate-400 mt-1 block">
						7 hari terakhir
					</span>
				</div>
			</div>

			{/* 2 & 3: SAYA SUDAH SAMPAI MANA & APA LANGKAH SELANJUTNYA? (PRD §17.2 & §17.3) */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left 2 Cols: Self-Assessed Progress per Category */}
				<div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
					<div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
						<div>
							<h2 className="text-base font-bold text-slate-900">
								Self-Assessed Learning Progress
							</h2>
							<p className="text-xs text-slate-500">
								Berdasarkan checklist mandiri yang telah Anda tandai.
							</p>
						</div>
						<Link
							to="/roadmap"
							className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
						>
							Update Checklist →
						</Link>
					</div>

					<div className="space-y-4">
						{data.categoryProgress.map((cat) => {
							const colorMap: any = {
								HTML: "indigo",
								CSS: "sky",
								JAVASCRIPT: "amber",
								BACKEND: "emerald",
								FULLSTACK: "purple",
							};
							return (
								<div
									key={cat.category}
									className="p-3 bg-slate-50/60 rounded-xl border border-slate-100"
								>
									<div className="flex justify-between items-center mb-1 text-xs">
										<span className="font-bold text-slate-800 font-mono">
											{cat.category}
										</span>
										<span className="text-slate-600 font-medium">
											{cat.independent}/{cat.total} Mandiri ({cat.percentage}%)
										</span>
									</div>
									<ProgressBar
										percentage={cat.percentage}
										color={colorMap[cat.category] || "indigo"}
									/>
								</div>
							);
						})}
					</div>
				</div>

				{/* Right Col: APA YANG HARUS SAYA LAKUKAN SELANJUTNYA? */}
				<div className="bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 p-6 rounded-2xl border border-indigo-100/80 shadow-xs flex flex-col justify-between">
					<div>
						<div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 mb-3">
							<Compass size={20} />
						</div>
						<h3 className="text-base font-bold text-slate-900 leading-tight">
							Langkah Selanjutnya
						</h3>
						<p className="text-xs text-slate-500 mt-1">
							Rekomendasi target untuk sprint belajar Anda berikutnya:
						</p>

						<div className="my-4 p-3.5 bg-white rounded-xl border border-indigo-100 shadow-xs">
							<span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
								Topik Rekomendasi
							</span>
							<p className="text-xs font-semibold text-slate-800 leading-relaxed">
								{data.nextAction.suggestedFocus}
							</p>
						</div>

						<div className="text-xs text-slate-600 flex items-center gap-2">
							<Timer size={14} className="text-amber-600 shrink-0" />
							<span>
								Target minimal: <strong>25 menit</strong> belajar fokus
							</span>
						</div>
					</div>

					<div className="mt-6 pt-4 border-t border-slate-100">
						<button
							onClick={() => setIsSprintModalOpen(true)}
							className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
						>
							<PlusCircle size={15} />
							<span>Catat Sprint Sekarang</span>
						</button>
					</div>
				</div>
			</div>

			{/* Recent Sprints Table / Feed */}
			<div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
				<div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
					<div>
						<h2 className="text-base font-bold text-slate-900">
							Riwayat Sprint Terakhir Anda
						</h2>
						<p className="text-xs text-slate-500">
							Catatan refleksi apa yang dipelajari dan dipraktekkan.
						</p>
					</div>
					<Link
						to="/sprints"
						className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
					>
						Lihat Semua Sprint ({data.summary.totalSprints}) →
					</Link>
				</div>

				{data.recentSprints.length === 0 ? (
					<div className="text-center py-10">
						<Timer size={32} className="mx-auto text-slate-300 mb-2" />
						<p className="text-xs font-semibold text-slate-600">
							Belum ada catatan sprint.
						</p>
						<p className="text-[11px] text-slate-400 mt-0.5">
							Mulai belajar minimal 25 menit dan catat refleksi pertama Anda.
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{data.recentSprints.map((sprint) => (
							<div
								key={sprint.id}
								className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col sm:flex-row justify-between gap-3 text-xs"
							>
								<div className="space-y-1 max-w-2xl">
									<div className="flex items-center gap-2">
										<span className="font-bold text-slate-800">
											{sprint.topic?.title || "Umum"}
										</span>
										<HabitBadge durationMinutes={sprint.durationMinutes} />
									</div>
									<p className="text-slate-600">
										<strong className="text-slate-700">Dipelajari:</strong>{" "}
										{sprint.whatLearned}
									</p>
									<p className="text-slate-600">
										<strong className="text-slate-700">Dipraktekkan:</strong>{" "}
										{sprint.whatPracticed}
									</p>
								</div>

								<div className="flex sm:flex-col justify-between items-end sm:items-end gap-1 text-[11px] text-slate-400 shrink-0">
									<span>
										{new Date(sprint.createdAt).toLocaleDateString("id-ID", {
											day: "numeric",
											month: "short",
										})}
									</span>
									{sprint.evidenceUrl && (
										<a
											href={sprint.evidenceUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-semibold"
										>
											<span>Bukti</span>
											<ExternalLink size={11} />
										</a>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Sprint Modal */}
			<SprintModal
				isOpen={isSprintModalOpen}
				onClose={() => setIsSprintModalOpen(false)}
			/>
		</div>
	);
}
