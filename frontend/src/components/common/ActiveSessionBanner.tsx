import { CheckCircle2, Flame, Pause, Play, XCircle } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { useTimerStore } from "../../stores/timerStore.js";

export const ActiveSessionBanner: React.FC = () => {
	const {
		status,
		targetSeconds,
		elapsedSeconds,
		selectedTopicTitle,
		tick,
		pauseSession,
		resumeSession,
		finishEarly,
		abandonSession,
	} = useTimerStore();

	// Run the tick interval whenever status is RUNNING
	useEffect(() => {
		if (status !== "RUNNING") return;

		const interval = setInterval(() => {
			tick();
		}, 1000);

		return () => clearInterval(interval);
	}, [status, tick]);

	if (status !== "RUNNING" && status !== "PAUSED") {
		return null;
	}

	const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
	const remMinutes = Math.floor(remainingSeconds / 60);
	const remSecs = remainingSeconds % 60;
	const formattedRemaining = `${String(remMinutes).padStart(2, "0")}:${String(remSecs).padStart(2, "0")}`;

	const elapsedMinutes = Math.floor(elapsedSeconds / 60);
	const elapsedSecs = elapsedSeconds % 60;
	const formattedElapsed = `${String(elapsedMinutes).padStart(2, "0")}:${String(elapsedSecs).padStart(2, "0")}`;

	const isHabitQualified = elapsedMinutes >= 25;

	const handleAbandon = () => {
		if (
			confirm(
				"Batalkan sesi fokus ini? Progres waktu sesi ini tidak akan dicatat.",
			)
		) {
			abandonSession();
		}
	};

	return (
		<div className="bg-slate-900 text-white px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
			{/* Left: Active session info */}
			<div className="flex items-center gap-3 min-w-0">
				<div className="relative flex items-center justify-center">
					<div
						className={`w-2.5 h-2.5 rounded-full ${
							status === "RUNNING"
								? "bg-emerald-400 animate-ping"
								: "bg-amber-400"
						}`}
					/>
					<div
						className={`w-2.5 h-2.5 rounded-full absolute ${
							status === "RUNNING" ? "bg-emerald-500" : "bg-amber-500"
						}`}
					/>
				</div>

				<div className="flex items-center gap-2 min-w-0">
					<span className="font-semibold text-slate-200 shrink-0">
						{status === "RUNNING" ? "Fokus Berjalan:" : "Fokus Dijeda:"}
					</span>
					<span className="text-slate-300 font-medium truncate max-w-[220px] sm:max-w-xs md:max-w-md">
						{selectedTopicTitle || "Sesi Belajar Mandiri"}
					</span>
					{isHabitQualified && (
						<span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.2 rounded-full shrink-0">
							<Flame size={10} className="text-amber-400" />
							<span>Habit ≥25m</span>
						</span>
					)}
				</div>
			</div>

			{/* Right: Live timer & controls */}
			<div className="flex items-center gap-3 ml-auto shrink-0">
				<div className="flex items-center gap-1.5 font-mono">
					<span className="text-sm font-bold tracking-tight text-white">
						{formattedRemaining}
					</span>
					<span className="text-[10px] text-slate-400 font-normal">
						({formattedElapsed} berlalu)
					</span>
				</div>

				<div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
					{status === "RUNNING" ? (
						<button
							type="button"
							onClick={pauseSession}
							className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
							title="Jeda Sesi"
						>
							<Pause size={13} />
						</button>
					) : (
						<button
							type="button"
							onClick={resumeSession}
							className="p-1.5 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white transition-colors cursor-pointer"
							title="Lanjutkan Sesi"
						>
							<Play size={13} />
						</button>
					)}

					<button
						type="button"
						onClick={finishEarly}
						className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] inline-flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
						title="Selesaikan sesi sekarang dan catat refleksi"
					>
						<CheckCircle2 size={12} />
						<span>Selesaikan</span>
					</button>

					<button
						type="button"
						onClick={handleAbandon}
						className="p-1.5 rounded-md hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
						title="Batalkan Sesi"
					>
						<XCircle size={14} />
					</button>
				</div>
			</div>
		</div>
	);
};
