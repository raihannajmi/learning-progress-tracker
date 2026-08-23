import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Flame, Pause, Play, Plus, RotateCcw, Timer } from "lucide-react";
import React, { useEffect, useState } from "react";
import { EmptyState } from "../components/common/EmptyState.js";
import { Pagination } from "../components/common/Pagination.js";
import { PeerFeedbackCard } from "../components/common/PeerFeedbackCard.js";
import { SprintModal } from "../components/common/SprintModal.js";
import { StatCard } from "../components/common/StatCard.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type { LearningSprint } from "../types/index.js";

export const Route = createFileRoute("/sprints")({ component: SprintsPage });

function SprintsPage() {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// 25-Minute Focus Timer State
	const [timerSeconds, setTimerSeconds] = useState(25 * 60);
	const [isTimerRunning, setIsTimerRunning] = useState(false);
	const [_completedTimerSessions, setCompletedTimerSessions] = useState(0);

	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		} else if (user?.role === "ADMIN") {
			navigate({ to: "/admin" });
		}
	}, [isAuthenticated, user, navigate]);

	// Pomodoro Interval
	useEffect(() => {
		let interval: any = null;
		if (isTimerRunning && timerSeconds > 0) {
			interval = setInterval(() => {
				setTimerSeconds((prev) => prev - 1);
			}, 1000);
		} else if (timerSeconds === 0 && isTimerRunning) {
			setIsTimerRunning(false);
			setCompletedTimerSessions((prev) => prev + 1);
			setIsModalOpen(true);
		}
		return () => clearInterval(interval);
	}, [isTimerRunning, timerSeconds]);

	const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
	const resetTimer = () => {
		setIsTimerRunning(false);
		setTimerSeconds(25 * 60);
	};

	const formatTimer = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
	};

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
			<div className="space-y-6">
				<div className="h-44 bg-white border border-slate-200 rounded-xl animate-pulse" />
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
		<div className="space-y-6">
			{/* 1. Header & Interactive Focus Timer Panel */}
			<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
				<div className="space-y-1 max-w-xl">
					<div className="flex items-center gap-2">
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
							Metode Belajar
						</span>
						<span className="text-slate-300">•</span>
						<span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.2 rounded-full inline-flex items-center gap-1 font-mono">
							<Flame size={12} className="text-amber-500" />
							<span>Target Habit ≥25 Menit</span>
						</span>
					</div>

					<h2 className="text-lg font-semibold text-slate-900 tracking-tight">
						Sprint Belajar & Refleksi Mandiri
					</h2>

					<p className="text-xs text-slate-500 leading-relaxed">
						Fokus belajar tanpa distraksi selama minimal 25 menit. Catat apa
						yang Anda pelajari, latihan yang dibuat, dan kendala yang dihadapi.
					</p>
				</div>

				{/* Embedded 25:00 Focus Timer Widget */}
				<div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
					<div className="text-center px-2">
						<span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-medium">
							Timer Sesi Fokus
						</span>
						<div className="text-2xl font-mono font-bold text-slate-900 tracking-tight">
							{formatTimer(timerSeconds)}
						</div>
					</div>

					<div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
						<button
							type="button"
							onClick={toggleTimer}
							className={`p-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer ${
								isTimerRunning
									? "bg-amber-100 text-amber-800 hover:bg-amber-200"
									: "bg-blue-600 text-white hover:bg-blue-700"
							}`}
							title={isTimerRunning ? "Jeda Timer" : "Mulai Timer 25 Menit"}
						>
							{isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
							<span>{isTimerRunning ? "Jeda" : "Mulai"}</span>
						</button>

						<button
							type="button"
							onClick={resetTimer}
							className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
							title="Reset Timer"
						>
							<RotateCcw size={14} />
						</button>
					</div>
				</div>
			</div>

			{/* 2. KPI Metrics Bar */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<StatCard
					label="Total Sesi Sprint"
					value={sprints?.length || 0}
					subtext="Sesi refleksi terdokumentasi"
					icon={Timer}
					iconColor="text-slate-500"
				/>
				<StatCard
					label="Total Waktu Belajar"
					value={`${totalMinutes}m`}
					subtext="Akumulasi waktu fokus"
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
				<h3 className="text-sm font-semibold text-slate-900">
					Daftar Refleksi Sprint Anda
				</h3>

				<button
					type="button"
					onClick={() => setIsModalOpen(true)}
					className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
				>
					<Plus size={14} />
					<span>Catat Sprint Manual</span>
				</button>
			</div>

			{/* 4. Sprints Stream */}
			<div className="space-y-4">
				{sprints && sprints.length > 0 ? (
					<>
						{sprints
							.slice((currentPage - 1) * pageSize, currentPage * pageSize)
							.map((sprint) => (
								<PeerFeedbackCard key={sprint.id} sprint={sprint} />
							))}

						<Pagination
							currentPage={currentPage}
							totalPages={Math.ceil(sprints.length / pageSize) || 1}
							onPageChange={setCurrentPage}
							pageSize={pageSize}
							totalItems={sprints.length}
							onPageSizeChange={setPageSize}
							pageSizeOptions={[5, 10, 20]}
						/>
					</>
				) : (
					<EmptyState
						icon={Timer}
						title="Belum ada catatan sprint belajar"
						description="Gunakan timer 25:00 di atas atau klik tombol Catat Sprint Manual untuk mendokumentasikan proses belajar Anda."
						actionLabel="Mulai Catat Sesi Sekarang"
						onAction={() => setIsModalOpen(true)}
					/>
				)}
			</div>

			<SprintModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
		</div>
	);
}
