import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
	Calendar,
	CheckCircle2,
	Clock,
	GraduationCap,
	Pencil,
	Plus,
	School,
	Trash2,
	Users,
	X,
} from "lucide-react";
import React, { useState } from "react";
import * as Yup from "yup";
import { ConfirmModal } from "../components/common/ConfirmModal.js";
import { DatePicker } from "../components/common/DatePicker.js";
import { EmptyState } from "../components/common/EmptyState.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import { toast } from "../stores/toastStore.js";
import type { ClassGroup } from "../types/index.js";

export const Route = createFileRoute("/admin-classes")({
	component: AdminClassesPage,
});

const ClassSchema = Yup.object().shape({
	name: Yup.string().required("Nama kelas wajib diisi").min(2),
	academicTerm: Yup.string().required("Tahun ajaran/semester wajib diisi"),
	startDate: Yup.string().nullable(),
});

function AdminClassesPage() {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const queryClient = useQueryClient();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
	const [deletingClass, setDeletingClass] = useState<ClassGroup | null>(null);

	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		} else if (user?.role !== "ADMIN") {
			navigate({ to: "/dashboard" });
		}
	}, [isAuthenticated, user, navigate]);

	// Fetch Classes
	const { data: classesList, isLoading } = useQuery<ClassGroup[]>({
		queryKey: ["classes"],
		queryFn: async () => {
			const res: any = await api.get("/classes");
			return res.data;
		},
		enabled: isAuthenticated && user?.role === "ADMIN",
	});

	// Create Class Mutation
	const createClassMutation = useMutation({
		mutationFn: async (values: {
			name: string;
			academicTerm: string;
			startDate?: string | null;
		}) => {
			const res: any = await api.post("/classes", values);
			return res.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["classes"] });
			queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
			setIsModalOpen(false);
			setEditingClass(null);
			toast.success(
				"Kelas Berhasil Dibuat",
				`Kelas "${data?.name || ""}" telah aktif.`,
			);
		},
		onError: (err: any) => {
			toast.error(
				"Gagal Membuat Kelas",
				err.response?.data?.message || "Terjadi kesalahan server.",
			);
		},
	});

	// Update Class Mutation
	const updateClassMutation = useMutation({
		mutationFn: async ({
			id,
			values,
		}: {
			id: string;
			values: {
				name: string;
				academicTerm: string;
				startDate?: string | null;
			};
		}) => {
			const res: any = await api.patch(`/classes/${id}`, values);
			return res.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["classes"] });
			queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
			setIsModalOpen(false);
			setEditingClass(null);
			toast.success(
				"Kelas Berhasil Diperbarui",
				`Data kelas "${data?.name || ""}" telah tersimpan.`,
			);
		},
		onError: (err: any) => {
			toast.error(
				"Gagal Memperbarui Kelas",
				err.response?.data?.message || "Terjadi kesalahan server.",
			);
		},
	});

	// Delete Class Mutation
	const deleteClassMutation = useMutation({
		mutationFn: async (id: string) => {
			const res: any = await api.delete(`/classes/${id}`);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["classes"] });
			queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
			setDeletingClass(null);
			toast.success(
				"Kelas Berhasil Dihapus",
				"Data kelas telah dihapus dari sistem.",
			);
		},
		onError: (err: any) => {
			toast.error(
				"Tidak Dapat Menghapus Kelas",
				err.response?.data?.message ||
					"Pastikan tidak ada mahasiswa yang terdaftar di kelas ini.",
			);
			setDeletingClass(null);
		},
	});

	const handleOpenAdd = () => {
		setEditingClass(null);
		setIsModalOpen(true);
	};

	const handleOpenEdit = (cls: ClassGroup) => {
		setEditingClass(cls);
		setIsModalOpen(true);
	};

	const totalClasses = classesList?.length || 0;
	const totalStudents =
		classesList?.reduce((acc, c) => acc + (c.studentCount || 0), 0) || 0;
	const activeClasses =
		classesList?.filter((c) => {
			if (!c.startDate) return true;
			return new Date(c.startDate) <= new Date();
		}).length || 0;

	if (isLoading) {
		return (
			<div className="max-w-5xl mx-auto w-full space-y-6 animate-pulse py-4">
				<div className="h-12 bg-slate-100 rounded-xl" />
				<div className="grid grid-cols-3 gap-4">
					<div className="h-24 bg-slate-100 rounded-xl" />
					<div className="h-24 bg-slate-100 rounded-xl" />
					<div className="h-24 bg-slate-100 rounded-xl" />
				</div>
				<div className="h-64 bg-slate-100 rounded-xl" />
			</div>
		);
	}

	return (
		<div className="max-w-5xl mx-auto w-full space-y-6 min-w-0 max-w-full">
			{/* 1. Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
				<div>
					<div className="flex items-center gap-2">
						<span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
							Area Dosen & Asisten Dosen
						</span>
						<span className="text-slate-300">•</span>
						<span className="text-xs font-medium text-slate-500 font-mono">
							Manajemen Kelas & Jadwal
						</span>
					</div>
					<h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
						Kelola Kelas & Jadwal Perkuliahan
					</h1>
					<p className="text-xs text-slate-500 max-w-xl mt-0.5">
						Atur daftar kelas akademik, tahun ajaran, dan tanggal mulai
						perkuliahan resmi untuk menghitung indikator keaktifan mahasiswa.
					</p>
				</div>

				<button
					type="button"
					onClick={handleOpenAdd}
					className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0 self-start sm:self-center"
				>
					<Plus size={14} />
					<span>Tambah Kelas Baru</span>
				</button>
			</div>

			{/* 2. KPI Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
							<School size={20} />
						</div>
						<div>
							<p className="text-xs font-medium text-slate-500">Total Kelas</p>
							<p className="text-xl font-bold text-slate-900 font-mono">
								{totalClasses}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
							<Users size={20} />
						</div>
						<div>
							<p className="text-xs font-medium text-slate-500">
								Total Mahasiswa Terdaftar
							</p>
							<p className="text-xl font-bold text-slate-900 font-mono">
								{totalStudents}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
							<Clock size={20} />
						</div>
						<div>
							<p className="text-xs font-medium text-slate-500">
								Kelas Aktif Perkuliahan
							</p>
							<p className="text-xl font-bold text-slate-900 font-mono">
								{activeClasses} / {totalClasses}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* 3. Classes Table / List */}
			<div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
				{totalClasses === 0 ? (
					<div className="p-8">
						<EmptyState
							icon={GraduationCap}
							title="Belum ada kelas perkuliahan"
							description="Tambahkan kelas baru untuk mengelompokkan mahasiswa dan mengatur jadwal perkuliahan."
						/>
					</div>
				) : (
					<div className="divide-y divide-slate-100">
						{classesList?.map((cls) => {
							const startDateObj = cls.startDate
								? new Date(cls.startDate)
								: null;
							const hasStarted = startDateObj
								? startDateObj <= new Date()
								: true;
							const formattedDate = startDateObj
								? new Intl.DateTimeFormat("id-ID", {
										weekday: "long",
										day: "numeric",
										month: "long",
										year: "numeric",
									}).format(startDateObj)
								: "Belum diset";

							return (
								<div
									key={cls.id}
									className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
								>
									<div className="space-y-1.5 min-w-0">
										<div className="flex items-center gap-2.5 flex-wrap">
											<h3 className="font-bold text-sm text-slate-900">
												{cls.name}
											</h3>
											<span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-sm">
												{cls.academicTerm}
											</span>
											{hasStarted ? (
												<span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
													<CheckCircle2 size={10} />
													<span>Perkuliahan Berjalan</span>
												</span>
											) : (
												<span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
													<Clock size={10} />
													<span>Mulai Mendatang</span>
												</span>
											)}
										</div>

										<div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-0.5">
											<div className="flex items-center gap-1.5">
												<Calendar size={13} className="text-slate-400" />
												<span>
													Mulai Perkuliahan:{" "}
													<strong className="text-slate-700 font-medium">
														{formattedDate}
													</strong>
												</span>
											</div>

											<div className="flex items-center gap-1.5">
												<Users size={13} className="text-slate-400" />
												<Link
													to="/admin-students"
													search={{ classId: cls.id }}
													className="text-blue-600 hover:text-blue-700 font-semibold hover:underline font-mono"
												>
													{cls.studentCount || 0} Mahasiswa Terdaftar →
												</Link>
											</div>
										</div>
									</div>

									<div className="flex items-center gap-2 shrink-0 self-end md:self-center">
										<button
											type="button"
											onClick={() => handleOpenEdit(cls)}
											className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
										>
											<Pencil size={12} className="text-slate-500" />
											<span>Edit Kelas & Jadwal</span>
										</button>

										<button
											type="button"
											onClick={() => setDeletingClass(cls)}
											disabled={deleteClassMutation.isPending}
											className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
											title="Hapus Kelas"
										>
											<Trash2 size={15} />
										</button>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* 4. Add / Edit Modal with Custom DatePicker */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 max-h-[90dvh] overflow-y-auto">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<h3 className="text-sm font-semibold text-slate-900">
								{editingClass ? "Edit Kelas & Jadwal" : "Tambah Kelas Baru"}
							</h3>
							<button
								type="button"
								onClick={() => {
									setIsModalOpen(false);
									setEditingClass(null);
								}}
								className="text-slate-400 hover:text-slate-600 cursor-pointer"
							>
								<X size={16} />
							</button>
						</div>

						<Formik
							initialValues={{
								name: editingClass?.name || "",
								academicTerm: editingClass?.academicTerm || "2026/2027 Ganjil",
								startDate: editingClass?.startDate
									? new Date(editingClass.startDate).toISOString().slice(0, 10)
									: "",
							}}
							validationSchema={ClassSchema}
							onSubmit={(values, { setSubmitting }) => {
								const payload = {
									name: values.name.trim(),
									academicTerm: values.academicTerm.trim(),
									startDate: values.startDate
										? new Date(values.startDate).toISOString()
										: null,
								};

								if (editingClass) {
									updateClassMutation.mutate(
										{ id: editingClass.id, values: payload },
										{
											onSettled: () => setSubmitting(false),
										},
									);
								} else {
									createClassMutation.mutate(payload, {
										onSettled: () => setSubmitting(false),
									});
								}
							}}
						>
							{({ values, setFieldValue, isSubmitting }) => (
								<Form className="space-y-3.5 text-xs">
									<div>
										<label className="block font-medium text-slate-700 mb-1">
											Nama Kelas Perkuliahan *
										</label>
										<Field
											type="text"
											name="name"
											placeholder="Contoh: Rabu, Jam 10 DC 3A"
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
											Semester / Tahun Ajaran *
										</label>
										<Field
											type="text"
											name="academicTerm"
											placeholder="Contoh: 2026/2027 Ganjil"
											className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
										/>
										<ErrorMessage
											name="academicTerm"
											component="div"
											className="text-rose-600 text-[11px] mt-0.5"
										/>
									</div>

									<div>
										<label className="block font-medium text-slate-700 mb-1">
											Tanggal Mulai Perkuliahan Resmi
										</label>
										<DatePicker
											value={values.startDate}
											onChange={(dateStr) =>
												setFieldValue("startDate", dateStr)
											}
											placeholder="Pilih Tanggal Mulai (e.g. 19 Agustus 2026)"
										/>
										<p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
											Digunakan sebagai acuan perhitungan toleransi 7 hari
											keaktifan sprint & deteksi mahasiswa yang perlu perhatian.
										</p>
									</div>

									<div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
										<button
											type="button"
											onClick={() => {
												setIsModalOpen(false);
												setEditingClass(null);
											}}
											className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 cursor-pointer"
										>
											Batal
										</button>
										<button
											type="submit"
											disabled={
												isSubmitting ||
												createClassMutation.isPending ||
												updateClassMutation.isPending
											}
											className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
										>
											{isSubmitting ||
											createClassMutation.isPending ||
											updateClassMutation.isPending
												? "Menyimpan..."
												: editingClass
													? "Simpan Perubahan"
													: "Buat Kelas"}
										</button>
									</div>
								</Form>
							)}
						</Formik>
					</div>
				</div>
			)}

			{/* 5. Delete Confirm Dialog */}
			<ConfirmModal
				isOpen={!!deletingClass}
				title={`Hapus Kelas "${deletingClass?.name || ""}"?`}
				description={`Apakah Anda yakin ingin menghapus kelas ini? Tindakan ini tidak dapat dibatalkan.`}
				confirmText="Ya, Hapus Kelas"
				cancelText="Batal"
				variant="danger"
				isLoading={deleteClassMutation.isPending}
				onConfirm={() =>
					deletingClass && deleteClassMutation.mutate(deletingClass.id)
				}
				onCancel={() => setDeletingClass(null)}
			/>
		</div>
	);
}
