import type { LucideIcon } from "lucide-react";
import type React from "react";

interface Props {
	icon: LucideIcon;
	title: string;
	description: string;
	actionLabel?: string;
	onAction?: () => void;
}

export const EmptyState: React.FC<Props> = ({
	icon: Icon,
	title,
	description,
	actionLabel,
	onAction,
}) => {
	return (
		<div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-white/60">
			<div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
				<Icon size={20} />
			</div>
			<h3 className="text-sm font-semibold text-slate-800">{title}</h3>
			<p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
				{description}
			</p>
			{actionLabel && onAction && (
				<button
					type="button"
					onClick={onAction}
					className="mt-4 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
				>
					{actionLabel}
				</button>
			)}
		</div>
	);
};
