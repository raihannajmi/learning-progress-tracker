import {
	BookOpen,
	CheckCircle2,
	Circle,
	Dumbbell,
	Loader2,
} from "lucide-react";
import type React from "react";
import type { ChecklistProgressStatus } from "../../types/index.js";

interface Props {
	status: ChecklistProgressStatus;
	onChange: (nextStatus: ChecklistProgressStatus) => void;
	isLoading?: boolean;
}

const statusCycle: ChecklistProgressStatus[] = [
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
	const getNextStatus = (
		current: ChecklistProgressStatus,
	): ChecklistProgressStatus => {
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
				<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
					<Loader2 size={12} className="animate-spin" />
					<span>Menyimpan...</span>
				</span>
			);
		}

		switch (status) {
			case "CAN_DO_INDEPENDENTLY":
				return (
					<span className="inline-flex items-center gap-1.5 px-3 py-1 sm:py-0.5 rounded-full text-xs sm:text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors select-none">
						<CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
						<span>Mandiri</span>
					</span>
				);
			case "PRACTICING":
				return (
					<span className="inline-flex items-center gap-1.5 px-3 py-1 sm:py-0.5 rounded-full text-xs sm:text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors select-none">
						<Dumbbell size={13} className="text-amber-600 shrink-0" />
						<span>Berlatih</span>
					</span>
				);
			case "LEARNING":
				return (
					<span className="inline-flex items-center gap-1.5 px-3 py-1 sm:py-0.5 rounded-full text-xs sm:text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors select-none">
						<BookOpen size={13} className="text-sky-600 shrink-0" />
						<span>Mempelajari</span>
					</span>
				);
			default:
				return (
					<span className="inline-flex items-center gap-1.5 px-3 py-1 sm:py-0.5 rounded-full text-xs sm:text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors select-none">
						<Circle size={13} className="text-slate-400 shrink-0" />
						<span>Belum Mulai</span>
					</span>
				);
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			title="Klik untuk mengubah status self-assessment"
			className="cursor-pointer transition-transform active:scale-95 text-left focus:outline-hidden inline-flex items-center"
		>
			{renderBadge()}
		</button>
	);
};
