import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
	Code2,
	Eye,
	FileSpreadsheet,
	Filter,
	Globe,
	Plus,
	Search,
	Trash2,
	X,
} from "lucide-react";
import React, { useState } from "react";
import * as Yup from "yup";
import { StudentDetailModal } from "../components/common/StudentDetailModal.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type { ClassGroup } from "../types/index.js";

export const Route = createFileRoute("/admin-students")({
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
	const { user, isAuthenticated } = useAuthStore();
	const queryClient = useQueryClient();

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedClassFilter, setSelectedClassFilter] = useState("");
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

	// Fetch Classes
	const { data: classesList } = useQuery<ClassGroup[]>({
		queryKey: ["classes"],
		queryFn: async () => {
			const res: any = await api.get("/classes");
			return res.data;
		},
	});

	// Fetch Students Whitelist
	const { data: students, isLoading } = useQuery<any[]>({
		queryKey: [
			"adminStudents",
			{ classId: selectedClassFilter, search: searchQuery },
		],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (selectedClassFilter) params.append("classId", selectedClassFilter);
			if (searchQuery) params.append("search", searchQuery);
			const res: any = await api.get(`/admin/students?${params.toString()}`);
			return res.data;
		},
	});

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
			students,
		}: {
			classId: string;
			students: any[];
		}) => {
			const res: any = await api.post("/admin/students/batch", {
				classId,
				students,
			});
			return res.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["adminStudents"] });
			setBatchResult(data);
			setBatchText("");
		},
	});

	// Delete Mutation
	const deleteMutation = useMutation({
		mutationFn: async (studentId: string) => {
			const res: any = await api.delete(`/admin/students/${studentId}`);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["adminStudents"] });
		},
	});

	const handleProcessBatch = () => {
		if (!batchClassId || !batchText.trim()) return;

		const lines = batchText.split("\n");
		const parsedStudents: any[] = [];

		for (const line of lines) {
			const parts = line.split(/[,;\t]+/).map((p) => p.trim());
			if (parts.length >= 3) {
				parsedStudents.push({
					name: parts[0],
					email: parts[1],
					nim: parts[2],
					githubRepoUrl: parts[3] || "",
					githubPageUrl: parts[4] || "",
				});
			}
		}

		if (parsedStudents.length > 0) {
			batchAddMutation.mutate({
				classId: batchClassId,
				students: parsedStudents,
			});
		}
	};

	return (
		<div className="space-y-6">
			{/* 1. Header & Quick Actions */}
			<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
							Administrasi
						</span>
						<span className="text-slate-300">•</span>
						<span className="text-xs font-medium text-slate-600">
							Whitelist Google OAuth
						</span>
					</div>

					<h2 className="text-lg font-semibold text-slate-900 tracking-tight">
						Manajemen Whitelist Mahasiswa
					</h2>

					<p className="text-xs text-slate-500 leading-relaxed max-w-xl">
						Sistem menggunakan Google OAuth berbasis whitelist. Hanya mahasiswa
						yang emailnya terdaftar yang dapat masuk dan mencatat progres.
					</p>
				</div>

				<div className="flex items-center gap-2.5 shrink-0">
					<button
						type="button"
						onClick={() => {
							setBatchResult(null);
							setIsBatchModalOpen(true);
						}}
						className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
					>
						<FileSpreadsheet size={14} />
						<span>Batch Import CSV</span>
					</button>

					<button
						type="button"
						onClick={() => setIsAddModalOpen(true)}
						className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
					>
						<Plus size={14} />
						<span>Tambah Mahasiswa</span>
					</button>
				</div>
			</div>

			{/* 2. Filters & Search Bar */}
			<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
				<div className="relative flex-1 max-w-md">
					<Search
						size={15}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
					/>
					<input
						type="text"
						placeholder="Cari nama, email, atau NIM..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
					/>
				</div>

				<div className="flex items-center gap-2">
					<Filter size={14} className="text-slate-400" />
					<select
						value={selectedClassFilter}
						onChange={(e) => setSelectedClassFilter(e.target.value)}
						className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
					>
						<option value="">Semua Kelas</option>
						{classesList?.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* 3. Students Data Table */}
			<div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
							<tr>
								<th className="px-5 py-3">Mahasiswa</th>
								<th className="px-4 py-3">NIM</th>
								<th className="px-4 py-3">Kelas</th>
								<th className="px-4 py-3">Aktivitas</th>
								<th className="px-4 py-3">Portfolio</th>
								<th className="px-4 py-3 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{isLoading ? (
								<tr>
									<td
										colSpan={6}
										className="px-5 py-8 text-center text-slate-400"
									>
										Memuat daftar whitelist mahasiswa...
									</td>
								</tr>
							) : students && students.length > 0 ? (
								students.map((st) => (
									<tr
										key={st.id}
										className="hover:bg-slate-50/60 transition-colors"
									>
										<td className="px-5 py-3">
											<div className="flex items-center gap-2.5">
												<div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center font-semibold text-xs text-slate-700 shrink-0">
													{st.avatarUrl ? (
														<img
															src={st.avatarUrl}
															alt={st.name}
															className="w-full h-full object-cover rounded-md"
														/>
													) : (
														st.name.charAt(0).toUpperCase()
													)}
												</div>
												<div className="min-w-0">
													<span className="font-semibold text-slate-900 block truncate">
														{st.name}
													</span>
													<span className="text-[11px] text-slate-400 font-mono">
														{st.email}
													</span>
												</div>
											</div>
										</td>

										<td className="px-4 py-3 font-mono font-medium text-slate-600">
											{st.nim || "-"}
										</td>

										<td className="px-4 py-3">
											<span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-medium text-[11px]">
												{st.className || "-"}
											</span>
										</td>

										<td className="px-4 py-3">
											<span className="font-mono text-blue-600 font-semibold">
												{st.sprintCount || 0} sprint
											</span>
											<span className="text-slate-400 text-[11px] ml-1">
												({st.checkedCount || 0} mandiri)
											</span>
										</td>

										<td className="px-4 py-3">
											<div className="flex items-center gap-2">
												{st.githubRepoUrl && (
													<a
														href={st.githubRepoUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-sm"
														title="GitHub Repo"
													>
														<Code2 size={14} />
													</a>
												)}
												{st.githubPageUrl && (
													<a
														href={st.githubPageUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-sm"
														title="GitHub Pages Live"
													>
														<Globe size={14} />
													</a>
												)}
												{!st.githubRepoUrl && !st.githubPageUrl && (
													<span className="text-slate-300 text-[11px]">-</span>
												)}
											</div>
										</td>

										<td className="px-4 py-3 text-right">
											<div className="flex items-center justify-end gap-1">
												<button
													type="button"
													onClick={() => setInspectedStudent(st)}
													className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
													title="Lihat Detail Progres Mahasiswa"
												>
													<Eye size={14} />
												</button>
												<button
													type="button"
													onClick={() => {
														if (
															confirm(`Hapus ${st.name} dari whitelist sistem?`)
														) {
															deleteMutation.mutate(st.id);
														}
													}}
													className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
													title="Hapus Mahasiswa"
												>
													<Trash2 size={14} />
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={6}
										className="px-5 py-12 text-center text-slate-400"
									>
										Tidak ada mahasiswa ditemukan untuk filter pencarian ini.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Add Single Student Modal */}
			{isAddModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg border border-slate-200">
						<div className="flex items-center justify-between pb-3 border-b border-slate-100">
							<h3 className="text-base font-semibold text-slate-900">
								Tambah Mahasiswa ke Whitelist
							</h3>
							<button
								type="button"
								onClick={() => setIsAddModalOpen(false)}
								className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
							>
								<X size={18} />
							</button>
						</div>

						<Formik
							initialValues={{
								name: "",
								email: "",
								nim: "",
								classId: classesList?.[0]?.id || "",
								githubRepoUrl: "",
								githubPageUrl: "",
							}}
							validationSchema={SingleStudentSchema}
							onSubmit={async (values) => {
								await addStudentMutation.mutateAsync(values);
							}}
						>
							{({ isSubmitting }) => (
								<Form className="space-y-4 mt-4">
									<div>
										<label className="block text-xs font-medium text-slate-700 mb-1">
											Nama Lengkap <span className="text-rose-500">*</span>
										</label>
										<Field
											type="text"
											name="name"
											placeholder="Contoh: Muhammad Zahi Ustadzi"
											className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
										/>
										<ErrorMessage
											name="name"
											component="div"
											className="text-rose-500 text-[11px] mt-0.5"
										/>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="block text-xs font-medium text-slate-700 mb-1">
												Email Google <span className="text-rose-500">*</span>
											</label>
											<Field
												type="email"
												name="email"
												placeholder="email@students.unnes.ac.id"
												className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
											/>
											<ErrorMessage
												name="email"
												component="div"
												className="text-rose-500 text-[11px] mt-0.5"
											/>
										</div>

										<div>
											<label className="block text-xs font-medium text-slate-700 mb-1">
												NIM <span className="text-rose-500">*</span>
											</label>
											<Field
												type="text"
												name="nim"
												placeholder="250414006"
												className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
											/>
											<ErrorMessage
												name="nim"
												component="div"
												className="text-rose-500 text-[11px] mt-0.5"
											/>
										</div>
									</div>

									<div>
										<label className="block text-xs font-medium text-slate-700 mb-1">
											Kelas <span className="text-rose-500">*</span>
										</label>
										<Field
											as="select"
											name="classId"
											className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
										>
											{classesList?.map((cls) => (
												<option key={cls.id} value={cls.id}>
													{cls.name}
												</option>
											))}
										</Field>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="block text-xs font-medium text-slate-700 mb-1">
												URL GitHub Repo (Opsional)
											</label>
											<Field
												type="url"
												name="githubRepoUrl"
												placeholder="https://github.com/..."
												className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
											/>
										</div>

										<div>
											<label className="block text-xs font-medium text-slate-700 mb-1">
												URL GitHub Pages (Opsional)
											</label>
											<Field
												type="url"
												name="githubPageUrl"
												placeholder="https://...github.io"
												className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
											/>
										</div>
									</div>

									<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
										<button
											type="button"
											onClick={() => setIsAddModalOpen(false)}
											className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
										>
											Batal
										</button>
										<button
											type="submit"
											disabled={isSubmitting || addStudentMutation.isPending}
											className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
										>
											{isSubmitting || addStudentMutation.isPending
												? "Menyimpan..."
												: "Simpan Mahasiswa"}
										</button>
									</div>
								</Form>
							)}
						</Formik>
					</div>
				</div>
			)}

			{/* Batch Import CSV Modal */}
			{isBatchModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-lg border border-slate-200">
						<div className="flex items-center justify-between pb-3 border-b border-slate-100">
							<h3 className="text-base font-semibold text-slate-900">
								Batch Import Mahasiswa (CSV / Teks)
							</h3>
							<button
								type="button"
								onClick={() => setIsBatchModalOpen(false)}
								className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
							>
								<X size={18} />
							</button>
						</div>

						<div className="space-y-4 mt-4 text-xs">
							<div>
								<label className="block text-xs font-medium text-slate-700 mb-1">
									Pilih Kelas Tujuan
								</label>
								<select
									value={batchClassId}
									onChange={(e) => setBatchClassId(e.target.value)}
									className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
								>
									<option value="">-- Pilih Kelas --</option>
									{classesList?.map((cls) => (
										<option key={cls.id} value={cls.id}>
											{cls.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-xs font-medium text-slate-700 mb-1">
									Tempel Data Mahasiswa (1 baris per mahasiswa)
								</label>
								<p className="text-[11px] text-slate-500 mb-1.5">
									Format: <code>Nama, Email, NIM, [RepoURL], [PagesURL]</code>
								</p>
								<textarea
									rows={6}
									value={batchText}
									onChange={(e) => setBatchText(e.target.value)}
									placeholder={`Andi Pratama, andi@students.unnes.ac.id, 250414001\nBudi Santoso, budi@students.unnes.ac.id, 250414002`}
									className="w-full p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
								/>
							</div>

							{batchResult && (
								<div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
									<p className="font-semibold">
										✅ Selesai: {batchResult.added} mahasiswa ditambahkan,{" "}
										{batchResult.skipped} dilewati.
									</p>
									{batchResult.errors.length > 0 && (
										<ul className="mt-1 list-disc list-inside text-slate-600">
											{batchResult.errors.map((e, idx) => (
												<li key={idx}>{e}</li>
											))}
										</ul>
									)}
								</div>
							)}

							<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setIsBatchModalOpen(false)}
									className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
								>
									Tutup
								</button>
								<button
									type="button"
									onClick={handleProcessBatch}
									disabled={batchAddMutation.isPending || !batchText.trim()}
									className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer disabled:opacity-50"
								>
									{batchAddMutation.isPending ? "Mengimpor..." : "Mulai Import"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			<StudentDetailModal
				isOpen={!!inspectedStudent}
				onClose={() => setInspectedStudent(null)}
				student={inspectedStudent}
			/>
		</div>
	);
}
