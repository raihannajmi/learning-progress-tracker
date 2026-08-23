import { GoogleLogin } from "@react-oauth/google";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	CheckCircle2,
	Code2,
	Lock,
	ShieldCheck,
	Timer,
	User,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";

export const Route = createFileRoute("/")({ component: LoginPage });

function LoginPage() {
	const navigate = useNavigate();
	const { isAuthenticated, user, setAuth } = useAuthStore();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// 1. Check if token returned via redirect query param
		const urlParams = new URLSearchParams(window.location.search);
		const urlToken = urlParams.get("token");
		if (urlToken) {
			setLoading(true);
			api
				.get("/auth/me", {
					headers: { Authorization: `Bearer ${urlToken}` },
				})
				.then((res: any) => {
					if (res?.data) {
						setAuth(urlToken, res.data);
						window.history.replaceState({}, document.title, "/");
						if (res.data.role === "ADMIN") {
							navigate({ to: "/admin" });
						} else {
							navigate({ to: "/dashboard" });
						}
					}
				})
				.catch((err: any) => {
					setErrorMessage(err.message || "Sesi login tidak valid");
				})
				.finally(() => {
					setLoading(false);
				});
			return;
		}

		// 2. Redirect if already authenticated
		if (isAuthenticated && user) {
			if (user.role === "ADMIN") {
				navigate({ to: "/admin" });
			} else {
				navigate({ to: "/dashboard" });
			}
		}
	}, [isAuthenticated, user, navigate, setAuth]);

	const handleVerify = async (credential: string) => {
		setLoading(true);
		setErrorMessage(null);
		try {
			const res: any = await api.post("/auth/google/verify", { credential });
			if (res?.data?.token && res?.data?.user) {
				setAuth(res.data.token, res.data.user);
				if (res.data.user.role === "ADMIN") {
					navigate({ to: "/admin" });
				} else {
					navigate({ to: "/dashboard" });
				}
			}
		} catch (err: any) {
			setErrorMessage(
				err.message ||
					"Gagal login. Pastikan email Google Anda sudah didaftarkan oleh Dosen atau Asisten Dosen.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				{/* Brand Header */}
				<div className="text-center">
					<div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
						<Code2 size={20} />
					</div>
					<h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
						LearningTracker
					</h1>
					<p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
						Platform pelacak progres belajar web development, pembiasaan sprint
						25 menit, dan self-assessment mandiri.
					</p>
				</div>

				{/* Card Container */}
				<div className="mt-8 bg-white py-8 px-6 sm:px-8 rounded-xl border border-slate-200 shadow-xs">
					{errorMessage && (
						<div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800 text-xs">
							<AlertCircle
								size={15}
								className="shrink-0 text-rose-600 mt-0.5"
							/>
							<div>
								<p className="font-semibold">Akses Ditolak</p>
								<p className="mt-0.5 leading-relaxed">{errorMessage}</p>
							</div>
						</div>
					)}

					{/* Google Sign-In */}
					<div className="space-y-4">
						<div className="flex justify-center">
							<GoogleLogin
								onSuccess={(credentialResponse) => {
									if (credentialResponse.credential) {
										handleVerify(credentialResponse.credential);
									}
								}}
								onError={() => {
									setErrorMessage("Login Google gagal atau dibatalkan.");
								}}
								useOneTap={false}
								shape="rectangular"
								size="large"
								theme="outline"
								text="signin_with"
								width="320"
							/>
						</div>

						<div className="flex items-center gap-1.5 justify-center text-[11px] text-slate-400">
							<Lock size={12} />
							<span>
								Akses dibatasi untuk email mahasiswa & pengajar terdaftar.
							</span>
						</div>

						{/* Quick Demo Switcher (Only visible in Development mode) */}
						{import.meta.env.DEV && (
							<div className="mt-6 pt-5 border-t border-slate-100">
								<div className="mb-2.5">
									<span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
										Simulasi Akun Terdaftar (Dev Mode)
									</span>
								</div>

								<div className="space-y-2">
									<button
										type="button"
										onClick={() =>
											handleVerify("dev-mock:najmiraihanworks@gmail.com")
										}
										disabled={loading}
										className="w-full flex items-center justify-between p-2.5 text-xs font-medium rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors cursor-pointer text-left"
									>
										<div className="flex items-center gap-2 min-w-0">
											<ShieldCheck
												size={14}
												className="text-blue-600 shrink-0"
											/>
											<span className="truncate">Alif Najmi Raihan</span>
										</div>
										<span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm font-mono font-medium shrink-0">
											DOSEN / ADMIN
										</span>
									</button>

									<button
										type="button"
										onClick={() =>
											handleVerify("dev-mock:student.01@demo.univ.ac.id")
										}
										disabled={loading}
										className="w-full flex items-center justify-between p-2.5 text-xs font-medium rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors cursor-pointer text-left"
									>
										<div className="flex items-center gap-2 min-w-0">
											<User size={14} className="text-slate-500 shrink-0" />
											<span className="truncate">
												Budi Santoso (Rabu, DC 3A)
											</span>
										</div>
										<span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm font-mono font-medium shrink-0">
											MAHASISWA
										</span>
									</button>

									<button
										type="button"
										onClick={() =>
											handleVerify("dev-mock:student.16@demo.univ.ac.id")
										}
										disabled={loading}
										className="w-full flex items-center justify-between p-2.5 text-xs font-medium rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors cursor-pointer text-left"
									>
										<div className="flex items-center gap-2 min-w-0">
											<User size={14} className="text-slate-500 shrink-0" />
											<span className="truncate">
												Yunita Sari (Kamis, D1 327)
											</span>
										</div>
										<span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm font-mono font-medium shrink-0">
											MAHASISWA
										</span>
									</button>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Subtle Footer Pillars */}
				<div className="mt-8 grid grid-cols-3 gap-3 text-center text-xs text-slate-500">
					<div className="p-2.5 rounded-lg border border-slate-200 bg-white">
						<Timer size={15} className="mx-auto text-blue-600 mb-1" />
						<span className="font-medium text-slate-800 block text-[11px]">
							Sprint 25m
						</span>
						<span className="text-[10px] text-slate-400">Pembiasaan Fokus</span>
					</div>
					<div className="p-2.5 rounded-lg border border-slate-200 bg-white">
						<CheckCircle2 size={15} className="mx-auto text-emerald-600 mb-1" />
						<span className="font-medium text-slate-800 block text-[11px]">
							4-State Progress
						</span>
						<span className="text-[10px] text-slate-400">Self-Assessment</span>
					</div>
					<div className="p-2.5 rounded-lg border border-slate-200 bg-white">
						<Users size={15} className="mx-auto text-slate-600 mb-1" />
						<span className="font-medium text-slate-800 block text-[11px]">
							Peer Feedback
						</span>
						<span className="text-[10px] text-slate-400">
							Umpan Balik Kelas
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
