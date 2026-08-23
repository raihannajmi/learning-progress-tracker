import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Flame, Play, Timer } from "lucide-react";
import React from "react";
import { EmptyState } from "../components/common/EmptyState.js";
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
			<div className="max-w-3xl mx-auto w-full space-y-8 animate-pulse py-4">
				<div className="h-24 bg-slate-100 rounded-lg" />
				<div className="h-20 bg-slate-100 rounded-lg" />
				<div className="h-32 bg-slate-100 rounded-lg" />
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="max-w-3xl mx-auto w-full py-12 text-center">
				<p className="text-xs text-rose-600">Gagal memuat data dashboard.</p>
			</div>
		);
	}

	const firstName = user?.name ? user.name.split(" ")[0] : "Mahasiswa";
	const totalMins =
		data.summary.totalMinutesLearned ?? data.summary.totalDurationMinutes ?? 0;

	// Clean structured topic & module info
	const activeTopic = data.nextAction?.topicTitle || data.currentWeek.title;
	const activeModule = data.nextAction?.moduleTitle || data.currentWeek.title;
	const activeStatement =
		data.nextAction?.statement || data.currentWeek.description;

	return (
		<div className="max-w-3xl mx-auto w-full space-y-9 py-2">
			{/* 1. Contextual Focus Header: Hierarchy = Context -> Module -> Topic -> Statement -> Action */}
			<section className="space-y-4">
				<div className="space-y-1.5">
					<div className="flex items-center gap-2 text-xs font-mono text-slate-400">
						<span>Halo, {firstName}</span>
						<span>•</span>
						<span>Minggu {data.currentWeek.weekNumber} dari 8</span>
						<span>•</span>
						<span className="text-slate-600 font-medium">{activeModule}</span>
					</div>

					<h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
						Lanjutkan Belajar:{" "}
						<span className="text-blue-600">{activeTopic}</span>
					</h1>

					{activeStatement && (
						<p className="text-xs text-slate-600 leading-relaxed max-w-2xl pt-0.5">
							{activeStatement}
						</p>
					)}
				</div>

				{/* Single Primary Action */}
				<div className="flex flex-wrap items-center gap-3.5 pt-1.5">
					<button
						type="button"
						onClick={() =>
							openReflectionModal(data.nextAction?.topicId || null, 25)
						}
						className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center gap-2 transition-all cursor-pointer hover:shadow-md"
					>
						<Play size={14} className="fill-white" />
						<span>Mulai Sesi Fokus — 25 Menit</span>
					</button>

					<span className="text-xs text-slate-500 font-mono">
						{totalMins}m fokus ({data.summary.habitReachedCount}x habit ≥25m)
					</span>
				</div>
			</section>

			<hr className="border-slate-200/80" />

			{/* 2. Syllabus Mastery Progression (Concise, Unboxed Summary) */}
			<section className="space-y-3.5">
				<div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
					<div>
						<h2 className="text-sm font-bold text-slate-900 tracking-tight">
							Progress Belajar Mandiri
						</h2>
						<p className="text-xs text-slate-500 mt-0.5">
							{data.summary.completedChecklists} dari{" "}
							{data.summary.totalChecklists} kompetensi mandiri tercapai (
							{data.summary.overallPercentage}%)
						</p>
					</div>

					<Link
						to="/roadmap"
						className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 shrink-0"
					>
						<span>Lihat Roadmap & Checklist</span>
						<ArrowRight size={13} />
					</Link>
				</div>

				{/* Minimal Progress Category Breakdown */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 pt-1">
					{data.categoryProgress.map((item) => (
						<div key={item.category} className="space-y-1 text-xs">
							<div className="flex items-center justify-between text-[11px] text-slate-700 font-mono">
								<span className="font-semibold text-slate-800 uppercase">
									{item.category}
								</span>
								<span className="text-slate-500">
									{item.independent}/{item.total} Mandiri ({item.percentage}%)
								</span>
							</div>

							{/* Minimal Line */}
							<div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
								<div
									className="bg-blue-600 h-full rounded-full transition-all duration-300"
									style={{ width: `${item.percentage}%` }}
								/>
							</div>
						</div>
					))}
				</div>
			</section>

			<hr className="border-slate-200/80" />

			{/* 3. Recent Learning Activity Stream (Chronological Natural List) */}
			<section className="space-y-3.5">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-sm font-bold text-slate-900 tracking-tight">
							Aktivitas Pembelajaran Terbaru
						</h2>
						<p className="text-xs text-slate-500 mt-0.5">
							Refleksi sesi fokus dan catatan latihan Anda
						</p>
					</div>

					<Link
						to="/class"
						className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
					>
						<span>Buka Feed & Diskusi Kelas</span>
						<ArrowRight size={13} />
					</Link>
				</div>

				{data.recentSprints && data.recentSprints.length > 0 ? (
					<div className="divide-y divide-slate-100 border-y border-slate-100">
						{data.recentSprints.slice(0, 4).map((sprint) => (
							<div
								key={sprint.id}
								className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
							>
								<div className="space-y-0.5 min-w-0">
									<div className="flex items-center gap-2">
										<span className="font-semibold text-slate-900">
											{sprint.topic?.title || "Belajar Mandiri"}
										</span>
										<span className="text-slate-300">•</span>
										<span className="font-mono text-[11px] text-slate-400">
											{new Date(sprint.createdAt).toLocaleDateString("id-ID", {
												day: "numeric",
												month: "short",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</div>

									<p className="text-slate-600 line-clamp-1">
										{sprint.whatLearned}
									</p>
								</div>

								<div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
									<span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm">
										{sprint.durationMinutes} menit
									</span>
									{sprint.isHabitQualified && (
										<span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-sm text-[11px] font-mono border border-amber-200 inline-flex items-center gap-1">
											<Flame size={11} className="text-amber-500" />
											<span>Habit</span>
										</span>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<EmptyState
						icon={Timer}
						title="Belum ada catatan sprint belajar"
						description="Mulai sesi fokus 25 menit pertama Anda untuk membangun kebiasaan belajar konsisten."
						actionLabel="Mulai Sesi Fokus Pertama"
						onAction={() =>
							openReflectionModal(data.nextAction?.topicId || null, 25)
						}
					/>
				)}
			</section>
		</div>
	);
}
