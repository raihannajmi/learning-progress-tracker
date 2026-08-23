import type { LucideIcon } from "lucide-react";
import type React from "react";

interface Props {
	label: string;
	value: string | number;
	subtext?: string;
	icon?: LucideIcon;
	iconColor?: string;
	badge?: React.ReactNode;
}

export const StatCard: React.FC<Props> = ({
	label,
	value,
	subtext,
	icon: Icon,
	iconColor = "text-slate-400",
	badge,
}) => {
	return (
		<div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
			<div className="flex items-center justify-between gap-2 mb-2">
				<span className="text-xs font-medium text-slate-500 tracking-tight">
					{label}
				</span>
				{badge ? (
					badge
				) : Icon ? (
					<Icon size={16} className={`${iconColor} shrink-0`} />
				) : null}
			</div>

			<div>
				<div className="text-2xl font-semibold text-slate-900 font-mono tracking-tight">
					{value}
				</div>
				{subtext && (
					<p className="text-xs text-slate-500 mt-1 font-normal leading-normal">
						{subtext}
					</p>
				)}
			</div>
		</div>
	);
};
