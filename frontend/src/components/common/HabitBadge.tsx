import { Target, Timer } from "lucide-react";
import type React from "react";

interface Props {
	durationMinutes: number;
}

export const HabitBadge: React.FC<Props> = ({ durationMinutes }) => {
	const isReached = durationMinutes >= 25;

	if (isReached) {
		return (
			<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
				<Target size={13} className="text-emerald-600" />
				<span>≥25m Habit Target Reached ({durationMinutes}m)</span>
			</span>
		);
	}

	return (
		<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-200">
			<Timer size={13} className="text-amber-600" />
			<span>{durationMinutes}m (&lt;25m target)</span>
		</span>
	);
};
