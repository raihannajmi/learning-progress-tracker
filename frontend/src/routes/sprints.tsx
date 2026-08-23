import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import {
	CheckCircle2,
	Flame,
	Pause,
	Play,
	Plus,
	Timer,
	Volume2,
	VolumeX,
	XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { EmptyState } from "../components/common/EmptyState.js";
import { Pagination } from "../components/common/Pagination.js";
import { PeerFeedbackCard } from "../components/common/PeerFeedbackCard.js";
import { StatCard } from "../components/common/StatCard.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import { useTimerStore } from "../stores/timerStore.js";
import type {
	LearningSprint,
	PaginatedResponse,
	RoadmapWeek,
} from "../types/index.js";

interface SprintSearchParams {
	page?: number;
	limit?: number;
}

export const Route = createFileRoute("/sprints")({
	validateSearch: (search: Record<string, unknown>): SprintSearchParams => {
		return {
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 10,
		};
	},
	component: SprintsPage,
});

function SprintsPage() {
	const navigate = useNavigate();
	const searchParams = useSearch({ from: "/sprints" });
	const { user, isAuthenticated } = useAuthStore();

	const {
		status,
		targetSeconds,
		elapsedSeconds,
		selectedTopicTitle,
		isSoundEnabled,
		startSession,
		pauseSession,
		resumeSession,
		finishEarly,
		abandonSession,
		toggleSound,
		openReflectionModal,
	} = useTimerStore();

	const currentPage = searchParams.page || 1;
	const pageSize = searchParams.limit || 10;

	// Local state for setting up next session
	const [setupTopicId, setSetupTopicId] = useState<string>("");
	const [setupDurationMinutes, setSetupDurationMinutes] = useState<number>(25);

	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		} else if (user?.role === "ADMIN") {
			navigate({ to: "/admin" });
		}
	}, [isAuthenticated, user, navigate]);

	const updateFilters = (updates: Partial<SprintSearchParams>) => {
		navigate({
			search: (prev) => ({
				...prev,
				...updates,
			}),
		});
	};

	// Fetch Roadmap for topic picker
	const { data: roadmapWeeks } = useQuery<RoadmapWeek[]>({
		queryKey: ["roadmap"],
		queryFn: async () => {
			const res: any = await api.get("/roadmap");
			return res.data;
		},
		enabled: isAuthenticated,
	});

	const allTopics =
		roadmapWeeks?.flatMap((w) =>
			w.topics.map((t) => ({
				...t,
				weekNumber: w.weekNumber,
				weekTitle: w.title,
			})),
		) || [];

	// Fetch Sprints for this user (Server-Side Paginated)
	const { data: sprintResponse, isLoading } = useQuery<
		PaginatedResponse<LearningSprint>
	>({
		queryKey: [
			"sprints",
			{ userId: user?.id, page: currentPage, limit: pageSize },
		],
		queryFn: async () => {
			const params = new URLSearchParams();
			params.set("userId", user?.id || "");
			params.set("page", String(currentPage));
			params.set("limit", String(pageSize));

			const res: any = await api.get(`/sprints?${params.toString()}`);
			return res;
		},
		enabled: !!user?.id,
	});

	const sprints = sprintResponse?.data || [];
	const pagination = sprintResponse?.pagination;

	const totalMinutes =
		sprints?.reduce((acc, s) => acc + s.durationMinutes, 0) || 0;
	const habitReached = sprints?.filter((s) => s.isHabitQualified).length || 0;

	const handleStartSession = () => {
		const topic = allTopics.find((t) => t.id === setupTopicId);
		startSession(
			setupTopicId || null,
			topic ? `${topic.title}` : null,
			setupDurationMinutes,
		);
	};

	const handleAbandon = () => {
		if (confirm("Batalkan sesi fokus ini? Progres waktu tidak akan dicatat.")) {
			abandonSession();
		}
	};

	// Timer calculations
	const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
	const remMinutes = Math.floor(remainingSeconds / 60);
	const remSecs = remainingSeconds % 60;
	const formattedRemaining = `${String(remMinutes).padStart(2, "0")}:${String(remSecs).padStart(2, "0")}`;

	const elapsedMinutes = Math.floor(elapsedSeconds / 60);
	const elapsedSecs = elapsedSeconds % 60;
	const formattedElapsed = `${String(elapsedMinutes).padStart(2, "0")}:${String(elapsedSecs).padStart(2, "0")}`;

	const progressPercent = Math.min(
		100,
		Math.round((elapsedSeconds / targetSeconds) * 100),
	);

	if (isLoading && !sprintResponse) {
		return (
			<div className="max-w-3xl mx-auto w-full space-y-6">
				<div className="h-48 bg-white border border-slate-200 rounded-xl animate-pulse" />
				<div className="grid grid-cols-3 gap-4">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-20 bg-white border border-slate-200 rounded-xl animate-pulse"
						/>
					))}
				</div>
				<div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto w-full space-y-6">
			{/* 1. Interactive Focus Session Tracker */}
			<div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
				{status === "IDLE" || status === "COMPLETED" ? (
					/* IDLE / SETUP VIEW */
					<div className="p-6 md:p-8 space-y-6">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
										Focus Mode
									</span>
									<span className="text-slate-300">•</span>
									<span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-mono">
										<Flame size={12} className="text-amber-500" />
										<span>Target Standar ≥25 Menit</span>
									</span>
								</div>

								<h2 className="text-lg font-semibold text-slate-900 tracking-tight">
									Mulai Sesi Fokus (Learning Sprint)
								</h2>

								<p className="text-xs text-slate-500 leading-relaxed max-w-xl">
									Pilih materi yang ingin Anda pelajari tanpa distraksi. Sistem
									dilengkapi dengan detak jam audio fokus dan bel penyelesaian
									otomatis.
								</p>
							</div>

							<div className="flex items-center gap-2 shrink-0">
								<button
									type="button"
									onClick={toggleSound}
									className={`px-3 py-2 text-xs font-medium rounded-lg border inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
										isSoundEnabled
											? "bg-amber-50 border-amber-200 text-amber-800"
											: "bg-slate-50 border-slate-200 text-slate-500"
									}`}
									title={
										isSoundEnabled
											? "Suara detak jam aktif"
											: "Suara detak jam nonaktif"
									}
								>
									{isSoundEnabled ? (
										<Volume2 size={14} className="text-amber-600" />
									) : (
										<VolumeX size={14} />
									)}
									<span>
										{isSoundEnabled ? "Suara Detak On" : "Suara Detak Off"}
									</span>
								</button>

								<button
									type="button"
									onClick={() => openReflectionModal(null, 25)}
									className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
								>
									<Plus size={14} />
									<span>Catat Manual</span>
								</button>
							</div>
						</div>

						{/* Setup Controls: Target Topic & Duration Presets */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
							{/* Topic Selector */}
							<div className="md:col-span-2 space-y-2">
								<label className="block text-xs font-semibold text-slate-800">
									Pilih Topik Silabus yang Akan Dipelajari
								</label>
								<select
									value={setupTopicId}
									onChange={(e) => setSetupTopicId(e.target.value)}
									className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
								>
									<option value="">-- Belajar Mandiri / Topik Bebas --</option>
									{roadmapWeeks?.map((week) => (
										<optgroup
											key={week.id}
											label={`Minggu ${week.weekNumber}: ${week.title}`}
										>
											{week.topics.map((t) => (
												<option key={t.id} value={t.id}>
													[{t.category}] {t.title}
												</option>
											))}
										</optgroup>
									))}
								</select>
							</div>

							{/* Duration Presets */}
							<div className="space-y-2">
								<label className="block text-xs font-semibold text-slate-800">
									Target Durasi Fokus
								</label>
								<div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-lg">
									{[15, 25, 50].map((dur) => (
										<button
											key={dur}
											type="button"
											onClick={() => setSetupDurationMinutes(dur)}
											className={`py-1.5 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
												setupDurationMinutes === dur
													? "bg-white text-blue-700 shadow-xs font-semibold"
													: "text-slate-600 hover:text-slate-900"
											}`}
										>
											{dur}m
										</button>
									))}
								</div>
							</div>
						</div>

						{/* Launch Primary CTA */}
						<div className="pt-2">
							<button
								type="button"
								onClick={handleStartSession}
								className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-md"
							>
								<Play size={15} />
								<span>Mulai Sesi Fokus ({setupDurationMinutes} Menit)</span>
							</button>
						</div>
					</div>
				) : (
					/* ACTIVE / PAUSED RUNNING SESSION VIEW */
					<div className="p-6 md:p-8 space-y-6 bg-slate-900 text-white">
						{/* Top Bar: Topic Badge & Habit Indicator */}
						<div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
							<div className="flex items-center gap-2 min-w-0">
								<div className="relative flex items-center justify-center">
									<div
										className={`w-3 h-3 rounded-full ${
											status === "RUNNING"
												? "bg-emerald-400 animate-ping"
												: "bg-amber-400"
										}`}
									/>
									<div
										className={`w-3 h-3 rounded-full absolute ${
											status === "RUNNING" ? "bg-emerald-500" : "bg-amber-500"
										}`}
									/>
								</div>

								<span className="text-xs font-mono uppercase tracking-wider text-slate-400">
									{status === "RUNNING"
										? "Sesi Sedang Berjalan"
										: "Sesi Dijeda"}
								</span>
								<span className="text-slate-600">•</span>
								<span className="text-xs font-semibold text-slate-200 truncate">
									{selectedTopicTitle || "Sesi Belajar Mandiri"}
								</span>
							</div>

							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={toggleSound}
									className={`p-1.5 rounded-lg text-xs font-mono border transition-colors cursor-pointer inline-flex items-center gap-1 ${
										isSoundEnabled
											? "text-amber-400 border-amber-500/30 bg-amber-950/40 hover:bg-amber-950/60"
											: "text-slate-500 border-slate-800 bg-slate-800/60 hover:bg-slate-800"
									}`}
									title={
										isSoundEnabled
											? "Mute suara detak jam"
											: "Aktifkan suara detak jam"
									}
								>
									{isSoundEnabled ? (
										<Volume2 size={13} />
									) : (
										<VolumeX size={13} />
									)}
									<span className="text-[11px]">
										{isSoundEnabled ? "Suara Detak On" : "Suara Mute"}
									</span>
								</button>

								{elapsedMinutes >= 25 && (
									<span className="inline-flex items-center gap-1 text-xs font-mono text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
										<Flame size={12} className="text-amber-400" />
										<span>Target Habit ≥25m Tercapai!</span>
									</span>
								)}
							</div>
						</div>

						{/* Central Timer & Progress Ring Display */}
						<div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
							<div className="text-6xl sm:text-7xl font-mono font-bold tracking-tighter text-white">
								{formattedRemaining}
							</div>

							<p className="text-xs text-slate-400 font-mono">
								{formattedElapsed} waktu fokus berlalu ({progressPercent}%
								selesai)
							</p>

							{/* Progress Line */}
							<div className="w-full max-w-md bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
								<div
									className="h-full bg-blue-500 transition-all duration-300 rounded-full"
									style={{ width: `${progressPercent}%` }}
								/>
							</div>
						</div>

						{/* Bottom Controls: Pause/Resume, Finish Early, Abandon */}
						<div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-800">
							{status === "RUNNING" ? (
								<button
									type="button"
									onClick={pauseSession}
									className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
								>
									<Pause size={14} />
									<span>Jeda Sesi</span>
								</button>
							) : (
								<button
									type="button"
									onClick={resumeSession}
									className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
								>
									<Play size={14} />
									<span>Lanjutkan Fokus</span>
								</button>
							)}

							<button
								type="button"
								onClick={finishEarly}
								className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
							>
								<CheckCircle2 size={14} />
								<span>Selesaikan Sesi & Catat Refleksi</span>
							</button>

							<button
								type="button"
								onClick={handleAbandon}
								className="px-3.5 py-2 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
							>
								<XCircle size={14} />
								<span>Batalkan</span>
							</button>
						</div>
					</div>
				)}
			</div>

			{/* 2. KPI Metrics Bar */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<StatCard
					label="Total Sesi Sprint"
					value={pagination?.total || sprints?.length || 0}
					subtext="Sesi refleksi terdokumentasi"
					icon={Timer}
					iconColor="text-slate-500"
				/>
				<StatCard
					label="Total Waktu Belajar"
					value={`${totalMinutes} menit`}
					subtext={`Rata-rata ${
						sprints?.length ? Math.round(totalMinutes / sprints.length) : 0
					}m / sesi`}
					icon={Timer}
					iconColor="text-blue-600"
				/>
				<StatCard
					label="Target Kebiasaan (≥25m)"
					value={`${habitReached}x`}
					subtext="Memenuhi standar habit harian"
					icon={Flame}
					iconColor="text-amber-500"
				/>
			</div>

			{/* 3. Action Bar */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-sm font-semibold text-slate-900">
						Daftar Refleksi Sprint Anda
					</h3>
					<p className="text-xs text-slate-500">
						Dokumentasi progres belajar dan link bukti submission
					</p>
				</div>

				<button
					type="button"
					onClick={() => openReflectionModal(null, 25)}
					className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
				>
					<Plus size={14} />
					<span>Catat Refleksi Manual</span>
				</button>
			</div>

			{/* 4. Sprints Stream */}
			<div className="space-y-4">
				{sprints && sprints.length > 0 ? (
					<>
						{sprints.map((sprint) => (
							<PeerFeedbackCard key={sprint.id} sprint={sprint} />
						))}

						{pagination && pagination.totalPages > 1 && (
							<Pagination
								currentPage={currentPage}
								totalPages={pagination.totalPages}
								onPageChange={(page) => updateFilters({ page })}
								pageSize={pageSize}
								totalItems={pagination.total}
								onPageSizeChange={(limit) => updateFilters({ limit, page: 1 })}
								pageSizeOptions={[5, 10, 20]}
							/>
						)}
					</>
				) : (
					<EmptyState
						icon={Timer}
						title="Belum ada catatan sprint belajar"
						description="Pilih topik di atas dan mulai sesi fokus 25 menit untuk mendokumentasikan proses belajar Anda."
						actionLabel="Mulai Sesi Fokus Pertama"
						onAction={handleStartSession}
					/>
				)}
			</div>
		</div>
	);
}
