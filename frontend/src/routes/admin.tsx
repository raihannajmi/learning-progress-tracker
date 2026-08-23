import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowRight,
	ExternalLink,
	Filter,
	HelpCircle,
	MessageSquare,
	Timer,
	Users,
} from "lucide-react";
import React, { useState } from "react";
import { StatCard } from "../components/common/StatCard.js";
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
			<div className="max-w-4xl mx-auto w-full space-y-6">
				<div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="h-24 bg-slate-100 rounded-xl animate-pulse"
						/>
					))}
				</div>
				<div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
			</div>
		);
	}

	if (!data) return null;

	const activePercent =
		data.totalStudents > 0
			? Math.round((data.activeStudentsThisWeek / data.totalStudents) * 100)
			: 0;

	const topConfusions = data.commonConfusions?.slice(0, 3) || [];
	const topAttention = data.studentsNeedingAttention?.slice(0, 3) || [];
	const topEvidence = data.recentEvidences?.slice(0, 3) || [];

	return (
		<div className="max-w-4xl mx-auto w-full space-y-8">
			{/* 1. Header with Class Selector */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
				<div className="space-y-0.5">
					<h1 className="text-xl font-bold tracking-tight text-slate-900">
						Monitoring & Kesehatan Kelas
					</h1>
					<p className="text-xs text-slate-500 max-w-xl">
						Ringkasan kondisi belajar mahasiswa, identifikasi hambatan materi,
						dan temukan mahasiswa yang memerlukan intervensi.
					</p>
				</div>

				{/* Class Filter Selector */}
				<div className="flex items-center gap-2 shrink-0 bg-white px-3 py-1.5 rounded-lg border border-slate-200/90 text-xs">
					<Filter size={13} className="text-slate-400" />
					<select
						value={selectedClassId}
						onChange={(e) => setSelectedClassId(e.target.value)}
						className="text-xs font-medium text-slate-800 bg-transparent border-0 focus:ring-0 cursor-pointer pr-4"
					>
						<option value="">Semua Kelas</option>
						{classesList?.map((cls) => (
							<option key={cls.id} value={cls.id}>
								{cls.name}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* 2. Executive KPI Overview */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					label="Mahasiswa Aktif Minggu Ini"
					value={`${data.activeStudentsThisWeek} / ${data.totalStudents}`}
					subtext={`${activePercent}% aktif belajar`}
					icon={Users}
					iconColor="text-blue-600"
				/>
				<StatCard
					label="Total Learning Sprints"
					value={data.totalSprints}
					subtext="Sesi fokus tercatat"
					icon={Timer}
					iconColor="text-emerald-600"
				/>
				<StatCard
					label="Peer & Dosen Feedback"
					value={data.totalFeedbackGiven}
					subtext="Total tanggapan diberikan"
					icon={MessageSquare}
					iconColor="text-sky-600"
				/>
				<StatCard
					label="Perlu Perhatian"
					value={data.studentsNeedingAttention.length}
					subtext="Tidak aktif ≥7 hari"
					icon={AlertCircle}
					iconColor="text-amber-500"
				/>
			</div>

			{/* 3. Executive Overview Cards with Clear Drill-Downs */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Card A: Topik dengan Hambatan Terbanyak */}
				<div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<HelpCircle size={16} className="text-amber-600" />
								<h3 className="text-sm font-bold text-slate-900">
									Hambatan Belajar Mahasiswa
								</h3>
							</div>
							<span className="text-xs font-mono text-slate-400">
								{data.commonConfusions?.length || 0} topik
							</span>
						</div>

						<p className="text-xs text-slate-500 leading-relaxed">
							Topik materi yang paling sering dilaporkan membingungkan atau
							menjadi kendala belajar.
						</p>

						<div className="space-y-2 pt-1">
							{topConfusions.length === 0 ? (
								<p className="text-xs text-slate-400 italic py-2">
									Belum ada kendala materi yang dilaporkan.
								</p>
							) : (
								topConfusions.map((c, i) => (
									<div
										key={i}
										className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs"
									>
										<span className="font-semibold text-slate-800 truncate">
											{c.topicTitle || c.topic}
										</span>
										<span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
											{c.mentions} mahasiswa
										</span>
									</div>
								))
							)}
						</div>
					</div>

					<Link
						to="/admin-confusions"
						className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1.5 pt-2"
					>
						<span>Buka Analitik Hambatan Lengkap</span>
						<ArrowRight size={13} />
					</Link>
				</div>

				{/* Card B: Mahasiswa Perlu Perhatian */}
				<div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<AlertCircle size={16} className="text-rose-600" />
								<h3 className="text-sm font-bold text-slate-900">
									Mahasiswa Perlu Perhatian
								</h3>
							</div>
							<span className="text-xs font-mono text-slate-400">
								{data.studentsNeedingAttention?.length || 0} mahasiswa
							</span>
						</div>

						<p className="text-xs text-slate-500 leading-relaxed">
							Mahasiswa yang belum mencatat sprint dalam 7 hari terakhir atau
							memerlukan bantuan.
						</p>

						<div className="space-y-2 pt-1">
							{topAttention.length === 0 ? (
								<p className="text-xs text-emerald-600 font-medium py-2">
									Semua mahasiswa aktif belajar minggu ini.
								</p>
							) : (
								topAttention.map((s) => (
									<div
										key={s.id}
										className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs"
									>
										<div className="min-w-0">
											<p className="font-semibold text-slate-800 truncate">
												{s.name}
											</p>
											<p className="text-[11px] text-slate-400 font-mono">
												{s.className} • Tidak aktif {s.daysInactive || "≥7"}{" "}
												hari
											</p>
										</div>
										<span className="text-[11px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 shrink-0">
											Pasif
										</span>
									</div>
								))
							)}
						</div>
					</div>

					<Link
						to="/admin-attention"
						className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1.5 pt-2"
					>
						<span>Periksa Semua Mahasiswa Perlu Perhatian</span>
						<ArrowRight size={13} />
					</Link>
				</div>
			</div>

			{/* 4. Card C: Bukti & Aktivitas Terbaru */}
			<div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
				<div className="flex items-center justify-between pb-3 border-b border-slate-100">
					<div>
						<h3 className="text-sm font-bold text-slate-900">
							Bukti & Aktivitas Pembelajaran Terbaru
						</h3>
						<p className="text-xs text-slate-500 mt-0.5">
							Submisi tautan GitHub, Loom, atau Live Demo dari sesi fokus
							mahasiswa
						</p>
					</div>

					<Link
						to="/admin-activity"
						className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
					>
						<span>Lihat Semua Bukti & Aktivitas</span>
						<ArrowRight size={13} />
					</Link>
				</div>

				{topEvidence.length === 0 ? (
					<p className="text-xs text-slate-400 italic py-4 text-center">
						Belum ada link bukti belajar yang dikirimkan.
					</p>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						{topEvidence.map((ev) => (
							<div
								key={ev.id}
								className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-2 text-xs flex flex-col justify-between"
							>
								<div className="space-y-1">
									<div className="flex items-center justify-between gap-1">
										<span className="font-semibold text-slate-900 truncate">
											{ev.studentName}
										</span>
										<span className="text-[10px] text-slate-400 font-mono">
											{ev.className}
										</span>
									</div>
									<p className="text-slate-600 line-clamp-2 text-[11px]">
										{ev.whatLearned}
									</p>
								</div>

								<div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
									<a
										href={ev.evidenceUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 hover:underline"
									>
										<span>{ev.evidenceType}</span>
										<ExternalLink size={11} />
									</a>

									<Link
										to="/class"
										search={{ classId: selectedClassId || undefined }}
										className="text-[11px] font-semibold text-blue-600 hover:underline"
									>
										Buka di Feed →
									</Link>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
