import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	Info,
	X,
} from "lucide-react";
import type React from "react";
import { type ToastItem, useToastStore } from "../../stores/toastStore.js";

export const ToastContainer: React.FC = () => {
	const { toasts, removeToast } = useToastStore();

	if (toasts.length === 0) return null;

	return (
		<div
			aria-live="polite"
			className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
		>
			{toasts.map((toast) => (
				<ToastCard
					key={toast.id}
					toast={toast}
					onClose={() => removeToast(toast.id)}
				/>
			))}
		</div>
	);
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({
	toast,
	onClose,
}) => {
	const getIcon = () => {
		switch (toast.type) {
			case "success":
				return (
					<CheckCircle2
						size={18}
						className="text-emerald-600 shrink-0 mt-0.5"
					/>
				);
			case "error":
				return (
					<AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
				);
			case "warning":
				return (
					<AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
				);
			case "info":
				return <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />;
		}
	};

	const getBorderColor = () => {
		switch (toast.type) {
			case "success":
				return "border-emerald-200 bg-emerald-50/90 text-emerald-950 shadow-emerald-500/5";
			case "error":
				return "border-rose-200 bg-rose-50/90 text-rose-950 shadow-rose-500/5";
			case "warning":
				return "border-amber-200 bg-amber-50/90 text-amber-950 shadow-amber-500/5";
			case "info":
				return "border-blue-200 bg-blue-50/90 text-blue-950 shadow-blue-500/5";
		}
	};

	return (
		<div
			className={`pointer-events-auto p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 flex items-start justify-between gap-3 text-xs ${getBorderColor()}`}
		>
			<div className="flex items-start gap-2.5 min-w-0">
				{getIcon()}
				<div className="space-y-0.5 min-w-0">
					<p className="font-semibold text-slate-900 leading-snug">
						{toast.title}
					</p>
					{toast.message && (
						<p className="text-[11px] text-slate-600 leading-relaxed break-words">
							{toast.message}
						</p>
					)}
				</div>
			</div>

			<button
				type="button"
				onClick={onClose}
				className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer shrink-0"
				title="Tutup Notifikasi"
			>
				<X size={14} />
			</button>
		</div>
	);
};
