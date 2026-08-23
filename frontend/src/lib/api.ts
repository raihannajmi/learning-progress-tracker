import axios from "axios";

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

// Response interceptor: extract response data
api.interceptors.response.use(
	(response) => {
		return response.data;
	},
	(error) => {
		const errorData = error.response?.data?.error;
		const message =
			errorData?.message || error.message || "Terjadi kesalahan sistem";
		return Promise.reject({
			message,
			code: errorData?.code,
			details: errorData?.details,
			status: error.response?.status,
		});
	},
);
