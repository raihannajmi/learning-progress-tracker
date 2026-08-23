import { BookOpen, CheckCircle2, Circle, Dumbbell } from "lucide-react";
import type React from "react";
import type { ChecklistProgressStatus } from "../../types/index.js";

interface Props {
	status: ChecklistProgressStatus;
	size?: "sm" | "md";
	showIcon?: boolean;
}

export const StatusBadge: React.FC<Props> = ({
	status,
	size = "sm",
	showIcon = true,
}) => {
	const getStatusConfig = () => {
		switch (status) {
			case "CAN_DO_INDEPENDENTLY":
				return {
					label: "Mandiri",
					textColor: "text-emerald-700",
					bgColor: "bg-emerald-50",
					borderColor: "border-emerald-200",
					icon: CheckCircle2,
				};
			case "PRACTICING":
				return {
					label: "Berlatih",
					textColor: "text-amber-700",
					bgColor: "bg-amber-50",
					borderColor: "border-amber-200",
					icon: Dumbbell,
				};
			case "LEARNING":
				return {
					label: "Mempelajari",
					textColor: "text-sky-700",
					bgColor: "bg-sky-50",
					borderColor: "border-sky-200",
					icon: BookOpen,
				};
			default:
				return {
					label: "Belum Mulai",
					textColor: "text-slate-600",
					bgColor: "bg-slate-100",
					borderColor: "border-slate-200",
					icon: Circle,
				};
		}
	};

	const config = getStatusConfig();
	const Icon = config.icon;
	const sizeClasses =
		size === "sm" ? "text-[11px] px-2.5 py-0.5" : "text-xs px-3 py-1";

	return (
		<span
			className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.textColor} ${config.bgColor} ${config.borderColor} ${sizeClasses}`}
		>
			{showIcon && <Icon size={size === "sm" ? 12 : 14} className="shrink-0" />}
			<span>{config.label}</span>
		</span>
	);
};
