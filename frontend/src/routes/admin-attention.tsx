import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Eye, UserCheck } from "lucide-react";
import React, { useState } from "react";
import { EmptyState } from "../components/common/EmptyState.js";
import { Pagination } from "../components/common/Pagination.js";
import { SelectDropdown } from "../components/common/SelectDropdown.js";
import { StudentDetailModal } from "../components/common/StudentDetailModal.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type { AdminDashboardData, ClassGroup } from "../types/index.js";

export const Route = createFileRoute("/admin-attention")({
	component: AdminAttentionPage,
});

function AdminAttentionPage() {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const [selectedClassId, setSelectedClassId] = useState<string>("");
	const [inspectedStudent, setInspectedStudent] = useState<any | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 8;

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

	// Fetch Admin Dashboard data
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
			<div className="max-w-4xl mx-auto w-full space-y-6 animate-pulse py-4">
				<div className="h-16 bg-slate-100 rounded-xl" />
				<div className="h-64 bg-slate-100 rounded-xl" />
			</div>
		);
	}

	const allAttention = data?.studentsNeedingAttention || [];
	const total = allAttention.length;
	const totalPages = Math.ceil(total / pageSize) || 1;
	const paginatedStudents = allAttention.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	return (
		<div className="max-w-4xl mx-auto w-full space-y-8 min-w-0 max-w-full">
			{/* 1. Header with Breadcrumb Back Link & Class Filter */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 min-w-0">
				<div className="space-y-1">
					<Link
						to="/admin"
						className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
					>
						<ArrowLeft size={13} />
						<span>Kembali ke Monitoring Overview</span>
					</Link>
					<h1 className="text-xl font-bold tracking-tight text-slate-900">
						Mahasiswa Perlu Perhatian ({total})
					</h1>
					<p className="text-xs text-slate-500 max-w-xl">
						Daftar mahasiswa yang terindikasi pasif atau tidak mencatat progres
						belajar dalam 7 hari terakhir beserta alasan deteksi.
					</p>
				</div>

				{/* Class Filter Selector */}
				<div className="w-full sm:w-56 shrink-0">
					<SelectDropdown
						value={selectedClassId}
						onChange={(val) => {
							setSelectedClassId(val);
							setCurrentPage(1);
						}}
						placeholder="Semua Kelas Mahasiswa"
						allowClear
						options={[
							{ value: "", label: "Semua Kelas Mahasiswa" },
							...(classesList?.map((cls) => ({
								value: cls.id,
								label: cls.name,
								badge: cls.academicTerm,
							})) || []),
						]}
					/>
				</div>
			</div>

			{/* 2. Students Needing Attention List */}
			<div className="space-y-3">
				{total === 0 ? (
					<EmptyState
						icon={UserCheck}
						title="Semua mahasiswa aktif belajar!"
						description="Tidak ada mahasiswa yang terdeteksi pasif atau tidak mencatat sprint dalam 7 hari terakhir."
					/>
				) : (
					<>
						<div className="bg-white rounded-xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
							{paginatedStudents.map((student) => (
								<div
									key={student.id}
									className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/60 transition-colors"
								>
									<div className="space-y-1 min-w-0">
										<div className="flex items-center gap-2 flex-wrap">
											<span className="font-bold text-slate-900">
												{student.name}
											</span>
											{student.className && (
												<span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm font-medium">
													{student.className}
												</span>
											)}
											<span className="text-[11px] text-slate-400 font-mono">
												{student.nim || student.email}
											</span>
										</div>

										{/* Explicit Reason for Attention */}
										<div className="flex items-center gap-2 pt-0.5">
											<span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full font-mono">
												<AlertCircle size={11} className="text-rose-500" />
												<span>
													Alasan: {student.statusLabel || "Tidak aktif ≥7 hari"}
												</span>
											</span>
										</div>
									</div>

									<div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
										<button
											type="button"
											onClick={() => setInspectedStudent(student)}
											className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
										>
											<Eye size={13} className="text-slate-500" />
											<span>Inspeksi Progres</span>
										</button>
									</div>
								</div>
							))}
						</div>

						{total > pageSize && (
							<div className="pt-2">
								<Pagination
									currentPage={currentPage}
									totalPages={totalPages}
									onPageChange={setCurrentPage}
									pageSize={pageSize}
									totalItems={total}
								/>
							</div>
						)}
					</>
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
