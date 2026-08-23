import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	Calendar,
	CheckCircle2,
	Compass,
	ExternalLink,
	Flame,
	MessageSquare,
	Sparkles,
	Timer,
} from "lucide-react";
import React, { useState } from "react";
import { EmptyState } from "../components/common/EmptyState.js";
import { HabitBadge } from "../components/common/HabitBadge.js";
import { ProgressBar } from "../components/common/ProgressBar.js";
import { SprintModal } from "../components/common/SprintModal.js";
import { StatCard } from "../components/common/StatCard.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type { StudentDashboardData } from "../types/index.js";

export const Route = createFileRoute("/dashboard")({
	component: StudentDashboard,
});

function StudentDashboard() {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);

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
						onClick={() => setIsSprintModalOpen(true)}
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
					value={`${data.summary.totalDurationMinutes}m`}
					subtext={`Dari ${data.summary.totalSprints} sesi sprint`}
					icon={Timer}
					iconColor="text-blue-600"
				/>
				<StatCard
					label="Aktivitas Minggu Ini"
					value={`${data.summary.weeklySprintsCount} sprint`}
					subtext="7 hari terakhir"
					icon={Compass}
					iconColor="text-slate-500"
				/>
			</div>

			{/* 3. Main Split Section: Category Progress & Next Step */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left (2 Cols): Module & Category Progress */}
				<div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
					<div className="flex items-center justify-between pb-3 border-b border-slate-100">
						<div>
							<h3 className="text-sm font-semibold text-slate-900">
								Penguasaan Silabus Mandiri
							</h3>
							<p className="text-xs text-slate-500 mt-0.5">
								Berdasarkan checklist mandiri yang telah Anda tandai
							</p>
						</div>
						<Link
							to="/roadmap"
							className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
						>
							Update Status →
						</Link>
					</div>

					<div className="space-y-3.5 pt-1">
						{data.categoryProgress.map((cat) => (
							<div key={cat.category} className="space-y-1.5">
								<div className="flex items-center justify-between text-xs">
									<span className="font-medium text-slate-800">
										{cat.category}
									</span>
									<span className="font-mono text-slate-500">
										{cat.independent}/{cat.total} Mandiri ({cat.percentage}%)
									</span>
								</div>
								<ProgressBar percentage={cat.percentage} height="md" />
							</div>
						))}
					</div>
				</div>

				{/* Right (1 Col): Actionable Next Step Box */}
				<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
					<div>
						<div className="flex items-center gap-2 mb-3">
							<div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
								<Sparkles size={14} />
							</div>
							<h3 className="text-sm font-semibold text-slate-900">
								Langkah Rekomendasi
							</h3>
						</div>

						<p className="text-xs text-slate-500 leading-relaxed mb-3">
							Target terdekat untuk sprint belajar Anda berikutnya:
						</p>

						<div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
							<span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 font-semibold block">
								Topik Rekomendasi
							</span>
							<p className="text-xs font-semibold text-slate-800 leading-snug">
								{data.nextAction.suggestedFocus}
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={() => setIsSprintModalOpen(true)}
						className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
					>
						<Timer size={14} />
						<span>Catat Sprint Sekarang</span>
					</button>
				</div>
			</div>

			{/* 4. Recent Activity Timeline */}
			<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
				<div className="flex items-center justify-between pb-3 border-b border-slate-100">
					<div>
						<h3 className="text-sm font-semibold text-slate-900">
							Riwayat Sprint Terakhir Anda
						</h3>
						<p className="text-xs text-slate-500 mt-0.5">
							Catatan refleksi apa yang dipelajari dan dipraktekkan
						</p>
					</div>
					<Link
						to="/sprints"
						className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
					>
						Lihat Semua Sprint ({data.recentSprints?.length || 0}) →
					</Link>
				</div>

				{data.recentSprints && data.recentSprints.length > 0 ? (
					<div className="space-y-3 pt-1">
						{data.recentSprints.map((sprint) => (
							<div
								key={sprint.id}
								className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs space-y-2"
							>
								<div className="flex items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<span className="font-semibold text-slate-900">
											{sprint.topic?.title || "Sesi Mandiri"}
										</span>
										{sprint.topic?.category && (
											<span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-xs font-mono">
												{sprint.topic.category}
											</span>
										)}
									</div>
									<HabitBadge durationMinutes={sprint.durationMinutes} />
								</div>

								<div className="space-y-1 text-slate-600">
									<p>
										<strong className="text-slate-700">Pelajari:</strong>{" "}
										{sprint.whatLearned}
									</p>
									<p>
										<strong className="text-slate-700">Praktek:</strong>{" "}
										{sprint.whatPracticed}
									</p>
								</div>

								<div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
									<span className="text-slate-400">
										{new Date(sprint.createdAt).toLocaleDateString("id-ID", {
											day: "numeric",
											month: "short",
											year: "numeric",
										})}
									</span>

									<div className="flex items-center gap-3">
										{sprint.evidenceUrl && (
											<a
												href={sprint.evidenceUrl}
												target="_blank"
												rel="noreferrer"
												className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"
											>
												<span>Evidence ({sprint.evidenceType})</span>
												<ExternalLink size={10} />
											</a>
										)}
										<span className="text-slate-500 inline-flex items-center gap-1">
											<MessageSquare size={11} />
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
						onAction={() => setIsSprintModalOpen(true)}
					/>
				)}
			</div>

			<SprintModal
				isOpen={isSprintModalOpen}
				onClose={() => setIsSprintModalOpen(false)}
			/>
		</div>
	);
}
