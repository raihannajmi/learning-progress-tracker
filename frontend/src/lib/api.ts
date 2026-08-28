import axios from "axios";
import { useAuthStore } from "../stores/authStore.js";
import { toast } from "../stores/toastStore.js";

const API_BASE_URL =
	import.meta.env.VITE_API_URL ?? "http://localhost:5001/api/v1";

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor: inject Bearer token
api.interceptors.request.use(
	(config) => {
		try {
			const authStorage = localStorage.getItem("lpt-auth-storage");
			if (authStorage) {
				const parsed = JSON.parse(authStorage);
				if (parsed?.state?.token) {
					config.headers.Authorization = `Bearer ${parsed.state.token}`;
				}
			}
		} catch (_e) {
			// ignore
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Response interceptor: extract response data & handle session expiration
api.interceptors.response.use(
	(response) => {
		return response.data;
	},
	(error) => {
		const status = error.response?.status;
		const isLoginRequest = error.config?.url?.includes("/auth/google/verify");

		// Handle expired or invalid session token gracefully
		if (status === 401 && !isLoginRequest) {
			const { isAuthenticated, logout } = useAuthStore.getState();
			if (isAuthenticated) {
				logout();
				toast.warning(
					"Sesi Telah Berakhir",
					"Sesi login Anda telah berakhir atau tidak valid. Silakan login kembali.",
				);
				if (typeof window !== "undefined" && window.location.pathname !== "/") {
					window.location.href = "/";
				}
			}
		}

		const errorData = error.response?.data?.error;
		const message =
			errorData?.message || error.message || "Terjadi kesalahan sistem";
		return Promise.reject({
			message,
			code: errorData?.code,
			details: errorData?.details,
			status,
		});
	},
);
