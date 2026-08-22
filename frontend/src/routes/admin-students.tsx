import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
	Code2,
	FileSpreadsheet,
	Filter,
	Globe,
	Search,
	Trash2,
	UserPlus,
	Users,
	X,
} from "lucide-react";
import React, { useState } from "react";
import * as Yup from "yup";
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

		// Parse lines: Name, Email, NIM
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
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
						<Users size={13} />
						<span>Manajemen Whitelist Mahasiswa</span>
					</div>
					<h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
						Daftar & Hak Akses Mahasiswa
					</h1>
					<p className="text-xs text-slate-500 mt-1 max-w-xl">
						Sistem menggunakan Google OAuth berbasis whitelist. Hanya mahasiswa
						yang emailnya terdaftar di sini yang dapat login.
					</p>
				</div>

				<div className="flex items-center gap-2.5 shrink-0">
					<button
						onClick={() => {
							setBatchResult(null);
							setIsBatchModalOpen(true);
						}}
						className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-all cursor-pointer"
					>
						<FileSpreadsheet size={15} />
						<span>Batch Import (CSV)</span>
					</button>
					<button
						onClick={() => setIsAddModalOpen(true)}
						className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 inline-flex items-center gap-1.5 transition-all cursor-pointer"
					>
						<UserPlus size={15} />
						<span>Tambah Mahasiswa</span>
					</button>
				</div>
			</div>

			{/* Filter & Search Bar */}
			<div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
				<div className="relative flex-1">
					<Search size={15} className="absolute left-3 top-3 text-slate-400" />
					<input
						type="text"
						placeholder="Cari berdasarkan Nama, Email, atau NIM..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
					/>
				</div>

				<div className="flex items-center gap-2">
					<Filter size={14} className="text-slate-400" />
					<select
						value={selectedClassFilter}
						onChange={(e) => setSelectedClassFilter(e.target.value)}
						className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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

			{/* Table of Students */}
			<div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs text-slate-700">
						<thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
							<tr>
								<th className="px-5 py-3">Nama Mahasiswa</th>
								<th className="px-4 py-3">NIM</th>
								<th className="px-4 py-3">Kelas</th>
								<th className="px-4 py-3">Sprints / Mandiri</th>
								<th className="px-4 py-3">Evidence Links</th>
								<th className="px-4 py-3 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{isLoading ? (
								<tr>
									<td colSpan={6} className="text-center py-8 text-slate-400">
										Memuat data mahasiswa...
									</td>
								</tr>
							) : students && students.length > 0 ? (
								students.map((st) => (
									<tr
										key={st.id}
										className="hover:bg-slate-50/60 transition-colors"
									>
										<td className="px-5 py-3.5">
											<div className="flex items-center gap-2.5">
												<img
													src={
														st.avatarUrl ||
														`https://ui-avatars.com/api/?name=${encodeURIComponent(
															st.name,
														)}&background=6366f1&color=fff`
													}
													alt={st.name}
													className="w-7 h-7 rounded-full object-cover"
												/>
												<div>
													<span className="font-bold text-slate-900 block">
														{st.name}
													</span>
													<span className="text-[11px] text-slate-400 font-mono">
														{st.email}
													</span>
												</div>
											</div>
										</td>

										<td className="px-4 py-3.5 font-mono font-medium">
											{st.nim || "-"}
										</td>

										<td className="px-4 py-3.5">
											<span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-semibold text-[10px]">
												{st.className || "-"}
											</span>
										</td>

										<td className="px-4 py-3.5">
											<span className="font-mono text-indigo-600 font-bold">
												{st.sprintCount || 0} sprints
											</span>
											<span className="text-slate-400 text-[10px] ml-1">
												({st.checkedCount || 0} mandiri)
											</span>
										</td>

										<td className="px-4 py-3.5">
											<div className="flex items-center gap-2">
												{st.githubRepoUrl && (
													<a
														href={st.githubRepoUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-sm"
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
														className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-sm"
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

										<td className="px-4 py-3.5 text-right">
											<button
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
												<Trash2 size={15} />
											</button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={6}
										className="text-center py-10 text-slate-400 text-xs"
									>
										Tidak ada mahasiswa ditemukan.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal: Add Single Student */}
			{isAddModalOpen && (
				<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
						<div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
							<h3 className="text-sm font-bold text-slate-900">
								Tambah Mahasiswa ke Whitelist
							</h3>
							<button
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
							onSubmit={(values) => {
								addStudentMutation.mutate(values);
							}}
						>
							{({ isSubmitting }) => (
								<Form className="space-y-3 text-xs">
									<div>
										<label className="block font-semibold text-slate-700 mb-1">
											Nama Lengkap *
										</label>
										<Field
											type="text"
											name="name"
											placeholder="Contoh: Rian Hidayat"
											className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
										/>
										<ErrorMessage
											name="name"
											component="div"
											className="text-rose-600 text-[10px] mt-0.5"
										/>
									</div>

									<div>
										<label className="block font-semibold text-slate-700 mb-1">
											Email Akun Google *
										</label>
										<Field
											type="email"
											name="email"
											placeholder="rian@student.univ.ac.id"
											className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
										/>
										<ErrorMessage
											name="email"
											component="div"
											className="text-rose-600 text-[10px] mt-0.5"
										/>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="block font-semibold text-slate-700 mb-1">
												NIM *
											</label>
											<Field
												type="text"
												name="nim"
												placeholder="2026099"
												className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-mono"
											/>
											<ErrorMessage
												name="nim"
												component="div"
												className="text-rose-600 text-[10px] mt-0.5"
											/>
										</div>

										<div>
											<label className="block font-semibold text-slate-700 mb-1">
												Kelas *
											</label>
											<Field
												as="select"
												name="classId"
												className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
											>
												{classesList?.map((c) => (
													<option key={c.id} value={c.id}>
														{c.name}
													</option>
												))}
											</Field>
											<ErrorMessage
												name="classId"
												component="div"
												className="text-rose-600 text-[10px] mt-0.5"
											/>
										</div>
									</div>

									<div>
										<label className="block font-semibold text-slate-700 mb-1">
											GitHub Repo URL (Opsional)
										</label>
										<Field
											type="url"
											name="githubRepoUrl"
											placeholder="https://github.com/username/repo"
											className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-mono"
										/>
									</div>

									<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
										<button
											type="button"
											onClick={() => setIsAddModalOpen(false)}
											className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
										>
											Batal
										</button>
										<button
											type="submit"
											disabled={isSubmitting || addStudentMutation.isPending}
											className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer disabled:opacity-50"
										>
											{addStudentMutation.isPending
												? "Menyimpan..."
												: "Daftarkan"}
										</button>
									</div>
								</Form>
							)}
						</Formik>
					</div>
				</div>
			)}

			{/* Modal: Batch Import */}
			{isBatchModalOpen && (
				<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
						<div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
							<h3 className="text-sm font-bold text-slate-900">
								Batch Import Mahasiswa (CSV / Text)
							</h3>
							<button
								onClick={() => setIsBatchModalOpen(false)}
								className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
							>
								<X size={18} />
							</button>
						</div>

						<div className="space-y-3 text-xs">
							<div>
								<label className="block font-semibold text-slate-700 mb-1">
									Pilih Kelas Tujuan
								</label>
								<select
									value={batchClassId || classesList?.[0]?.id || ""}
									onChange={(e) => setBatchClassId(e.target.value)}
									className="w-full p-2 rounded-lg border border-slate-300 bg-white"
								>
									{classesList?.map((c) => (
										<option key={c.id} value={c.id}>
											{c.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block font-semibold text-slate-700 mb-1">
									Paste Data Mahasiswa (Format: Nama, Email, NIM per baris)
								</label>
								<textarea
									rows={6}
									value={batchText}
									onChange={(e) => setBatchText(e.target.value)}
									placeholder={`Andi Pratama, andi@student.univ.ac.id, 2026001\nBudi Santoso, budi@student.univ.ac.id, 2026002\nCitra Lestari, citra@student.univ.ac.id, 2026003`}
									className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-[11px] focus:ring-2 focus:ring-indigo-500"
								/>
							</div>

							{batchResult && (
								<div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px]">
									<p className="font-bold">
										✅ Selesai: {batchResult.added} mahasiswa berhasil
										ditambahkan, {batchResult.skipped} dilewati.
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
									className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
								>
									Tutup
								</button>
								<button
									type="button"
									onClick={handleProcessBatch}
									disabled={batchAddMutation.isPending || !batchText.trim()}
									className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer disabled:opacity-50"
								>
									{batchAddMutation.isPending ? "Mengimpor..." : "Mulai Import"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
