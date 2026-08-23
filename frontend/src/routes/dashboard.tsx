import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	Calendar,
	CheckCircle2,
	Compass,
	Flame,
	MessageSquare,
	Sparkles,
	Timer,
} from "lucide-react";
import React from "react";
import { EmptyState } from "../components/common/EmptyState.js";
import { HabitBadge } from "../components/common/HabitBadge.js";
import { ProgressBar } from "../components/common/ProgressBar.js";
import { StatCard } from "../components/common/StatCard.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import { useTimerStore } from "../stores/timerStore.js";
import type { StudentDashboardData } from "../types/index.js";

export const Route = createFileRoute("/dashboard")({
	component: StudentDashboard,
});

function StudentDashboard() {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const { openReflectionModal } = useTimerStore();

	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		} else if (user?.role === "ADMIN") {
			navigate({ to: "/admin" });
		}
	}, [isAuthenticated, user, navigate]);

	const { data, isLoading, error } = useQuery<StudentDashboardData>({
		queryKey: ["studentDashboard"],
		queryFn: async () => {
			const res: any = await api.get("/dashboard/student");
			return res.data;
		},
		enabled: isAuthenticated && user?.role !== "ADMIN",
	});

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse"
						/>
					))}
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
					<div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="py-12 text-center">
				<p className="text-xs text-rose-600">Gagal memuat data dashboard.</p>
			</div>
		);
	}

	const firstName = user?.name ? user.name.split(" ")[0] : "Mahasiswa";
	const totalMins =
		data.summary.totalMinutesLearned ?? data.summary.totalDurationMinutes ?? 0;
	const weeklySprints =
		data.summary.sprintsThisWeek ?? data.summary.weeklySprintsCount ?? 0;

	return (
		<div className="space-y-6">
			{/* 1. Above-The-Fold: Focus & Next Action Header */}
			<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div className="space-y-1.5 max-w-2xl">
					<div className="flex items-center gap-2 text-xs text-slate-500">
						<span className="font-semibold text-slate-900">
							Halo, {firstName}
						</span>
						<span>•</span>
						<span className="inline-flex items-center gap-1 font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm">
							<Calendar size={12} />
							<span>Minggu {data.currentWeek.weekNumber} dari 8</span>
						</span>
					</div>

					<h2 className="text-lg font-semibold text-slate-900 tracking-tight">
						Fokus: {data.currentWeek.title}
					</h2>

					<p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
						{data.currentWeek.description}
					</p>
				</div>

				<div className="flex items-center gap-2.5 shrink-0">
					<button
						type="button"
						onClick={() => openReflectionModal(null, 25)}
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
					>
						<Timer size={15} />
						<span>Mulai 25-Min Sprint</span>
					</button>

					<Link
						to="/roadmap"
						className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors"
					>
						<span>Buka Silabus</span>
						<ArrowRight size={13} className="text-slate-400" />
					</Link>
				</div>
			</div>

			{/* 2. KPI Stat Cards (4-Grid) */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					label="Progres Self-Assessment"
					value={`${data.summary.overallPercentage}%`}
					subtext={`${data.summary.completedChecklists} dari ${data.summary.totalChecklists} poin mandiri`}
					icon={CheckCircle2}
					iconColor="text-emerald-600"
				/>
				<StatCard
					label="Target Kebiasaan (≥25m)"
					value={`${data.summary.habitReachedCount}x`}
					subtext="Sesi belajar fokus tercapai"
					icon={Flame}
					iconColor="text-amber-500"
				/>
				<StatCard
					label="Total Waktu Belajar"
					value={`${totalMins}m`}
					subtext={`Dari ${data.summary.totalSprints} sesi sprint`}
					icon={Timer}
					iconColor="text-blue-600"
				/>
				<StatCard
					label="Aktivitas Minggu Ini"
					value={`${weeklySprints} sprint`}
					subtext="7 hari terakhir"
					icon={Compass}
					iconColor="text-slate-500"
				/>
			</div>

			{/* 3. Progress Breakdown Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Category Competency Progress */}
				<div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
					<div className="flex items-center justify-between pb-3 border-b border-slate-100">
						<div>
							<h3 className="text-sm font-semibold text-slate-900">
								Kompetensi Kategori Materi
							</h3>
							<p className="text-xs text-slate-500 mt-0.5">
								Progres butir checklist yang telah Anda tandai sebagai Mandiri
							</p>
						</div>

						<Link
							to="/roadmap"
							className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
						>
							Buka Silabus Lengkap →
						</Link>
					</div>

					<div className="space-y-4 pt-1">
						{data.categoryProgress.map((item) => (
							<div key={item.category} className="space-y-1.5">
								<div className="flex items-center justify-between text-xs">
									<span className="font-medium text-slate-700">
										{item.category}
									</span>
									<span className="font-mono text-slate-500 text-[11px]">
										{item.independent} dari {item.total} butir (
										{item.percentage}
										%)
									</span>
								</div>
								<ProgressBar percentage={item.percentage} />
							</div>
						))}
					</div>
				</div>

				{/* Next Recommended Action */}
				<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
					<div className="space-y-3">
						<div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider">
							<Sparkles size={14} />
							<span>Langkah Rekomendasi</span>
						</div>

						<h3 className="text-sm font-bold text-slate-900 leading-snug">
							{data.nextAction.suggestedFocus}
						</h3>

						<p className="text-xs text-slate-500 leading-relaxed">
							Target minimal belajar Anda berikutnya adalah sesi fokus 25 menit
							untuk menyelesaikan topik ini dan mencatat bukti latihan.
						</p>
					</div>

					<button
						type="button"
						onClick={() => openReflectionModal(null, 25)}
						className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
					>
						Catat Refleksi Topik Ini
					</button>
				</div>
			</div>

			{/* 4. Recent Sprint Reflections Stream */}
			<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
				<div className="flex items-center justify-between pb-3 border-b border-slate-100">
					<div>
						<h3 className="text-sm font-semibold text-slate-900">
							Riwayat Sprint Belajar Terbaru
						</h3>
						<p className="text-xs text-slate-500 mt-0.5">
							Sesi fokus dan catatan kendala belajar Anda
						</p>
					</div>

					<Link
						to="/sprints"
						className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
					>
						Lihat Semua Sprint →
					</Link>
				</div>

				{data.recentSprints && data.recentSprints.length > 0 ? (
					<div className="divide-y divide-slate-100">
						{data.recentSprints.map((sprint) => (
							<div key={sprint.id} className="py-3.5 first:pt-0 last:pb-0">
								<div className="flex items-start justify-between gap-4">
									<div className="space-y-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="text-xs font-semibold text-slate-900 truncate">
												{sprint.topic?.title || "Belajar Mandiri"}
											</span>
											<span className="text-slate-300">•</span>
											<span className="text-[11px] font-mono text-slate-400">
												{new Date(sprint.createdAt).toLocaleDateString(
													"id-ID",
													{
														day: "numeric",
														month: "short",
														hour: "2-digit",
														minute: "2-digit",
													},
												)}
											</span>
										</div>

										<p className="text-xs text-slate-600 line-clamp-2">
											{sprint.whatLearned}
										</p>
									</div>

									<div className="flex items-center gap-2 shrink-0">
										<HabitBadge
											durationMinutes={sprint.durationMinutes}
											isHabitQualified={sprint.isHabitQualified}
										/>

										<span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-sm border border-slate-200">
											<MessageSquare size={12} className="text-slate-400" />
											<span>{sprint.feedbacks?.length || 0} feedback</span>
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<EmptyState
						icon={Timer}
						title="Belum ada catatan sprint"
						description="Mulai belajar minimal 25 menit dan catat refleksi pertama Anda untuk memantau konsistensi."
						actionLabel="Mulai Sesi Belajar Pertama"
						onAction={() => openReflectionModal(null, 25)}
					/>
				)}
			</div>
		</div>
	);
}
