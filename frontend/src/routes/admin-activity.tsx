import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import {
	ArrowLeft,
	ArrowUpRight,
	ExternalLink,
	Flame,
	Timer,
} from "lucide-react";
import React from "react";
import { EmptyState } from "../components/common/EmptyState.js";
import { Pagination } from "../components/common/Pagination.js";
import { SelectDropdown } from "../components/common/SelectDropdown.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type {
	ClassGroup,
	LearningSprint,
	PaginatedResponse,
} from "../types/index.js";

interface ActivitySearchParams {
	page?: number;
	limit?: number;
	classId?: string;
}

export const Route = createFileRoute("/admin-activity")({
	validateSearch: (search: Record<string, unknown>): ActivitySearchParams => {
		return {
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 10,
			classId: (search.classId as string) || undefined,
		};
	},
	component: AdminActivityPage,
});

function AdminActivityPage() {
	const navigate = useNavigate();
	const searchParams = useSearch({ from: "/admin-activity" });
	const { user, isAuthenticated } = useAuthStore();

	const currentPage = searchParams.page || 1;
	const pageSize = searchParams.limit || 10;
	const selectedClassId = searchParams.classId || "";

	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		} else if (user?.role !== "ADMIN") {
			navigate({ to: "/dashboard" });
		}
	}, [isAuthenticated, user, navigate]);

	const updateFilters = (updates: Partial<ActivitySearchParams>) => {
		navigate({
			to: "/admin-activity",
			search: {
				...searchParams,
				...updates,
			},
		});
	};

	// Fetch classes
	const { data: classesList } = useQuery<ClassGroup[]>({
		queryKey: ["classes"],
		queryFn: async () => {
			const res: any = await api.get("/classes");
			return res.data;
		},
	});

	// Fetch Sprints / Activities (Server-Side Paginated)
	const { data: sprintResponse, isLoading } = useQuery<
		PaginatedResponse<LearningSprint>
	>({
		queryKey: [
			"adminActivities",
			{ classId: selectedClassId, page: currentPage, limit: pageSize },
		],
		queryFn: async () => {
			const params = new URLSearchParams();
			params.set("page", String(currentPage));
			params.set("limit", String(pageSize));
			if (selectedClassId) params.set("classId", selectedClassId);

			const res: any = await api.get(`/sprints?${params.toString()}`);
			return res;
		},
	});

	const sprints = sprintResponse?.data || [];
	const pagination = sprintResponse?.pagination;

	return (
		<div className="max-w-4xl mx-auto w-full space-y-8">
			{/* 1. Header with Breadcrumb Back Link & Class Filter */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
				<div className="space-y-1">
					<Link
						to="/admin"
						className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
					>
						<ArrowLeft size={13} />
						<span>Kembali ke Monitoring Overview</span>
					</Link>
					<h1 className="text-xl font-bold tracking-tight text-slate-900">
						Aktivitas & Bukti Pembelajaran Mahasiswa
					</h1>
					<p className="text-xs text-slate-500 max-w-xl">
						Eksplorasi riwayat sesi fokus, catatan refleksi kode, dan tautan
						bukti submission karya mahasiswa dari seluruh kelas.
					</p>
				</div>

				{/* Class Filter Selector */}
				<div className="w-56 shrink-0">
					<SelectDropdown
						value={selectedClassId}
						onChange={(val) =>
							updateFilters({
								classId: val || undefined,
								page: 1,
							})
						}
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

			{/* 2. Activities List */}
			<div className="space-y-4">
				{isLoading ? (
					<div className="space-y-3 animate-pulse">
						<div className="h-28 bg-slate-100 rounded-xl" />
						<div className="h-28 bg-slate-100 rounded-xl" />
						<div className="h-28 bg-slate-100 rounded-xl" />
					</div>
				) : sprints.length === 0 ? (
					<EmptyState
						icon={Timer}
						title="Belum ada aktivitas pembelajaran tercatat"
						description="Ketika mahasiswa menyelesaikan sesi fokus dan mencatat refleksi, seluruh aktivitas akan muncul di sini."
					/>
				) : (
					<>
						<div className="bg-white rounded-xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
							{sprints.map((sprint) => (
								<div
									key={sprint.id}
									className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 text-xs hover:bg-slate-50/50 transition-colors"
								>
									<div className="space-y-2 min-w-0 flex-1">
										<div className="flex items-center gap-2 flex-wrap">
											<span className="font-bold text-slate-900 text-sm">
												{sprint.user?.name || "Mahasiswa"}
											</span>
											{sprint.user?.className && (
												<span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm font-medium">
													{sprint.user.className}
												</span>
											)}
											<span className="text-slate-300">•</span>
											<span className="text-slate-400 font-mono text-[11px]">
												{new Date(sprint.createdAt).toLocaleDateString(
													"id-ID",
													{
														day: "numeric",
														month: "short",
														hour: "2-digit",
														minute: "2-digit",
													},
												)}
											</span>
										</div>

										{sprint.topic && (
											<div className="flex items-center gap-2">
												<span className="text-[10px] font-mono font-bold uppercase text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-sm">
													{sprint.topic.category}
												</span>
												<span className="font-semibold text-slate-800">
													{sprint.topic.title}
												</span>
											</div>
										)}

										<p className="text-slate-700 leading-relaxed">
											<strong className="text-slate-900 font-semibold">
												Pelajari:
											</strong>{" "}
											{sprint.whatLearned}
										</p>

										{sprint.confusingParts && (
											<p className="text-amber-800 bg-amber-50/60 p-2 rounded-md border border-amber-200/70 italic">
												<strong>Kendala:</strong> "{sprint.confusingParts}"
											</p>
										)}
									</div>

									<div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
										<div className="flex items-center gap-2">
											<span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
												{sprint.durationMinutes}m Fokus
											</span>
											{sprint.durationMinutes >= 25 && (
												<span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px] font-mono border border-amber-200 inline-flex items-center gap-1">
													<Flame size={11} className="text-amber-500" />
													<span>Habit</span>
												</span>
											)}
										</div>

										<div className="flex items-center gap-2 pt-1">
											{sprint.evidenceUrl && (
												<a
													href={sprint.evidenceUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-md font-medium inline-flex items-center gap-1 transition-colors"
												>
													<span>{sprint.evidenceType}</span>
													<ExternalLink size={11} />
												</a>
											)}

											<Link
												to="/class"
												search={{ classId: selectedClassId || undefined }}
												className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold inline-flex items-center gap-1 shadow-xs transition-colors"
											>
												<span>Buka di Feed</span>
												<ArrowUpRight size={12} />
											</Link>
										</div>
									</div>
								</div>
							))}
						</div>

						{pagination && pagination.totalPages > 1 && (
							<div className="pt-2">
								<Pagination
									currentPage={currentPage}
									totalPages={pagination.totalPages}
									onPageChange={(page) => updateFilters({ page })}
									pageSize={pageSize}
									totalItems={pagination.total}
									onPageSizeChange={(limit) =>
										updateFilters({ limit, page: 1 })
									}
									pageSizeOptions={[5, 10, 20]}
								/>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
