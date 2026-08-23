import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	ExternalLink,
	Eye,
	Filter,
	MessageSquare,
	Timer,
	Users,
} from "lucide-react";
import React, { useState } from "react";
import { Pagination } from "../components/common/Pagination.js";
import { StatCard } from "../components/common/StatCard.js";
import { StudentDetailModal } from "../components/common/StudentDetailModal.js";
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
	const [inspectedStudent, setInspectedStudent] = useState<any | null>(null);

	// Pagination states
	const [attentionPage, setAttentionPage] = useState(1);
	const [evidencePage, setEvidencePage] = useState(1);
	const attentionPageSize = 5;
	const evidencePageSize = 6;

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
			<div className="space-y-6">
				<div className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse"
						/>
					))}
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
					<div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
				</div>
			</div>
		);
	}

	if (!data) return null;

	const activePercent =
		data.totalStudents > 0
			? Math.round((data.activeStudentsThisWeek / data.totalStudents) * 100)
			: 0;

	// Paginated attention students
	const totalAttention = data.studentsNeedingAttention?.length || 0;
	const totalAttentionPages =
		Math.ceil(totalAttention / attentionPageSize) || 1;
	const paginatedAttention = (data.studentsNeedingAttention || []).slice(
		(attentionPage - 1) * attentionPageSize,
		attentionPage * attentionPageSize,
	);

	// Paginated evidence items
	const totalEvidence = data.recentEvidences?.length || 0;
	const totalEvidencePages = Math.ceil(totalEvidence / evidencePageSize) || 1;
	const paginatedEvidence = (data.recentEvidences || []).slice(
		(evidencePage - 1) * evidencePageSize,
		evidencePage * evidencePageSize,
	);

	return (
		<div className="space-y-6">
			{/* 1. Header with Class Selector */}
			<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
							Area Pengajar
						</span>
						<span className="text-slate-300">•</span>
						<span className="text-xs font-medium text-slate-600">
							Monitoring & Asistensi
						</span>
					</div>

					<h2 className="text-lg font-semibold text-slate-900 tracking-tight">
						Dashboard Monitoring Dosen & TA
					</h2>

					<p className="text-xs text-slate-500 leading-relaxed max-w-xl">
						Identifikasi pola kebingungan materi kelas dan pantau keaktifan
						belajar mahasiswa tanpa harus memeriksa puluhan mahasiswa secara
						manual.
					</p>
				</div>

				{/* Class Filter Selector */}
				<div className="flex items-center gap-2 shrink-0 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
					<Filter size={14} className="text-slate-400" />
					<select
						value={selectedClassId}
						onChange={(e) => {
							setSelectedClassId(e.target.value);
							setAttentionPage(1);
							setEvidencePage(1);
						}}
						className="text-xs font-medium text-slate-800 bg-transparent border-0 focus:ring-0 cursor-pointer pr-4"
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

			{/* 2. KPI Metrics Grid */}
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
					subtext="Sesi sprint tercatat di sistem"
					icon={Timer}
					iconColor="text-emerald-600"
				/>
				<StatCard
					label="Peer Feedback Diberikan"
					value={data.totalFeedbackGiven}
					subtext="Total review antar teman sekelas"
					icon={MessageSquare}
					iconColor="text-sky-600"
				/>
				<StatCard
					label="Perlu Perhatian (Pasif)"
					value={data.studentsNeedingAttention.length}
					subtext="Tidak ada sprint dalam 7 hari"
					icon={AlertCircle}
					iconColor="text-amber-500"
				/>
			</div>

			{/* 3. Main Split Section: Confusion Analytics & Needs Attention */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Left: Common Confusion Topics Analytics */}
				<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
					<div className="pb-3 border-b border-slate-100">
						<h3 className="text-sm font-semibold text-slate-900">
							Analitik Topik Membingungkan (Common Confusions)
						</h3>
						<p className="text-xs text-slate-500 mt-0.5">
							Diagregasi otomatis dari kendala refleksi sprint mahasiswa
						</p>
					</div>

					<div className="space-y-3 pt-1">
						{!data.commonConfusions || data.commonConfusions.length === 0 ? (
							<p className="text-xs text-slate-400 italic py-6 text-center">
								Belum ada data kendala materi yang dilaporkan mahasiswa.
							</p>
						) : (
							data.commonConfusions.map((item, idx) => (
								<div
									key={idx}
									className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
								>
									<div className="flex items-center justify-between gap-2">
										<span className="font-semibold text-slate-900">
											{item.topicTitle || item.topic}
										</span>
										<span className="text-[11px] font-mono font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
											{item.mentions} mahasiswa terkendala
										</span>
									</div>

									{item.examples && item.examples.length > 0 && (
										<div className="space-y-1 pl-2 border-l-2 border-amber-200 text-slate-600">
											{item.examples.slice(0, 2).map((ex, i) => (
												<p key={i} className="line-clamp-1 italic">
													"{ex}"
												</p>
											))}
										</div>
									)}
								</div>
							))
						)}
					</div>
				</div>

				{/* Right: Students Needing Attention (>7 days inactive) */}
				<div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
					<div className="p-6 space-y-4">
						<div className="flex items-center justify-between pb-3 border-b border-slate-100">
							<div>
								<h3 className="text-sm font-semibold text-slate-900">
									Mahasiswa Perlu Perhatian ({totalAttention})
								</h3>
								<p className="text-xs text-slate-500 mt-0.5">
									Belum mencatat sprint dalam 7 hari terakhir
								</p>
							</div>

							<Link
								to="/admin-students"
								className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
							>
								Kelola Whitelist →
							</Link>
						</div>

						<div className="space-y-2">
							{totalAttention === 0 ? (
								<p className="text-xs text-emerald-600 font-medium py-6 text-center">
									Semua mahasiswa aktif belajar dalam 7 hari terakhir.
								</p>
							) : (
								paginatedAttention.map((student) => (
									<button
										type="button"
										key={student.id}
										onClick={() => setInspectedStudent(student)}
										className="w-full text-left flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors cursor-pointer"
									>
										<div className="min-w-0">
											<div className="flex items-center gap-2">
												<span className="font-semibold text-slate-900 truncate">
													{student.name}
												</span>
												{student.className && (
													<span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-sm shrink-0">
														{student.className}
													</span>
												)}
											</div>
											<span className="text-[11px] text-slate-400 font-mono">
												{student.nim || student.email}
											</span>
										</div>

										<div className="flex items-center gap-2 shrink-0">
											<span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-mono">
												{student.statusLabel}
											</span>
											<Eye size={14} className="text-slate-400" />
										</div>
									</button>
								))
							)}
						</div>
					</div>

					{totalAttention > attentionPageSize && (
						<Pagination
							currentPage={attentionPage}
							totalPages={totalAttentionPages}
							onPageChange={setAttentionPage}
							pageSize={attentionPageSize}
							totalItems={totalAttention}
						/>
					)}
				</div>
			</div>

			{/* 4. Recent Evidence Submissions Stream */}
			<div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
				<div className="p-6 space-y-4">
					<div className="pb-3 border-b border-slate-100">
						<h3 className="text-sm font-semibold text-slate-900">
							Bukti Pembelajaran Terbaru (Evidence Stream)
						</h3>
						<p className="text-xs text-slate-500 mt-0.5">
							Review cepat submission link GitHub, Loom, atau Live Demo dari
							mahasiswa
						</p>
					</div>

					{totalEvidence === 0 ? (
						<p className="text-xs text-slate-400 italic py-6 text-center">
							Belum ada link bukti belajar yang dikirimkan.
						</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{paginatedEvidence.map((ev) => (
								<div
									key={ev.id}
									className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
								>
									<div className="min-w-0">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-slate-900 truncate">
												{ev.studentName}
											</span>
											<span className="text-[10px] text-slate-400 font-mono">
												({ev.className})
											</span>
										</div>
										<p className="text-slate-600 line-clamp-1 mt-0.5">
											{ev.whatLearned}
										</p>
									</div>

									<a
										href={ev.evidenceUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors"
									>
										<span>{ev.evidenceType}</span>
										<ExternalLink size={11} />
									</a>
								</div>
							))}
						</div>
					)}
				</div>

				{totalEvidence > evidencePageSize && (
					<Pagination
						currentPage={evidencePage}
						totalPages={totalEvidencePages}
						onPageChange={setEvidencePage}
						pageSize={evidencePageSize}
						totalItems={totalEvidence}
					/>
				)}
			</div>

			<StudentDetailModal
				isOpen={!!inspectedStudent}
				onClose={() => setInspectedStudent(null)}
				student={inspectedStudent}
			/>
		</div>
	);
}
