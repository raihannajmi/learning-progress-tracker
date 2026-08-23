import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
	AlertTriangle,
	CheckCircle2,
	Edit2,
	GraduationCap,
	Plus,
	Search,
	ShieldCheck,
	Trash2,
	UserPlus,
	X,
	XCircle,
} from "lucide-react";
import React, { useState } from "react";
import * as Yup from "yup";
import { ConfirmModal } from "../components/common/ConfirmModal.js";
import { EmptyState } from "../components/common/EmptyState.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import { toast } from "../stores/toastStore.js";

export const Route = createFileRoute("/admin-instructors")({
	component: AdminInstructorsPage,
});

interface InstructorUser {
	id: string;
	name: string;
	email: string;
	role: "ADMIN" | "STUDENT";
	avatarUrl: string | null;
	isActive: boolean;
	createdAt: string;
	reviewedCount?: number;
	feedbackCount?: number;
}

const InstructorSchema = Yup.object().shape({
	name: Yup.string()
		.required("Nama lengkap dosen/pengajar wajib diisi")
		.min(2, "Nama minimal 2 karakter")
		.max(255, "Nama maksimal 255 karakter"),
	email: Yup.string()
		.required("Email Google OAuth wajib diisi")
		.email("Format email tidak valid")
		.max(255, "Email maksimal 255 karakter"),
});

function AdminInstructorsPage() {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const queryClient = useQueryClient();

	const [searchInput, setSearchInput] = useState("");
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [editingInstructor, setEditingInstructor] =
		useState<InstructorUser | null>(null);
	const [deletingInstructor, setDeletingInstructor] =
		useState<InstructorUser | null>(null);

	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		} else if (user?.role !== "ADMIN") {
			navigate({ to: "/dashboard" });
		}
	}, [isAuthenticated, user, navigate]);

	// Fetch Instructors
	const { data: responseData, isLoading } = useQuery<{
		data: InstructorUser[];
		total: number;
	}>({
		queryKey: ["instructors", { search: searchInput }],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (searchInput.trim()) params.set("search", searchInput.trim());
			const res: any = await api.get(`/admin/instructors?${params.toString()}`);
			return res;
		},
		enabled: isAuthenticated && user?.role === "ADMIN",
	});

	const instructors = responseData?.data || [];
	const totalInstructors = instructors.length;
	const activeInstructors = instructors.filter((i) => i.isActive).length;
	const totalReviewsGiven = instructors.reduce(
		(acc, i) => acc + (i.reviewedCount || 0),
		0,
	);

	// Add Instructor Mutation
	const addInstructorMutation = useMutation({
		mutationFn: async (values: { name: string; email: string }) => {
			const res: any = await api.post("/admin/instructors", values);
			return res.data;
		},
		onSuccess: (res: any) => {
			queryClient.invalidateQueries({ queryKey: ["instructors"] });
			setIsAddModalOpen(false);
			toast.success(
				"Dosen Berhasil Ditambahkan",
				res?.message || "Akun tim pengajar baru telah aktif di whitelist.",
			);
		},
		onError: (err: any) => {
			toast.error(
				"Gagal Menambahkan Dosen",
				err.response?.data?.message || "Terjadi kesalahan pada server.",
			);
		},
	});

	// Update Instructor Mutation
	const updateInstructorMutation = useMutation({
		mutationFn: async ({
			id,
			values,
		}: {
			id: string;
			values: { name?: string; email?: string; isActive?: boolean };
		}) => {
			const res: any = await api.patch(`/admin/instructors/${id}`, values);
			return res.data;
		},
		onSuccess: (res: any) => {
			queryClient.invalidateQueries({ queryKey: ["instructors"] });
			setEditingInstructor(null);
			toast.success(
				"Data Berhasil Diperbarui",
				res?.message || "Perubahan profil pengajar tersimpan.",
			);
		},
		onError: (err: any) => {
			toast.error(
				"Gagal Memperbarui",
				err.response?.data?.message || "Gagal memperbarui data pengajar.",
			);
		},
	});

	// Delete Instructor Mutation
	const deleteInstructorMutation = useMutation({
		mutationFn: async (id: string) => {
			const res: any = await api.delete(`/admin/instructors/${id}`);
			return res.data;
		},
		onSuccess: (res: any) => {
			queryClient.invalidateQueries({ queryKey: ["instructors"] });
			setDeletingInstructor(null);
			toast.success(
				"Akun Dosen Dihapus",
				res?.message || "Hak akses pengajar telah dicabut dari sistem.",
			);
		},
		onError: (err: any) => {
			toast.error(
				"Gagal Menghapus",
				err.response?.data?.message || "Gagal menghapus akun pengajar.",
			);
		},
	});

	return (
		<div className="max-w-5xl mx-auto w-full space-y-6 min-w-0 max-w-full">
			{/* 1. Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 min-w-0">
				<div>
					<div className="flex items-center gap-2">
						<span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
							Area Dosen & Asisten Dosen
						</span>
						<span className="text-slate-300">•</span>
						<span className="text-xs font-medium text-slate-500 font-mono">
							Whitelist Google OAuth Tim Pengajar
						</span>
					</div>
					<h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
						Kelola Tim Pengajar & Dosen (Admin)
					</h1>
					<p className="text-xs text-slate-500 mt-1 max-w-xl">
						Kelola akun Dosen, Asisten Dosen (TA), dan Administrator yang berhak
						login untuk mengevaluasi progres dan mengelola kurikulum.
					</p>
				</div>

				<div className="flex items-center gap-2 shrink-0">
					<button
						type="button"
						onClick={() => setIsAddModalOpen(true)}
						className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
					>
						<Plus size={14} />
						<span>Tambah Dosen / TA</span>
					</button>
				</div>
			</div>

			{/* 2. KPI Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
							<GraduationCap size={20} />
						</div>
						<div>
							<p className="text-xs font-medium text-slate-500">
								Total Dosen & TA
							</p>
							<p className="text-xl font-bold text-slate-900 font-mono">
								{totalInstructors}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
							<CheckCircle2 size={20} />
						</div>
						<div>
							<p className="text-xs font-medium text-slate-500">
								Pengajar Aktif
							</p>
							<p className="text-xl font-bold text-slate-900 font-mono">
								{activeInstructors} / {totalInstructors}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
							<ShieldCheck size={20} />
						</div>
						<div>
							<p className="text-xs font-medium text-slate-500">
								Review Submisi Selesai
							</p>
							<p className="text-xl font-bold text-slate-900 font-mono">
								{totalReviewsGiven} Submisi
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* 3. Search Bar */}
			<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs min-w-0">
				<div className="relative">
					<Search
						size={15}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
					/>
					<input
						type="text"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						placeholder="Cari berdasarkan nama dosen/TA atau email Google..."
						className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
					/>
				</div>
			</div>

			{/* 4. Instructors Table / Mobile Cards */}
			<div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden min-w-0 max-w-full">
				{isLoading ? (
					<div className="p-8 space-y-4 animate-pulse">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-12 bg-slate-100 rounded-lg" />
						))}
					</div>
				) : instructors.length > 0 ? (
					<>
						{/* Mobile Card View */}
						<div className="divide-y divide-slate-100 md:hidden">
							{instructors.map((instructor) => {
								const isSelf = instructor.id === user?.id;

								return (
									<div key={instructor.id} className="p-4 space-y-3">
										<div className="flex items-start justify-between gap-3">
											<div className="flex items-center gap-2.5 min-w-0">
												<div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
													{instructor.avatarUrl ? (
														<img
															src={instructor.avatarUrl}
															alt={instructor.name}
															className="w-full h-full object-cover rounded-full"
														/>
													) : (
														instructor.name.charAt(0).toUpperCase()
													)}
												</div>
												<div className="min-w-0">
													<div className="flex items-center gap-1.5">
														<p className="font-semibold text-xs text-slate-900 truncate">
															{instructor.name}
														</p>
														{isSelf && (
															<span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded-xs font-semibold">
																Anda
															</span>
														)}
													</div>
													<p className="text-[11px] text-slate-400 font-mono truncate">
														{instructor.email}
													</p>
												</div>
											</div>

											<div className="flex items-center gap-1 shrink-0">
												<button
													type="button"
													onClick={() => setEditingInstructor(instructor)}
													className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-md transition-colors cursor-pointer"
													title="Edit Data Dosen"
												>
													<Edit2 size={14} />
												</button>
												<button
													type="button"
													onClick={() => setDeletingInstructor(instructor)}
													disabled={
														isSelf ||
														deleteInstructorMutation.isPending ||
														totalInstructors <= 1
													}
													className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
													title={
														isSelf
															? "Tidak dapat menghapus akun Anda sendiri"
															: totalInstructors <= 1
																? "Minimal harus ada 1 Dosen/Admin"
																: "Hapus Akses Dosen"
													}
												>
													<Trash2 size={14} />
												</button>
											</div>
										</div>

										<div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
											<span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-sm">
												<ShieldCheck size={11} className="text-blue-600" />
												<span>DOSEN / TA</span>
											</span>

											{instructor.isActive ? (
												<span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
													Aktif
												</span>
											) : (
												<span className="text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-sm">
													Nonaktif
												</span>
											)}

											<span className="text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-sm">
												{instructor.reviewedCount || 0} review
											</span>
											<span className="text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-sm">
												{instructor.feedbackCount || 0} tanggapan
											</span>
										</div>
									</div>
								);
							})}
						</div>

						{/* Desktop Table View */}
						<div className="hidden md:block overflow-x-auto">
							<table className="w-full text-left text-xs border-collapse">
								<thead>
									<tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
										<th className="py-3 px-4">Nama & Akun Dosen</th>
										<th className="py-3 px-4">Peran</th>
										<th className="py-3 px-4">Review Submisi</th>
										<th className="py-3 px-4">Tanggapan Diskusi</th>
										<th className="py-3 px-4">Status</th>
										<th className="py-3 px-4 text-right">Aksi</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100">
									{instructors.map((instructor) => {
										const isSelf = instructor.id === user?.id;

										return (
											<tr
												key={instructor.id}
												className="hover:bg-slate-50/70 transition-colors"
											>
												<td className="py-3.5 px-4">
													<div className="flex items-center gap-2.5">
														<div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
															{instructor.avatarUrl ? (
																<img
																	src={instructor.avatarUrl}
																	alt={instructor.name}
																	className="w-full h-full object-cover rounded-full"
																/>
															) : (
																instructor.name.charAt(0).toUpperCase()
															)}
														</div>
														<div className="min-w-0">
															<div className="flex items-center gap-1.5">
																<p className="font-semibold text-slate-900 truncate">
																	{instructor.name}
																</p>
																{isSelf && (
																	<span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded-xs font-semibold">
																		Anda
																	</span>
																)}
															</div>
															<p className="text-[11px] text-slate-400 font-mono">
																{instructor.email}
															</p>
														</div>
													</div>
												</td>
												<td className="py-3.5 px-4">
													<span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-sm">
														<ShieldCheck size={11} className="text-blue-600" />
														<span>DOSEN / TA</span>
													</span>
												</td>
												<td className="py-3.5 px-4 font-mono text-slate-700 font-medium">
													{instructor.reviewedCount || 0} review
												</td>
												<td className="py-3.5 px-4 font-mono text-slate-700">
													{instructor.feedbackCount || 0} tanggapan
												</td>
												<td className="py-3.5 px-4">
													{instructor.isActive ? (
														<span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
															<CheckCircle2 size={11} />
															<span>Aktif</span>
														</span>
													) : (
														<span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-mono">
															<XCircle size={11} />
															<span>Nonaktif</span>
														</span>
													)}
												</td>
												<td className="py-3.5 px-4 text-right">
													<div className="flex items-center justify-end gap-1.5">
														<button
															type="button"
															onClick={() => setEditingInstructor(instructor)}
															className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-md transition-colors cursor-pointer"
															title="Edit Data Dosen"
														>
															<Edit2 size={14} />
														</button>
														<button
															type="button"
															onClick={() => setDeletingInstructor(instructor)}
															disabled={
																isSelf ||
																deleteInstructorMutation.isPending ||
																totalInstructors <= 1
															}
															className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
															title={
																isSelf
																	? "Tidak dapat menghapus akun Anda sendiri"
																	: totalInstructors <= 1
																		? "Minimal harus ada 1 Dosen/Admin"
																		: "Hapus Akses Dosen"
															}
														>
															<Trash2 size={14} />
														</button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</>
				) : (
					<EmptyState
						icon={GraduationCap}
						title="Tidak ada data dosen/pengajar"
						description="Belum ada data pengajar yang cocok dengan kriteria pencarian Anda."
						actionLabel="Tambah Dosen Baru"
						onAction={() => setIsAddModalOpen(true)}
					/>
				)}
			</div>

			{/* 5. Modal Tambah Dosen / TA */}
			{isAddModalOpen && (
				<div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 max-h-[90dvh] overflow-y-auto">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<div className="flex items-center gap-2">
								<div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
									<UserPlus size={15} />
								</div>
								<h3 className="text-sm font-semibold text-slate-900">
									Tambah Dosen / TA ke Whitelist
								</h3>
							</div>
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
							}}
							validationSchema={InstructorSchema}
							onSubmit={(values) => addInstructorMutation.mutate(values)}
						>
							{({ isSubmitting }) => (
								<Form className="space-y-4 text-xs">
									<div>
										<label className="block font-medium text-slate-700 mb-1">
											Nama Lengkap & Gelar{" "}
											<span className="text-rose-500">*</span>
										</label>
										<Field
											name="name"
											type="text"
											placeholder="Contoh: Dr. Ir. Budi Santoso, M.Kom."
											className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
										/>
										<ErrorMessage
											name="name"
											component="div"
											className="text-rose-500 text-[11px] mt-0.5"
										/>
									</div>

									<div>
										<label className="block font-medium text-slate-700 mb-1">
											Email Google OAuth{" "}
											<span className="text-rose-500">*</span>
										</label>
										<Field
											name="email"
											type="email"
											placeholder="Contoh: dosen@univ.ac.id"
											className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
										/>
										<ErrorMessage
											name="email"
											component="div"
											className="text-rose-500 text-[11px] mt-0.5"
										/>
										<p className="text-[11px] text-slate-500 mt-1">
											Gunakan alamat email Google / Google Workspace resmi yang
											akan digunakan oleh Dosen saat login dengan tombol "Sign
											in with Google".
										</p>
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
											disabled={isSubmitting || addInstructorMutation.isPending}
											className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
										>
											{addInstructorMutation.isPending
												? "Menyimpan..."
												: "Simpan Dosen"}
										</button>
									</div>
								</Form>
							)}
						</Formik>
					</div>
				</div>
			)}

			{/* 6. Modal Edit Dosen / TA */}
			{editingInstructor && (
				<div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 max-h-[90dvh] overflow-y-auto">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<div className="flex items-center gap-2">
								<div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
									<Edit2 size={14} />
								</div>
								<h3 className="text-sm font-semibold text-slate-900">
									Edit Data Dosen / TA
								</h3>
							</div>
							<button
								type="button"
								onClick={() => setEditingInstructor(null)}
								className="text-slate-400 hover:text-slate-600 cursor-pointer"
							>
								<X size={16} />
							</button>
						</div>

						<Formik
							initialValues={{
								name: editingInstructor.name,
								email: editingInstructor.email,
								isActive: editingInstructor.isActive,
							}}
							validationSchema={InstructorSchema}
							onSubmit={(values) =>
								updateInstructorMutation.mutate({
									id: editingInstructor.id,
									values,
								})
							}
						>
							{({ isSubmitting, values, setFieldValue }) => (
								<Form className="space-y-4 text-xs">
									<div>
										<label className="block font-medium text-slate-700 mb-1">
											Nama Lengkap & Gelar{" "}
											<span className="text-rose-500">*</span>
										</label>
										<Field
											name="name"
											type="text"
											className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
										/>
										<ErrorMessage
											name="name"
											component="div"
											className="text-rose-500 text-[11px] mt-0.5"
										/>
									</div>

									<div>
										<label className="block font-medium text-slate-700 mb-1">
											Email Google OAuth{" "}
											<span className="text-rose-500">*</span>
										</label>
										<Field
											name="email"
											type="email"
											className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
										/>
										<ErrorMessage
											name="email"
											component="div"
											className="text-rose-500 text-[11px] mt-0.5"
										/>
									</div>

									<div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between">
										<div>
											<span className="font-semibold text-slate-800 block">
												Status Akun Pengajar
											</span>
											<span className="text-[11px] text-slate-500">
												{values.isActive
													? "Akun aktif dan diizinkan login ke portal dosen"
													: "Akun dinonaktifkan sementara"}
											</span>
										</div>

										<button
											type="button"
											disabled={editingInstructor.id === user?.id}
											onClick={() =>
												setFieldValue("isActive", !values.isActive)
											}
											className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
												values.isActive
													? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
													: "bg-slate-200 text-slate-700 hover:bg-slate-300"
											}`}
										>
											{values.isActive ? "Aktif" : "Nonaktif"}
										</button>
									</div>

									{editingInstructor.id === user?.id && (
										<div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-center gap-2 text-[11px]">
											<AlertTriangle size={14} className="shrink-0" />
											<span>
												Anda sedang mengedit akun Anda sendiri. Status keaktifan
												tidak dapat dinonaktifkan.
											</span>
										</div>
									)}

									<div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
										<button
											type="button"
											onClick={() => setEditingInstructor(null)}
											className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 cursor-pointer"
										>
											Batal
										</button>
										<button
											type="submit"
											disabled={
												isSubmitting || updateInstructorMutation.isPending
											}
											className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
										>
											{updateInstructorMutation.isPending
												? "Menyimpan..."
												: "Simpan Perubahan"}
										</button>
									</div>
								</Form>
							)}
						</Formik>
					</div>
				</div>
			)}

			{/* 7. Modal Konfirmasi Hapus Dosen */}
			<ConfirmModal
				isOpen={Boolean(deletingInstructor)}
				onClose={() => setDeletingInstructor(null)}
				onConfirm={() =>
					deletingInstructor &&
					deleteInstructorMutation.mutate(deletingInstructor.id)
				}
				title="Hapus Hak Akses Dosen / TA"
				message={`Apakah Anda yakin ingin mencabut akses Dosen untuk "${deletingInstructor?.name}" (${deletingInstructor?.email})? Dosen ini tidak akan dapat login lagi ke portal admin.`}
				confirmLabel="Hapus Akses Dosen"
				variant="danger"
				isLoading={deleteInstructorMutation.isPending}
			/>
		</div>
	);
}
