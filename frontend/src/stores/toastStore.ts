import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
	id: string;
	type: ToastType;
	title: string;
	message?: string;
	duration?: number;
}

interface ToastState {
	toasts: ToastItem[];
	addToast: (toast: Omit<ToastItem, "id">) => string;
	removeToast: (id: string) => void;
	clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
	toasts: [],
	addToast: (toast) => {
		const id = Math.random().toString(36).substring(2, 9);
		const newToast: ToastItem = { ...toast, id };
		set((state) => ({
			toasts: [...state.toasts, newToast],
		}));

		const duration = toast.duration || 4000;
		if (duration > 0) {
			setTimeout(() => {
				set((state) => ({
					toasts: state.toasts.filter((t) => t.id !== id),
				}));
			}, duration);
		}

		return id;
	},
	removeToast: (id) =>
		set((state) => ({
			toasts: state.toasts.filter((t) => t.id !== id),
		})),
	clearToasts: () => set({ toasts: [] }),
}));

// Quick helper methods
export const toast = {
	success: (title: string, message?: string, duration?: number) =>
		useToastStore
			.getState()
			.addToast({ type: "success", title, message, duration }),
	error: (title: string, message?: string, duration?: number) =>
		useToastStore
			.getState()
			.addToast({ type: "error", title, message, duration }),
	warning: (title: string, message?: string, duration?: number) =>
		useToastStore
			.getState()
			.addToast({ type: "warning", title, message, duration }),
	info: (title: string, message?: string, duration?: number) =>
		useToastStore
			.getState()
			.addToast({ type: "info", title, message, duration }),
};
