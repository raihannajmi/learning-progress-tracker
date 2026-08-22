import { CheckCircle2, Circle, Clock, Flame, Loader2 } from "lucide-react";
import type React from "react";
import type { ChecklistStatus } from "../../types/index.js";

interface Props {
	status: ChecklistStatus;
	onChange: (nextStatus: ChecklistStatus) => void;
	isLoading?: boolean;
}

const statusCycle: ChecklistStatus[] = [
	"NOT_STARTED",
	"LEARNING",
	"PRACTICING",
	"CAN_DO_INDEPENDENTLY",
];

export const SelfAssessmentButton: React.FC<Props> = ({
	status,
	onChange,
	isLoading = false,
}) => {
	const getNextStatus = (current: ChecklistStatus): ChecklistStatus => {
		const idx = statusCycle.indexOf(current);
		return statusCycle[(idx + 1) % statusCycle.length];
	};

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isLoading) return;
		onChange(getNextStatus(status));
	};

	const renderBadge = () => {
		if (isLoading) {
			return (
				<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
					<Loader2 size={13} className="animate-spin" />
					<span>Menyimpan...</span>
				</span>
			);
		}

		switch (status) {
			case "CAN_DO_INDEPENDENTLY":
				return (
					<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300 hover:bg-emerald-200 transition-all">
						<CheckCircle2 size={14} className="text-emerald-600" />
						<span>✓ Bisa Mandiri</span>
					</span>
				);
			case "PRACTICING":
				return (
					<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 ring-1 ring-amber-300 hover:bg-amber-200 transition-all">
						<Flame size={14} className="text-amber-600" />
						<span>◐ Sedang Berlatih</span>
					</span>
				);
			case "LEARNING":
				return (
					<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 ring-1 ring-sky-300 hover:bg-sky-200 transition-all">
						<Clock size={14} className="text-sky-600" />
						<span>◐ Mempelajari Konsep</span>
					</span>
				);
			default:
				return (
					<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200 transition-all">
						<Circle size={14} className="text-slate-400" />
						<span>○ Belum Mulai</span>
					</span>
				);
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			title="Klik untuk mengubah status self-assessment"
			className="cursor-pointer transition-transform active:scale-95 text-left focus:outline-hidden"
		>
			{renderBadge()}
		</button>
	);
};
