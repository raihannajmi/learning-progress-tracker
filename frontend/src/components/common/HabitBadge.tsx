import { Flame } from "lucide-react";
import type React from "react";

interface Props {
	durationMinutes: number;
	size?: "sm" | "md";
}

export const HabitBadge: React.FC<Props> = ({
	durationMinutes,
	size = "sm",
}) => {
	const isHabitQualified = durationMinutes >= 25;

	if (isHabitQualified) {
		return (
			<span
				className={`inline-flex items-center gap-1 font-medium font-mono rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${
					size === "sm" ? "text-[11px] px-2.5 py-0.5" : "text-xs px-3 py-1"
				}`}
				title="Sesi mencapai target kebiasaan minimal 25 menit"
			>
				<Flame
					size={size === "sm" ? 12 : 14}
					className="text-amber-500 shrink-0"
				/>
				<span>{durationMinutes}m (Habit)</span>
			</span>
		);
	}

	return (
		<span
			className={`inline-flex items-center gap-1 font-medium font-mono rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${
				size === "sm" ? "text-[11px] px-2.5 py-0.5" : "text-xs px-3 py-1"
			}`}
		>
			<span>{durationMinutes}m</span>
		</span>
	);
};
