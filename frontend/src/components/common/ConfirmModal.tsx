import { AlertTriangle, HelpCircle, Trash2, X } from "lucide-react";
import type React from "react";

interface ConfirmModalProps {
	isOpen: boolean;
	title: string;
	description?: string;
	message?: string;
	confirmText?: string;
	confirmLabel?: string;
	cancelText?: string;
	cancelLabel?: string;
	variant?: "danger" | "warning" | "primary";
	isLoading?: boolean;
	onConfirm: () => void;
	onCancel?: () => void;
	onClose?: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
	isOpen,
	title,
	description,
	message,
	confirmText,
	confirmLabel,
	cancelText,
	cancelLabel,
	variant = "danger",
	isLoading = false,
	onConfirm,
	onCancel,
	onClose,
}) => {
	if (!isOpen) return null;

	const handleCancel = onCancel || onClose || (() => {});
	const descText = description || message;
	const confirmBtnText = confirmText || confirmLabel || "Ya, Lanjutkan";
	const cancelBtnText = cancelText || cancelLabel || "Batal";

	const getIcon = () => {
		switch (variant) {
			case "danger":
				return (
					<div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
						<Trash2 size={20} />
					</div>
				);
			case "warning":
				return (
					<div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
						<AlertTriangle size={20} />
					</div>
				);
			case "primary":
				return (
					<div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
						<HelpCircle size={20} />
					</div>
				);
		}
	};

	const getConfirmButtonClasses = () => {
		switch (variant) {
			case "danger":
				return "bg-rose-600 hover:bg-rose-700 text-white";
			case "warning":
				return "bg-amber-600 hover:bg-amber-700 text-white";
			case "primary":
				return "bg-blue-600 hover:bg-blue-700 text-white";
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
			<div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200 text-center relative space-y-3">
				<button
					type="button"
					onClick={handleCancel}
					disabled={isLoading}
					className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer disabled:opacity-50"
				>
					<X size={16} />
				</button>

				{getIcon()}

				<div className="space-y-1">
					<h3 className="text-sm font-semibold text-slate-900 leading-snug">
						{title}
					</h3>
					{descText && (
						<p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
							{descText}
						</p>
					)}
				</div>

				<div className="flex justify-center gap-2 pt-3 border-t border-slate-100">
					<button
						type="button"
						onClick={handleCancel}
						disabled={isLoading}
						className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
					>
						{cancelBtnText}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isLoading}
						className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${getConfirmButtonClasses()}`}
					>
						{isLoading ? "Memproses..." : confirmBtnText}
					</button>
				</div>
			</div>
		</div>
	);
};
