import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
	Eye,
	FileSpreadsheet,
	Plus,
	Search,
	Trash2,
	UserCheck,
	X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { EmptyState } from "../components/common/EmptyState.js";
import { Pagination } from "../components/common/Pagination.js";
import { StudentDetailModal } from "../components/common/StudentDetailModal.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type { ClassGroup, PaginatedResponse, User } from "../types/index.js";

interface StudentSearchParams {
	page?: number;
	limit?: number;
	classId?: string;
	search?: string;
	status?: "all" | "active" | "inactive";
}

export const Route = createFileRoute("/admin-students")({
	validateSearch: (search: Record<string, unknown>): StudentSearchParams => {
		return {
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 10,
			classId: (search.classId as string) || undefined,
			search: (search.search as string) || undefined,
			status: (search.status as "all" | "active" | "inactive") || "all",
		};
	},
	component: AdminStudentsPage,
});

const SingleStudentSchema = Yup.object().shape({
	name: Yup.string().required("Nama lengkap wajib diisi").min(2),
	email: Yup.string()
		.email("Format email tidak valid")
		.required("Email wajib diisi"),
	nim: Yup.string().required("NIM wajib diisi").min(3),
	classId: Yup.string().required("Kelas wajib dipilih"),
	githubRepoUrl: Yup.string()
		.url("URL tidak valid")
		.nullable()
		.transform((curr, orig) => (orig === "" ? null : curr)),
	githubPageUrl: Yup.string()
		.url("URL tidak valid")
		.nullable()
		.transform((curr, orig) => (orig === "" ? null : curr)),
});

function AdminStudentsPage() {
	const navigate = useNavigate();
	const searchParams = useSearch({ from: "/admin-students" });
	const { user, isAuthenticated } = useAuthStore();
	const queryClient = useQueryClient();

	const currentPage = searchParams.page || 1;
	const pageSize = searchParams.limit || 10;
	const selectedClassFilter = searchParams.classId || "";
	const currentSearch = searchParams.search || "";
	const currentStatus = searchParams.status || "all";

	const [searchInput, setSearchInput] = useState(currentSearch);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
	const [batchClassId, setBatchClassId] = useState("");
	const [batchText, setBatchText] = useState("");
	const [inspectedStudent, setInspectedStudent] = useState<any | null>(null);
	const [batchResult, setBatchResult] = useState<{
		added: number;
		skipped: number;
		errors: string[];
	} | null>(null);

	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		} else if (user?.role !== "ADMIN") {
			navigate({ to: "/dashboard" });
		}
	}, [isAuthenticated, user, navigate]);

	// Sync search input
	useEffect(() => {
		setSearchInput(currentSearch);
	}, [currentSearch]);

	// Debounce search to URL
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchInput !== currentSearch) {
				navigate({
					search: (prev) => ({
						...prev,
						search: searchInput.trim() || undefined,
						page: 1,
					}),
				});
			}
		}, 350);

		return () => clearTimeout(timer);
	}, [searchInput, currentSearch, navigate]);

	const updateFilters = (updates: Partial<StudentSearchParams>) => {
		navigate({
			search: (prev) => ({
				...prev,
				...updates,
			}),
		});
	};

	// Fetch Classes
	const { data: classesList } = useQuery<ClassGroup[]>({
		queryKey: ["classes"],
		queryFn: async () => {
			const res: any = await api.get("/classes");
			return res.data;
		},
		enabled: isAuthenticated && user?.role === "ADMIN",
	});

	// Fetch Students Whitelist (Server-Side Paginated)
	const { data: studentResponse, isLoading } = useQuery<
		PaginatedResponse<User>
	>({
		queryKey: [
			"adminStudents",
			{
				page: currentPage,
				limit: pageSize,
				classId: selectedClassFilter,
				search: currentSearch,
				status: currentStatus,
			},
		],
		queryFn: async () => {
			const params = new URLSearchParams();
			params.set("page", String(currentPage));
			params.set("limit", String(pageSize));
			if (selectedClassFilter) params.set("classId", selectedClassFilter);
			if (currentSearch) params.set("search", currentSearch);
			if (currentStatus && currentStatus !== "all")
				params.set("status", currentStatus);

			const res: any = await api.get(`/admin/students?${params.toString()}`);
			return res;
		},
		enabled: isAuthenticated && user?.role === "ADMIN",
	});

	const students = studentResponse?.data || [];
	const pagination = studentResponse?.pagination;

	// Add Single Student Mutation
	const addStudentMutation = useMutation({
		mutationFn: async (values: any) => {
			const res: any = await api.post("/admin/students", values);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["adminStudents"] });
			setIsAddModalOpen(false);
		},
	});

	// Batch Add Mutation
	const batchAddMutation = useMutation({
		mutationFn: async ({
			classId,
			studentsList,
		}: {
			classId: string;
			studentsList: any[];
		}) => {
			const res: any = await api.post("/admin/students/batch", {
				classId,
				students: studentsList,
			});
			return res.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["adminStudents"] });
			setBatchResult(data);
		},
	});

	// Delete Mutation
	const deleteStudentMutation = useMutation({
		mutationFn: async (id: string) => {
			const res: any = await api.delete(`/admin/students/${id}`);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["adminStudents"] });
		},
	});

	const handleBatchParseAndSubmit = () => {
		if (!batchClassId) {
			alert("Pilih kelas terlebih dahulu!");
			return;
		}
		const lines = batchText.split("\n").filter((l) => l.trim().length > 0);
		const parsedStudents: any[] = [];

		for (const line of lines) {
			const parts = line.split(/[,\t|]/).map((p) => p.trim());
			if (parts.length >= 3) {
				parsedStudents.push({
					name: parts[0],
					email: parts[1],
					nim: parts[2],
					githubRepoUrl: parts[3] || undefined,
					githubPageUrl: parts[4] || undefined,
				});
			}
		}

		if (parsedStudents.length === 0) {
			alert(
				"Format baris tidak valid! Gunakan format: Nama, Email, NIM per baris.",
			);
			return;
		}

		batchAddMutation.mutate({
			classId: batchClassId,
			studentsList: parsedStudents,
		});
	};

	return (
		<div className="space-y-6">
			{/* 1. Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
				<div>
					<div className="flex items-center gap-2">
						<span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
							Area Dosen & Asisten Dosen
						</span>
						<span className="text-slate-300">•</span>
						<span className="text-xs font-medium text-slate-500 font-mono">
							Whitelist Google OAuth
						</span>
					</div>
					<h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
						Daftar & Hak Akses Mahasiswa
					</h1>
					<p className="text-xs text-slate-500 mt-1 max-w-xl">
						Kelola daftar mahasiswa yang diizinkan login melalui Google OAuth
						dan pantau akun per kelas perkuliahan.
					</p>
				</div>

				<div className="flex items-center gap-2 shrink-0">
					<button
						type="button"
						onClick={() => setIsBatchModalOpen(true)}
						className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
					>
						<FileSpreadsheet size={14} className="text-slate-500" />
						<span>Impor Batch CSV</span>
					</button>

					<button
						type="button"
						onClick={() => setIsAddModalOpen(true)}
						className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
					>
						<Plus size={14} />
						<span>Tambah Mahasiswa</span>
					</button>
				</div>
			</div>

			{/* 2. Filter Bar */}
			<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<div className="sm:col-span-2 relative">
						<Search
							size={15}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
						/>
						<input
							type="text"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder="Cari berdasarkan nama lengkap, email, atau NIM..."
							className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
						/>
					</div>

					<div>
						<select
							value={selectedClassFilter}
							onChange={(e) =>
								updateFilters({
									classId: e.target.value || undefined,
									page: 1,
								})
							}
							className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
						>
							<option value="">-- Semua Kelas Mahasiswa --</option>
							{classesList?.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name} ({c.academicTerm})
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* 3. Students Table */}
			<div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
				{isLoading ? (
					<div className="p-8 space-y-4 animate-pulse">
						{[1, 2, 3, 4, 5].map((i) => (
							<div key={i} className="h-12 bg-slate-100 rounded-lg" />
						))}
					</div>
				) : students.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs border-collapse">
							<thead>
								<tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
									<th className="py-3 px-4">Mahasiswa</th>
									<th className="py-3 px-4">NIM</th>
									<th className="py-3 px-4">Kelas</th>
									<th className="py-3 px-4">Progres Mandiri</th>
									<th className="py-3 px-4">Sprint</th>
									<th className="py-3 px-4 text-right">Aksi</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{students.map((student) => (
									<tr
										key={student.id}
										className="hover:bg-slate-50/70 transition-colors"
									>
										<td className="py-3.5 px-4">
											<div className="flex items-center gap-2.5">
												<div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-semibold text-[11px] text-slate-700 shrink-0">
													{student.name.charAt(0).toUpperCase()}
												</div>
												<div className="min-w-0">
													<p className="font-semibold text-slate-900 truncate">
														{student.name}
													</p>
													<p className="text-[11px] text-slate-400 font-mono">
														{student.email}
													</p>
												</div>
											</div>
										</td>
										<td className="py-3.5 px-4 font-mono text-slate-600">
											{student.nim || "-"}
										</td>
										<td className="py-3.5 px-4 text-slate-700">
											<span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm text-[11px]">
												{student.className || "Belum ada kelas"}
											</span>
										</td>
										<td className="py-3.5 px-4 font-mono text-slate-700">
											{student.checkedCount || 0} butir
										</td>
										<td className="py-3.5 px-4 font-mono text-slate-700">
											{student.sprintCount || 0}x
										</td>
										<td className="py-3.5 px-4 text-right">
											<div className="flex items-center justify-end gap-1.5">
												<button
													type="button"
													onClick={() => setInspectedStudent(student)}
													className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-md transition-colors cursor-pointer"
													title="Lihat Detail Progres"
												>
													<Eye size={14} />
												</button>
												<button
													type="button"
													onClick={() => {
														if (
															confirm(
																`Hapus akses mahasiswa ${student.name}? Data sprint & checklist akan ikut terhapus.`,
															)
														) {
															deleteStudentMutation.mutate(student.id);
														}
													}}
													className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
													title="Hapus Mahasiswa"
												>
													<Trash2 size={14} />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<EmptyState
						icon={UserCheck}
						title="Tidak ada mahasiswa ditemukan"
						description="Belum ada data mahasiswa yang terdaftar sesuai dengan filter pencarian ini."
						actionLabel="Tambah Mahasiswa Pertama"
						onAction={() => setIsAddModalOpen(true)}
					/>
				)}

				{/* Pagination Footer */}
				{pagination && pagination.totalPages > 1 && (
					<div className="p-4 border-t border-slate-100 bg-slate-50/50">
						<Pagination
							currentPage={currentPage}
							totalPages={pagination.totalPages}
							onPageChange={(page) => updateFilters({ page })}
							pageSize={pageSize}
							totalItems={pagination.total}
							onPageSizeChange={(limit) => updateFilters({ limit, page: 1 })}
							pageSizeOptions={[10, 25, 50]}
						/>
					</div>
				)}
			</div>

			{/* 4. Add Student Modal */}
			{isAddModalOpen && (
				<div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<h3 className="text-sm font-semibold text-slate-900">
								Tambah Mahasiswa ke Whitelist
							</h3>
							<button
								type="button"
								onClick={() => setIsAddModalOpen(false)}
								className="text-slate-400 hover:text-slate-600 cursor-pointer"
							>
								<X size={16} />
							</button>
						</div>

						<Formik
							initialValues={{
								name: "",
								email: "",
								nim: "",
								classId: selectedClassFilter || classesList?.[0]?.id || "",
								githubRepoUrl: "",
								githubPageUrl: "",
							}}
							validationSchema={SingleStudentSchema}
							enableReinitialize={true}
							onSubmit={(values) => addStudentMutation.mutate(values)}
						>
							{({ isSubmitting }) => (
								<Form className="space-y-3.5 text-xs">
									<div>
										<label className="block font-medium text-slate-700 mb-1">
											Nama Lengkap Mahasiswa *
										</label>
										<Field
											type="text"
											name="name"
											placeholder="e.g. Muhammad Zahi Ustadzi"
											className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
										/>
										<ErrorMessage
											name="name"
											component="div"
											className="text-rose-600 text-[11px] mt-0.5"
										/>
									</div>

									<div>
										<label className="block font-medium text-slate-700 mb-1">
											Email Google (OAuth) *
										</label>
										<Field
											type="email"
											name="email"
											placeholder="e.g. zahi@student.univ.ac.id"
											className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
										/>
										<ErrorMessage
											name="email"
											component="div"
											className="text-rose-600 text-[11px] mt-0.5"
										/>
									</div>

									<div>
										<label className="block font-medium text-slate-700 mb-1">
											Nomor Induk Mahasiswa (NIM) *
										</label>
										<Field
											type="text"
											name="nim"
											placeholder="e.g. 21051204001"
											className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
										/>
										<ErrorMessage
											name="nim"
											component="div"
											className="text-rose-600 text-[11px] mt-0.5"
										/>
									</div>

									<div>
										<label className="block font-medium text-slate-700 mb-1">
											Kelas Perkuliahan *
										</label>
										<Field
											as="select"
											name="classId"
											className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
										>
											<option value="">-- Pilih Kelas --</option>
											{classesList?.map((c) => (
												<option key={c.id} value={c.id}>
													{c.name} ({c.academicTerm})
												</option>
											))}
										</Field>
										<ErrorMessage
											name="classId"
											component="div"
											className="text-rose-600 text-[11px] mt-0.5"
										/>
									</div>

									<div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
										<button
											type="button"
											onClick={() => setIsAddModalOpen(false)}
											className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 cursor-pointer"
										>
											Batal
										</button>
										<button
											type="submit"
											disabled={isSubmitting || addStudentMutation.isPending}
											className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
										>
											Simpan Mahasiswa
										</button>
									</div>
								</Form>
							)}
						</Formik>
					</div>
				</div>
			)}

			{/* 5. Batch Import CSV Modal */}
			{isBatchModalOpen && (
				<div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<h3 className="text-sm font-semibold text-slate-900">
								Impor Batch Data Mahasiswa
							</h3>
							<button
								type="button"
								onClick={() => {
									setIsBatchModalOpen(false);
									setBatchResult(null);
								}}
								className="text-slate-400 hover:text-slate-600 cursor-pointer"
							>
								<X size={16} />
							</button>
						</div>

						{batchResult ? (
							<div className="space-y-3 text-xs">
								<div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
									<p className="font-semibold">Impor Batch Selesai!</p>
									<p>
										Berhasil ditambahkan: {batchResult.added} mahasiswa.
										Dilewati: {batchResult.skipped}.
									</p>
								</div>
								{batchResult.errors.length > 0 && (
									<div className="max-h-32 overflow-y-auto space-y-1 text-slate-500 font-mono text-[11px]">
										{batchResult.errors.map((e, idx) => (
											<p key={idx}>• {e}</p>
										))}
									</div>
								)}
								<div className="flex justify-end pt-2">
									<button
										type="button"
										onClick={() => {
											setIsBatchModalOpen(false);
											setBatchResult(null);
										}}
										className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
									>
										Tutup
									</button>
								</div>
							</div>
						) : (
							<div className="space-y-3.5 text-xs">
								<div>
									<label className="block font-medium text-slate-700 mb-1">
										Pilih Kelas Target *
									</label>
									<select
										value={batchClassId}
										onChange={(e) => setBatchClassId(e.target.value)}
										className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
									>
										<option value="">-- Pilih Kelas --</option>
										{classesList?.map((c) => (
											<option key={c.id} value={c.id}>
												{c.name} ({c.academicTerm})
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="block font-medium text-slate-700 mb-1">
										Paste Data (Format: Nama, Email, NIM per baris)
									</label>
									<textarea
										rows={6}
										value={batchText}
										onChange={(e) => setBatchText(e.target.value)}
										placeholder="Budi Santoso, budi@student.ac.id, 21051204010&#10;Siti Aminah, siti@student.ac.id, 21051204011"
										className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-[11px]"
									/>
								</div>

								<div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
									<button
										type="button"
										onClick={() => setIsBatchModalOpen(false)}
										className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 cursor-pointer"
									>
										Batal
									</button>
									<button
										type="button"
										onClick={handleBatchParseAndSubmit}
										disabled={batchAddMutation.isPending}
										className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
									>
										{batchAddMutation.isPending
											? "Memproses..."
											: "Proses Impor Batch"}
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* 6. Student Detail Inspector Modal */}
			{inspectedStudent && (
				<StudentDetailModal
					isOpen={!!inspectedStudent}
					onClose={() => setInspectedStudent(null)}
					student={inspectedStudent}
				/>
			)}
		</div>
	);
}
