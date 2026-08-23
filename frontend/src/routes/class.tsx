import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { Filter, MessageSquare } from "lucide-react";
import React from "react";
import { EmptyState } from "../components/common/EmptyState.js";
import { Pagination } from "../components/common/Pagination.js";
import { PeerFeedbackCard } from "../components/common/PeerFeedbackCard.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type {
	ClassGroup,
	LearningSprint,
	PaginatedResponse,
} from "../types/index.js";

interface ClassSearchParams {
	page?: number;
	limit?: number;
	classId?: string;
}

export const Route = createFileRoute("/class")({
	validateSearch: (search: Record<string, unknown>): ClassSearchParams => {
		return {
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 10,
			classId: (search.classId as string) || undefined,
		};
	},
	component: ClassFeedPage,
});

function ClassFeedPage() {
	const navigate = useNavigate();
	const searchParams = useSearch({ from: "/class" });
	const { user, isAuthenticated } = useAuthStore();

	const currentPage = searchParams.page || 1;
	const pageSize = searchParams.limit || 10;
	const selectedClassId = searchParams.classId || user?.classId || "";

	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		}
	}, [isAuthenticated, navigate]);

	const updateFilters = (updates: Partial<ClassSearchParams>) => {
		navigate({
			search: (prev) => ({
				...prev,
				...updates,
			}),
		});
	};

	// Fetch classes for switcher
	const { data: classesList } = useQuery<ClassGroup[]>({
		queryKey: ["classes"],
		queryFn: async () => {
			const res: any = await api.get("/classes");
			return res.data;
		},
		enabled: isAuthenticated,
	});

	// Fetch Sprints for class (Server-Side Paginated)
	const { data: sprintResponse, isLoading } = useQuery<
		PaginatedResponse<LearningSprint>
	>({
		queryKey: [
			"classSprints",
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
		enabled: isAuthenticated,
	});

	const sprints = sprintResponse?.data || [];
	const pagination = sprintResponse?.pagination;

	const activeClassName =
		classesList?.find((c) => c.id === selectedClassId)?.name || "Semua Kelas";

	return (
		<div className="space-y-6">
			{/* 1. Header with Class Selector */}
			<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
							Komunitas Kelas
						</span>
						<span className="text-slate-300">•</span>
						<span className="text-xs font-medium text-slate-600">
							Social Accountability
						</span>
					</div>

					<h2 className="text-lg font-semibold text-slate-900 tracking-tight">
						Feed Progres & Peer Feedback
					</h2>

					<p className="text-xs text-slate-500 leading-relaxed max-w-xl">
						Lihat apa yang sedang dipelajari teman sekelas, eksplorasi bukti
						pekerjaan, dan berikan feedback konstruktif.
					</p>
				</div>

				{/* Class Filter Dropdown */}
				<div className="flex items-center gap-2 shrink-0 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
					<Filter size={14} className="text-slate-400" />
					<select
						value={selectedClassId}
						onChange={(e) =>
							updateFilters({
								classId: e.target.value || undefined,
								page: 1,
							})
						}
						className="text-xs font-medium text-slate-800 bg-transparent border-0 focus:ring-0 cursor-pointer pr-4"
					>
						<option value="">Semua Kelas</option>
						{classesList?.map((cls) => (
							<option key={cls.id} value={cls.id}>
								{cls.name} ({cls.studentCount || 0} Mahasiswa)
							</option>
						))}
					</select>
				</div>
			</div>

			{/* 2. Sprints Feed Stream */}
			<div className="space-y-4">
				{isLoading ? (
					<div className="space-y-4">
						<div className="h-36 bg-white border border-slate-200 rounded-xl animate-pulse" />
						<div className="h-36 bg-white border border-slate-200 rounded-xl animate-pulse" />
					</div>
				) : sprints && sprints.length > 0 ? (
					<>
						{sprints.map((sprint) => (
							<PeerFeedbackCard key={sprint.id} sprint={sprint} />
						))}

						{pagination && pagination.totalPages > 1 && (
							<Pagination
								currentPage={currentPage}
								totalPages={pagination.totalPages}
								onPageChange={(page) => updateFilters({ page })}
								pageSize={pageSize}
								totalItems={pagination.total}
								onPageSizeChange={(limit) => updateFilters({ limit, page: 1 })}
								pageSizeOptions={[5, 10, 20]}
							/>
						)}
					</>
				) : (
					<EmptyState
						icon={MessageSquare}
						title={`Belum ada aktivitas di ${activeClassName}`}
						description="Aktivitas sprint dan refleksi belajar teman sekelas Anda akan muncul secara live di feed ini."
					/>
				)}
			</div>
		</div>
	);
}
