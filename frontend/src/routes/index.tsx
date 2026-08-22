import { GoogleLogin } from "@react-oauth/google";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	CheckCircle2,
	Lock,
	ShieldCheck,
	Sparkles,
	Timer,
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
		if (isAuthenticated && user) {
			if (user.role === "ADMIN") {
				navigate({ to: "/admin" });
			} else {
				navigate({ to: "/dashboard" });
			}
		}
	}, [isAuthenticated, user, navigate]);

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
					"Gagal login. Pastikan email Anda sudah didaftarkan oleh Dosen/TA.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100">
			<div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
				<div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-200 mb-4">
					<Sparkles size={28} />
				</div>
				<h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
					Learning Progress Tracker
				</h2>
				<p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
					Pantau kebiasaan belajar minimal 25 menit, self-assessment, dan peer
					feedback web development.
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200/80">
					{errorMessage && (
						<div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
							<AlertCircle
								size={16}
								className="shrink-0 text-rose-600 mt-0.5"
							/>
							<div>
								<p className="font-semibold">Akses Ditolak</p>
								<p className="mt-0.5">{errorMessage}</p>
							</div>
						</div>
					)}

					{/* Google Sign-in */}
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
								shape="pill"
								size="large"
								theme="outline"
								text="signin_with"
								width="320"
							/>
						</div>

						<div className="flex items-center gap-1.5 justify-center text-[11px] text-slate-400 mt-2">
							<Lock size={12} />
							<span>
								Hanya akun yang telah didaftarkan Dosen/TA yang dapat masuk.
							</span>
						</div>

						{/* Dev Demo Login Quick Switcher */}
						<div className="mt-6 pt-6 border-t border-slate-100">
							<div className="text-center mb-3">
								<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
									⚡ Demo Akun Terdaftar
								</span>
								<p className="text-[10px] text-slate-400">
									Klik akun di bawah untuk simulasi login instan:
								</p>
							</div>

							<div className="grid grid-cols-1 gap-2">
								<button
									type="button"
									onClick={() => handleVerify("dev-mock:dosen@univ.ac.id")}
									disabled={loading}
									className="flex items-center justify-between p-2.5 text-xs font-semibold rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-all cursor-pointer text-left"
								>
									<div className="flex items-center gap-2">
										<ShieldCheck size={14} className="text-purple-600" />
										<span>Dosen Pengampu</span>
									</div>
									<span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-sm font-mono">
										ADMIN
									</span>
								</button>

								<button
									type="button"
									onClick={() => handleVerify("dev-mock:ta@univ.ac.id")}
									disabled={loading}
									className="flex items-center justify-between p-2.5 text-xs font-semibold rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-all cursor-pointer text-left"
								>
									<div className="flex items-center gap-2">
										<ShieldCheck size={14} className="text-purple-600" />
										<span>Asisten Dosen (TA)</span>
									</div>
									<span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-sm font-mono">
										ADMIN
									</span>
								</button>

								<button
									type="button"
									onClick={() =>
										handleVerify("dev-mock:andi@student.univ.ac.id")
									}
									disabled={loading}
									className="flex items-center justify-between p-2.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition-all cursor-pointer text-left"
								>
									<div className="flex items-center gap-2">
										<CheckCircle2 size={14} className="text-indigo-600" />
										<span>Andi Pratama (Kelas A)</span>
									</div>
									<span className="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded-sm font-mono">
										STUDENT
									</span>
								</button>

								<button
									type="button"
									onClick={() =>
										handleVerify("dev-mock:citra@student.univ.ac.id")
									}
									disabled={loading}
									className="flex items-center justify-between p-2.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition-all cursor-pointer text-left"
								>
									<div className="flex items-center gap-2">
										<CheckCircle2 size={14} className="text-indigo-600" />
										<span>Citra Lestari (Kelas B)</span>
									</div>
									<span className="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded-sm font-mono">
										STUDENT
									</span>
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Feature Highlights from PRD */}
				<div className="mt-8 grid grid-cols-3 gap-3 text-center">
					<div className="p-3 bg-white/70 rounded-xl border border-slate-200/60 shadow-xs">
						<Timer size={18} className="mx-auto text-indigo-600 mb-1" />
						<span className="text-[11px] font-bold text-slate-800 block">
							≥25 Min Habit
						</span>
						<span className="text-[10px] text-slate-500">Learning Sprint</span>
					</div>

					<div className="p-3 bg-white/70 rounded-xl border border-slate-200/60 shadow-xs">
						<CheckCircle2 size={18} className="mx-auto text-emerald-600 mb-1" />
						<span className="text-[11px] font-bold text-slate-800 block">
							Self-Assessment
						</span>
						<span className="text-[10px] text-slate-500">4-Tahap Progres</span>
					</div>

					<div className="p-3 bg-white/70 rounded-xl border border-slate-200/60 shadow-xs">
						<Users size={18} className="mx-auto text-sky-600 mb-1" />
						<span className="text-[11px] font-bold text-slate-800 block">
							Peer Feedback
						</span>
						<span className="text-[10px] text-slate-500">Social Support</span>
					</div>
				</div>
			</div>
		</div>
	);
}
