import type React from "react";

interface Props {
	percentage: number;
	label?: string;
	sublabel?: string;
	color?: "indigo" | "emerald" | "sky" | "amber" | "purple";
}

const colorMap = {
	indigo: "bg-indigo-600",
	emerald: "bg-emerald-600",
	sky: "bg-sky-600",
	amber: "bg-amber-600",
	purple: "bg-purple-600",
};

export const ProgressBar: React.FC<Props> = ({
	percentage,
	label,
	sublabel,
	color = "indigo",
}) => {
	const safePercentage = Math.min(100, Math.max(0, percentage));

	return (
		<div className="w-full">
			{(label || sublabel) && (
				<div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-slate-700">
					<span>{label}</span>
					<span className="text-slate-500 font-mono font-medium">
						{sublabel || `${safePercentage}%`}
					</span>
				</div>
			)}
			<div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
				<div
					className={`h-full ${colorMap[color]} transition-all duration-500 ease-out rounded-full`}
					style={{ width: `${safePercentage}%` }}
				/>
			</div>
		</div>
	);
};
