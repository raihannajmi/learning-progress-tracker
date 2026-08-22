import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	ExternalLink,
	Filter,
	HelpCircle,
	MessageSquare,
	ShieldCheck,
	Timer,
	Users,
} from "lucide-react";
import React, { useState } from "react";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type { AdminDashboardData, ClassGroup } from "../types/index.js";

export const Route = createFileRoute("/admin")({
	component: AdminDashboardPage,
});

function AdminDashboardPage() {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const [selectedClassId, setSelectedClassId] = useState<string>("");

	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		} else if (user?.role !== "ADMIN") {
			navigate({ to: "/dashboard" });
		}
	}, [isAuthenticated, user, navigate]);

	// Fetch classes
	const { data: classesList } = useQuery<ClassGroup[]>({
		queryKey: ["classes"],
		queryFn: async () => {
			const res: any = await api.get("/classes");
			return res.data;
		},
	});

	// Fetch TA Dashboard metrics
	const { data, isLoading } = useQuery<AdminDashboardData>({
		queryKey: ["adminDashboard", { classId: selectedClassId }],
		queryFn: async () => {
			const param = selectedClassId ? `?classId=${selectedClassId}` : "";
			const res: any = await api.get(`/dashboard/admin${param}`);
			return res.data;
		},
	});

	if (isLoading) {
		return (
			<div className="max-w-7xl mx-auto px-4 py-10">
				<div className="animate-pulse space-y-6">
					<div className="h-28 bg-slate-200 rounded-2xl" />
					<div className="grid grid-cols-4 gap-4">
						<div className="h-24 bg-slate-200 rounded-xl" />
						<div className="h-24 bg-slate-200 rounded-xl" />
						<div className="h-24 bg-slate-200 rounded-xl" />
						<div className="h-24 bg-slate-200 rounded-xl" />
					</div>
					<div className="grid grid-cols-2 gap-6">
						<div className="h-64 bg-slate-200 rounded-2xl" />
						<div className="h-64 bg-slate-200 rounded-2xl" />
					</div>
				</div>
			</div>
		);
	}

	if (!data) return null;

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
			{/* Header Banner */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
				<div>
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-200 border border-purple-400/30 mb-2">
						<ShieldCheck size={14} />
						<span>Dashboard Monitoring Asisten Dosen & Dosen</span>
					</div>
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
						Class Monitoring & Confusion Analytics
					</h1>
					<p className="text-xs sm:text-sm text-purple-100/80 mt-1 max-w-xl">
						Identifikasi pola kebingungan kelas dan pantau konsistensi belajar
						tanpa harus memeriksa 90 mahasiswa satu per satu secara manual.
					</p>
				</div>

				<div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
					<Filter size={14} className="text-purple-200 ml-2" />
					<select
						value={selectedClassId}
						onChange={(e) => setSelectedClassId(e.target.value)}
						className="text-xs font-bold text-white bg-transparent border-0 focus:ring-0 cursor-pointer pr-4 [&>option]:text-slate-900"
					>
						<option value="">Semua Kelas (2 Kelas)</option>
						{classesList?.map((cls) => (
							<option key={cls.id} value={cls.id}>
								{cls.name}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* KPI Cards (PRD §20) */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-slate-500">
							Mahasiswa Aktif Minggu Ini
						</span>
						<Users size={18} className="text-indigo-600" />
					</div>
					<div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
						{data.activeStudentsThisWeek} / {data.totalStudents}
					</div>
					<span className="text-[11px] text-slate-400 mt-1 block">
						{data.totalStudents > 0
							? `${Math.round((data.activeStudentsThisWeek / data.totalStudents) * 100)}% aktif belajar minggu ini`
							: "Belum ada mahasiswa"}
					</span>
				</div>

				<div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-slate-500">
							Total Learning Sprints
						</span>
						<Timer size={18} className="text-emerald-600" />
					</div>
					<div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
						{data.totalSprints}
					</div>
					<span className="text-[11px] text-slate-400 mt-1 block">
						Sesi sprint tercatat
					</span>
				</div>

				<div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-slate-500">
							Peer Feedback Diberikan
						</span>
						<MessageSquare size={18} className="text-sky-600" />
					</div>
					<div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
						{data.totalFeedbackGiven}
					</div>
					<span className="text-[11px] text-slate-400 mt-1 block">
						Saling memberi masukan
					</span>
				</div>

				<div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-slate-500">
							Perlu Perhatian (Pasif)
						</span>
						<AlertCircle size={18} className="text-amber-600" />
					</div>
					<div className="text-2xl sm:text-3xl font-bold text-amber-600 font-mono">
						{data.studentsNeedingAttention.length}
					</div>
					<span className="text-[11px] text-slate-400 mt-1 block">
						Tidak ada sprint dalam 7 hari
					</span>
				</div>
			</div>

			{/* Grid: Common Confusions & Students Needing Attention (PRD §20 & §21) */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Common Confusions Card */}
				<div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
					<div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
								<HelpCircle size={16} />
							</div>
							<div>
								<h2 className="text-sm sm:text-base font-bold text-slate-900">
									Common Confusion (Topik Membingungkan)
								</h2>
								<p className="text-[11px] text-slate-500">
									Diagregasi otomatis dari refleksi sprint mahasiswa
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-3">
						{data.commonConfusions.length === 0 ? (
							<p className="text-xs text-slate-400 italic py-4 text-center">
								Belum ada data kebingungan tercatat.
							</p>
						) : (
							data.commonConfusions.map((item, idx) => (
								<div
									key={idx}
									className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs"
								>
									<span className="font-semibold text-slate-800">
										{item.topic}
									</span>
									<span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold font-mono text-[11px]">
										{item.mentions} mahasiswa
									</span>
								</div>
							))
						)}
					</div>
				</div>

				{/* Students with No Recent Activity Card */}
				<div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
					<div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
								<Users size={16} />
							</div>
							<div>
								<h2 className="text-sm sm:text-base font-bold text-slate-900">
									Mahasiswa Belum Ada Aktivitas Terbaru
								</h2>
								<p className="text-[11px] text-slate-500">
									Belum mencatat sprint dalam 7 hari terakhir
								</p>
							</div>
						</div>
						<Link
							to="/admin-students"
							className="text-xs font-semibold text-indigo-600 hover:underline"
						>
							Kelola →
						</Link>
					</div>

					<div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
						{data.studentsNeedingAttention.length === 0 ? (
							<p className="text-xs text-emerald-600 font-semibold py-4 text-center">
								🎉 Luar biasa! Semua mahasiswa aktif belajar minggu ini.
							</p>
						) : (
							data.studentsNeedingAttention.map((student) => (
								<div
									key={student.id}
									className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
								>
									<div>
										<div className="flex items-center gap-2">
											<span className="font-bold text-slate-800">
												{student.name}
											</span>
											{student.className && (
												<span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-xs">
													{student.className}
												</span>
											)}
										</div>
										<span className="text-[11px] text-slate-400 font-mono">
											{student.nim || student.email}
										</span>
									</div>

									<span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
										{student.statusLabel}
									</span>
								</div>
							))
						)}
					</div>
				</div>
			</div>

			{/* Recent Evidences for Fast Review */}
			<div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
				<div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
					<div>
						<h2 className="text-sm sm:text-base font-bold text-slate-900">
							Bukti Pembelajaran Terbaru (Evidence Stream)
						</h2>
						<p className="text-xs text-slate-500">
							Review cepat link GitHub / Loom / Live Demo dari mahasiswa
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{data.recentEvidences.map((ev) => (
						<div
							key={ev.id}
							className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
						>
							<div>
								<div className="flex items-center gap-2">
									<span className="font-bold text-slate-800">
										{ev.studentName}
									</span>
									<span className="text-[10px] text-slate-400">
										({ev.className})
									</span>
								</div>
								<p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
									{ev.whatLearned}
								</p>
							</div>

							<a
								href={ev.evidenceUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold shrink-0"
							>
								<span>Buka {ev.evidenceType}</span>
								<ExternalLink size={12} />
							</a>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
