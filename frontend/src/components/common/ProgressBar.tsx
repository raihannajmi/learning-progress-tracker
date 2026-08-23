import type React from "react";

interface Props {
	percentage: number;
	height?: "sm" | "md" | "lg";
	color?: string;
	showLabel?: boolean;
}

export const ProgressBar: React.FC<Props> = ({
	percentage,
	height = "md",
	color = "bg-blue-600",
	showLabel = false,
}) => {
	const clamped = Math.min(100, Math.max(0, percentage));

	const heightClass = {
		sm: "h-1.5",
		md: "h-2",
		lg: "h-2.5",
	}[height];

	return (
		<div className="w-full flex items-center gap-2">
			<div
				className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}
			>
				<div
					className={`${color} ${heightClass} rounded-full transition-all duration-300 ease-out`}
					style={{ width: `${clamped}%` }}
				/>
			</div>
			{showLabel && (
				<span className="text-xs font-mono font-medium text-slate-600 shrink-0 min-w-[36px] text-right">
					{clamped}%
				</span>
			)}
		</div>
	);
};
