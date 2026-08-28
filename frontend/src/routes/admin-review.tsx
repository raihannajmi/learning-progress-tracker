import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import {
	ArrowUpRight,
	CheckCircle2,
	ChevronRight,
	ClipboardCheck,
	ExternalLink,
	Globe,
	Search,
	Send,
	Timer,
	Video,
	X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { EmptyState } from "../components/common/EmptyState.js";
import { HabitBadge } from "../components/common/HabitBadge.js";
import { Pagination } from "../components/common/Pagination.js";
import { SelectDropdown } from "../components/common/SelectDropdown.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import { toast } from "../stores/toastStore.js";
import type {
	ClassGroup,
	PaginatedResponse,
	ReviewQueueItem,
	ReviewStatus,
} from "../types/index.js";

interface ReviewSearchParams {
	page?: number;
	limit?: number;
	classId?: string;
	status?: ReviewStatus;
	search?: string;
}

export const Route = createFileRoute("/admin-review")({
	validateSearch: (search: Record<string, unknown>): ReviewSearchParams => {
		return {
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 10,
			classId: (search.classId as string) || undefined,
			status: (search.status as ReviewStatus) || "ALL",
			search: (search.search as string) || undefined,
		};
	},
	component: AdminReviewPage,
});

function AdminReviewPage() {
	const navigate = useNavigate();
	const searchParams = useSearch({ from: "/admin-review" });
	const { user, isAuthenticated } = useAuthStore();
	const queryClient = useQueryClient();

	const currentPage = searchParams.page || 1;
	const pageSize = searchParams.limit || 10;
	const selectedClassId = searchParams.classId || "";
	const currentStatus = searchParams.status || "ALL";
	const currentSearch = searchParams.search || "";

	// Local state for debounced search input
	const [searchInput, setSearchInput] = useState(currentSearch);
	const [selectedSprintForReview, setSelectedSprintForReview] =
		useState<ReviewQueueItem | null>(null);
	const [feedbackText, setFeedbackText] = useState("");
	const [feedbackError, setFeedbackError] = useState<string | null>(null);

	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		} else if (user?.role !== "ADMIN") {
			navigate({ to: "/dashboard" });
		}
	}, [isAuthenticated, user, navigate]);

	// Sync search input with searchParams
	useEffect(() => {
		setSearchInput(currentSearch);
	}, [currentSearch]);

	// Debounce search input changes to URL
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchInput !== currentSearch) {
				navigate({
					to: "/admin-review",
					search: {
						...searchParams,
						search: searchInput.trim() || undefined,
						page: 1,
					},
				});
			}
		}, 350);

		return () => clearTimeout(timer);
	}, [searchInput, currentSearch, navigate, searchParams]);

	// Helper for updating URL parameters
	const updateFilters = (updates: Partial<ReviewSearchParams>) => {
		navigate({
			to: "/admin-review",
			search: {
				...searchParams,
				...updates,
			},
		});
	};

	// Fetch Class Groups
	const { data: classGroups } = useQuery<ClassGroup[]>({
		queryKey: ["classes"],
		queryFn: async () => {
			const res: any = await api.get("/classes");
			return res.data;
		},
		enabled: isAuthenticated && user?.role === "ADMIN",
	});

	// Fetch Review Queue (Server-Side Paginated)
	const { data: reviewResponse, isLoading } = useQuery<
		PaginatedResponse<ReviewQueueItem>
	>({
		queryKey: [
			"adminReviews",
			{
				page: currentPage,
				limit: pageSize,
				classId: selectedClassId,
				status: currentStatus,
				search: currentSearch,
			},
		],
		queryFn: async () => {
			const query = new URLSearchParams();
			query.set("page", String(currentPage));
			query.set("limit", String(pageSize));
			if (selectedClassId) query.set("classId", selectedClassId);
			if (currentStatus) query.set("status", currentStatus);
			if (currentSearch) query.set("search", currentSearch);

			const res: any = await api.get(`/admin/reviews?${query.toString()}`);
			return res;
		},
		enabled: isAuthenticated && user?.role === "ADMIN",
	});

	const submissions = reviewResponse?.data || [];
	const pagination = reviewResponse?.pagination;

	// Submit Instructor Review Mutation
	const submitReviewMutation = useMutation({
		mutationFn: async ({
			sprintId,
			instructorFeedback,
		}: {
			sprintId: string;
			instructorFeedback: string;
		}) => {
			const res: any = await api.post(`/admin/reviews/${sprintId}`, {
				instructorFeedback,
				reviewStatus: "REVIEWED",
			});
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
			queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
			setSelectedSprintForReview(null);
			setFeedbackText("");
			setFeedbackError(null);
			toast.success(
				"Feedback Terkirim",
				"Catatan review pedagogis telah dikirimkan ke mahasiswa.",
			);
		},
		onError: (err: any) => {
			const msg =
				err.response?.data?.error?.message ||
				"Gagal mengirim feedback asistensi.";
			setFeedbackError(msg);
			toast.error("Gagal Mengirim Feedback", msg);
		},
	});

	const handleOpenReviewModal = (sprint: ReviewQueueItem) => {
		setSelectedSprintForReview(sprint);
		setFeedbackText(sprint.instructorFeedback || "");
		setFeedbackError(null);
	};

	const handleSubmitReview = (e: React.FormEvent) => {
		e.preventDefault();
		if (!feedbackText.trim()) {
			setFeedbackError("Feedback asistensi tidak boleh kosong.");
			return;
		}
		if (!selectedSprintForReview) return;

		submitReviewMutation.mutate({
			sprintId: selectedSprintForReview.id,
			instructorFeedback: feedbackText,
		});
	};

	const quickTemplates = [
		"Pemahaman konsep dan implementasi logika sudah sangat baik. Lanjutkan ke topik berikutnya.",
		"Praktek kode sudah tepat, namun perhatikan penataan layout responsif di layar mobile.",
		"Solusi kode bekerja dengan baik. Coba eksplorasi penanganan edge case dan error boundary.",
		"Refleksi belajar sangat jelas. Bukti live demo dan repositori GitHub rapi dan terstruktur.",
	];

	return (
		<div className="space-y-6 max-w-full min-w-0">
			{/* 1. Page Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
				<div>
					<div className="flex items-center gap-2">
						<span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
							Area Dosen & Asisten Dosen
						</span>
						<span className="text-slate-300">•</span>
						<span className="text-xs font-medium text-slate-500 font-mono">
							Evaluasi Pedagogis & Asistensi
						</span>
					</div>
					<h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
						Antrean Review Bukti Belajar Mahasiswa
					</h1>
					<p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
						Periksa submission refleksi belajar dan link evidence mahasiswa.
						Berikan feedback resmi yang konstruktif untuk memvalidasi pencapaian
						kompetensi.
					</p>
				</div>

				<div className="flex items-center gap-2 shrink-0">
					<div className="bg-blue-50 border border-blue-200 rounded-lg px-3.5 py-2 text-xs text-blue-900 flex items-center gap-2">
						<ClipboardCheck size={16} className="text-blue-600" />
						<div>
							<span className="font-semibold block font-mono">
								{pagination?.total || 0} Submisi Terdata
							</span>
							<span className="text-[11px] text-blue-700">
								Membutuhkan asistensi dosen
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* 2. Filter Bar & Tabs */}
			<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
				{/* Status Tabs */}
				<div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
					<div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
						{(
							[
								{ key: "ALL", label: "Semua Submisi" },
								{ key: "PENDING", label: "Menunggu Review" },
								{ key: "REVIEWED", label: "Sudah Direview" },
							] as const
						).map((tab) => (
							<button
								key={tab.key}
								type="button"
								onClick={() => updateFilters({ status: tab.key, page: 1 })}
								className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
									currentStatus === tab.key
										? "bg-white text-slate-900 font-semibold shadow-xs"
										: "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>

					<div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
						<span>
							Menampilkan halaman {currentPage} dari{" "}
							{pagination?.totalPages || 1}
						</span>
					</div>
				</div>

				{/* Search & Class Dropdown */}
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
							placeholder="Cari berdasarkan nama mahasiswa, NIM, atau topik materi..."
							className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
						/>
					</div>

					<div>
						<SelectDropdown
							value={selectedClassId}
							onChange={(val) =>
								updateFilters({ classId: val || undefined, page: 1 })
							}
							placeholder="Semua Kelas Mahasiswa"
							allowClear
							options={[
								{ value: "", label: "Semua Kelas Mahasiswa" },
								...(classGroups?.map((cg) => ({
									value: cg.id,
									label: cg.name,
									badge: cg.academicTerm,
								})) || []),
							]}
						/>
					</div>
				</div>
			</div>

			{/* 3. Submissions Table / Queue */}
			<div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
				{isLoading ? (
					<div className="p-8 space-y-4 animate-pulse">
						{[1, 2, 3, 4, 5].map((i) => (
							<div key={i} className="h-16 bg-slate-100 rounded-lg" />
						))}
					</div>
				) : submissions.length > 0 ? (
					<div className="divide-y divide-slate-100">
						{submissions.map((item) => (
							<div
								key={item.id}
								className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 min-w-0"
							>
								{/* Left: Student info & topic */}
								<div className="space-y-2 min-w-0 max-w-full">
									<div className="flex flex-wrap items-center gap-2">
										<span className="font-semibold text-xs text-slate-900">
											{item.student.name}
										</span>
										<span className="text-slate-300">•</span>
										<span className="font-mono text-[11px] text-slate-500">
											{item.student.nim || "NIM -"}
										</span>
										<span className="text-slate-300">•</span>
										<span className="text-xs text-slate-600 font-medium">
											{item.student.className || "Kelas Belum Ditentukan"}
										</span>
										<span className="text-slate-300">•</span>
										<span className="text-[11px] font-mono text-slate-400">
											{new Date(item.createdAt).toLocaleDateString("id-ID", {
												day: "numeric",
												month: "short",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</div>

									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<span className="text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-sm">
												{item.topic?.category || "MANDIRI"}
											</span>
											<h3 className="text-xs font-semibold text-slate-800">
												{item.topic?.title || "Sesi Mandiri"}
											</h3>
										</div>

										<p className="text-xs text-slate-600 line-clamp-2">
											<strong className="text-slate-700">Refleksi:</strong>{" "}
											{item.whatLearned}
										</p>
										{item.confusingParts && (
											<p className="text-xs text-amber-700 bg-amber-50/60 px-2 py-1 rounded-md border border-amber-200/60 line-clamp-1">
												<strong>Kendala:</strong> {item.confusingParts}
											</p>
										)}
									</div>
								</div>

								{/* Right: Meta & Actions */}
								<div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
									<HabitBadge durationMinutes={item.durationMinutes} />

									{item.evidenceUrl && (
										<a
											href={item.evidenceUrl}
											target="_blank"
											rel="noreferrer"
											className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md inline-flex items-center gap-1 transition-colors"
											title={item.evidenceUrl}
										>
											<ExternalLink size={12} />
											<span>
												{item.evidenceUrl.includes("github.com")
													? "GitHub"
													: item.evidenceType}
											</span>
										</a>
									)}

									{item.loomUrl && (
										<a
											href={item.loomUrl}
											target="_blank"
											rel="noreferrer"
											className="px-2.5 py-1 text-xs font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md inline-flex items-center gap-1 transition-colors"
											title={item.loomUrl}
										>
											<Video size={12} className="text-indigo-600" />
											<span>Loom</span>
										</a>
									)}

									{item.demoUrl && (
										<a
											href={item.demoUrl}
											target="_blank"
											rel="noreferrer"
											className="px-2.5 py-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md inline-flex items-center gap-1 transition-colors"
											title={item.demoUrl}
										>
											<Globe size={12} className="text-emerald-600" />
											<span>Demo</span>
										</a>
									)}

									{item.reviewStatus === "REVIEWED" ? (
										<span className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md inline-flex items-center gap-1 font-mono">
											<CheckCircle2 size={12} className="text-emerald-600" />
											<span>Sudah Direview</span>
										</span>
									) : (
										<span className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md inline-flex items-center gap-1 font-mono">
											<Timer size={12} className="text-amber-500" />
											<span>Menunggu Review</span>
										</span>
									)}

									<button
										type="button"
										onClick={() => handleOpenReviewModal(item)}
										className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
									>
										<span>
											{item.reviewStatus === "REVIEWED"
												? "Edit Review"
												: "Beri Feedback"}
										</span>
										<ChevronRight size={13} />
									</button>
								</div>
							</div>
						))}
					</div>
				) : (
					<EmptyState
						icon={ClipboardCheck}
						title="Tidak ada submisi yang sesuai filter"
						description="Semua submisi mahasiswa telah diperiksa atau tidak ditemukan data yang cocok dengan kriteria pencarian Anda."
						actionLabel="Reset Semua Filter"
						onAction={() =>
							updateFilters({
								page: 1,
								limit: 10,
								status: "ALL",
								search: undefined,
								classId: undefined,
							})
						}
					/>
				)}

				{/* 4. Pagination Footer */}
				{pagination && pagination.totalPages > 1 && (
					<div className="p-4 border-t border-slate-100">
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

			{/* 5. Instructor Review Dialog Modal */}
			{selectedSprintForReview && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
					<div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
						{/* Modal Header */}
						<div className="p-5 border-b border-slate-100 flex items-center justify-between">
							<div>
								<h2 className="text-base font-bold text-slate-900">
									Evaluasi & Feedback Asistensi Pembelajaran
								</h2>
								<p className="text-xs text-slate-500 mt-0.5">
									Berikan bimbingan pedagogis atas submission belajar mahasiswa
								</p>
							</div>
							<button
								type="button"
								onClick={() => setSelectedSprintForReview(null)}
								className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
							>
								<X size={18} />
							</button>
						</div>

						{/* Modal Body */}
						<div className="p-6 overflow-y-auto space-y-5">
							{/* Student & Session Info Box */}
							<div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<div className="text-xs">
										<span className="font-bold text-slate-900">
											{selectedSprintForReview.student.name}
										</span>
										<span className="text-slate-400 font-mono ml-1.5">
											({selectedSprintForReview.student.nim || "NIM -"})
										</span>
										<span className="text-slate-300 mx-2">•</span>
										<span className="text-slate-600">
											{selectedSprintForReview.student.className}
										</span>
									</div>

									<HabitBadge
										durationMinutes={selectedSprintForReview.durationMinutes}
									/>
								</div>

								<div className="text-xs space-y-1.5 pt-2 border-t border-slate-200/70">
									<div className="flex items-center gap-2">
										<span className="font-mono uppercase font-bold text-blue-600">
											Topik:
										</span>
										<span className="font-semibold text-slate-800">
											{selectedSprintForReview.topic?.title ||
												"Belajar Mandiri"}
										</span>
									</div>
									<p className="text-slate-600 break-words whitespace-pre-wrap">
										<strong className="text-slate-700">
											Apa yang dipelajari:
										</strong>{" "}
										{selectedSprintForReview.whatLearned}
									</p>
									<p className="text-slate-600 break-words whitespace-pre-wrap">
										<strong className="text-slate-700">
											Apa yang dipraktekkan:
										</strong>{" "}
										{selectedSprintForReview.whatPracticed}
									</p>
									{selectedSprintForReview.confusingParts && (
										<p className="text-amber-800 bg-amber-50 p-2 rounded-md border border-amber-200 break-words whitespace-pre-wrap">
											<strong>Kendala Belajar:</strong>{" "}
											{selectedSprintForReview.confusingParts}
										</p>
									)}
								</div>

								{/* Multi-Evidence links */}
								{(selectedSprintForReview.evidenceUrl ||
									selectedSprintForReview.loomUrl ||
									selectedSprintForReview.demoUrl) && (
									<div className="pt-2.5 border-t border-slate-200/70 space-y-2 text-xs">
										<span className="text-[11px] font-semibold text-slate-700 block">
											Tautan Bukti Submisi Mahasiswa:
										</span>
										<div className="flex flex-wrap items-center gap-2">
											{selectedSprintForReview.evidenceUrl && (
												<a
													href={selectedSprintForReview.evidenceUrl}
													target="_blank"
													rel="noreferrer"
													className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors"
												>
													<span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
													<span>
														{selectedSprintForReview.evidenceUrl.includes(
															"github.com",
														)
															? "GitHub Repo / PR"
															: `Bukti (${selectedSprintForReview.evidenceType || "Link"})`}
													</span>
													<ArrowUpRight size={13} />
												</a>
											)}

											{selectedSprintForReview.loomUrl && (
												<a
													href={selectedSprintForReview.loomUrl}
													target="_blank"
													rel="noreferrer"
													className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-medium border border-indigo-200 transition-colors"
												>
													<Video size={13} className="text-indigo-600" />
													<span>Tonton Video Loom</span>
													<ArrowUpRight size={13} />
												</a>
											)}

											{selectedSprintForReview.demoUrl && (
												<a
													href={selectedSprintForReview.demoUrl}
													target="_blank"
													rel="noreferrer"
													className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium border border-emerald-200 transition-colors"
												>
													<Globe size={13} className="text-emerald-600" />
													<span>Live Demo</span>
													<ArrowUpRight size={13} />
												</a>
											)}
										</div>
									</div>
								)}
							</div>

							{/* Feedback Input Form */}
							<form onSubmit={handleSubmitReview} className="space-y-4">
								<div className="space-y-2">
									<label className="block text-xs font-semibold text-slate-900">
										Catatan Evaluasi / Feedback Asistensi Resmi
									</label>
									<p className="text-[11px] text-slate-500">
										Feedback ini akan ditampilkan secara resmi dengan badge
										Dosen/TA kepada mahasiswa yang bersangkutan.
									</p>

									{/* Quick template suggestions */}
									<div className="flex flex-wrap gap-1.5 pt-1">
										{quickTemplates.map((template, idx) => (
											<button
												key={idx}
												type="button"
												onClick={() => setFeedbackText(template)}
												className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md transition-colors text-left cursor-pointer"
											>
												+ {template.slice(0, 45)}...
											</button>
										))}
									</div>

									<textarea
										rows={4}
										value={feedbackText}
										onChange={(e) => {
											setFeedbackText(e.target.value);
											if (feedbackError) setFeedbackError(null);
										}}
										placeholder="Tuliskan evaluasi pedagogis, saran perbaikan kode, atau validasi pemahaman konsep mahasiswa di sini..."
										className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 leading-relaxed"
									/>
								</div>

								{feedbackError && (
									<p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
										{feedbackError}
									</p>
								)}

								<div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
									<button
										type="button"
										onClick={() => setSelectedSprintForReview(null)}
										className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
									>
										Batal
									</button>

									<button
										type="submit"
										disabled={submitReviewMutation.isPending}
										className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
									>
										<Send size={13} />
										<span>
											{submitReviewMutation.isPending
												? "Menyimpan..."
												: "Kirim Feedback & Tandai Selesai"}
										</span>
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
