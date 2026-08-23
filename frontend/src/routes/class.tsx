import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { HelpCircle, MessageSquare } from "lucide-react";
import React from "react";
import { EmptyState } from "../components/common/EmptyState.js";
import { Pagination } from "../components/common/Pagination.js";
import { PeerFeedbackCard } from "../components/common/PeerFeedbackCard.js";
import { SelectDropdown } from "../components/common/SelectDropdown.js";
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
	needsFeedback?: string;
}

export const Route = createFileRoute("/class")({
	validateSearch: (search: Record<string, unknown>): ClassSearchParams => {
		return {
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 10,
			classId: (search.classId as string) || undefined,
			needsFeedback: (search.needsFeedback as string) || undefined,
		};
	},
	component: ClassFeedPage,
});

function ClassFeedPage() {
	const navigate = useNavigate();
	const searchParams = useSearch({ from: "/class" });
	const { isAuthenticated } = useAuthStore();

	const currentPage = searchParams.page || 1;
	const pageSize = searchParams.limit || 10;
	const selectedClassId = searchParams.classId || "";
	const needsFeedbackFilter = searchParams.needsFeedback === "true";

	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		}
	}, [isAuthenticated, navigate]);

	const updateFilters = (updates: Partial<ClassSearchParams>) => {
		navigate({
			to: "/class",
			search: {
				...searchParams,
				...updates,
			},
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

	// Fetch Sprints for class feed (Server-Side Paginated)
	const { data: sprintResponse, isLoading } = useQuery<
		PaginatedResponse<LearningSprint>
	>({
		queryKey: [
			"classSprints",
			{
				classId: selectedClassId,
				needsFeedback: needsFeedbackFilter,
				page: currentPage,
				limit: pageSize,
			},
		],
		queryFn: async () => {
			const params = new URLSearchParams();
			params.set("page", String(currentPage));
			params.set("limit", String(pageSize));
			if (selectedClassId) params.set("classId", selectedClassId);
			if (needsFeedbackFilter) params.set("needsFeedback", "true");

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
		<div className="max-w-2xl mx-auto w-full space-y-6">
			{/* 1. Header & Context */}
			<div className="space-y-1">
				<h1 className="text-xl font-bold tracking-tight text-slate-900">
					Feed & Diskusi Belajar Kelas
				</h1>
				<p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
					Eksplorasi apa yang sedang dipelajari teman sekelas, pelajari kendala
					bersama, dan berikan evaluasi maupun saran konstruktif.
				</p>
			</div>

			{/* 2. Filter Bar */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-1 border-b border-slate-200/80">
				{/* Status Filter Tabs */}
				<div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
					<button
						type="button"
						onClick={() => updateFilters({ needsFeedback: undefined, page: 1 })}
						className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
							!needsFeedbackFilter
								? "bg-slate-900 text-white shadow-xs"
								: "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
						}`}
					>
						Semua Postingan
					</button>

					<button
						type="button"
						onClick={() => updateFilters({ needsFeedback: "true", page: 1 })}
						className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
							needsFeedbackFilter
								? "bg-amber-600 text-white shadow-xs"
								: "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
						}`}
					>
						<HelpCircle size={13} />
						<span>Minta Asistensi Dosen</span>
					</button>
				</div>

				{/* Class Selector Dropdown */}
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
								badge: `${cls.studentCount || 0} mhs`,
							})) || []),
						]}
					/>
				</div>
			</div>

			{/* 3. Sprints Post Feed Stream */}
			<div className="space-y-4 pt-1">
				{isLoading ? (
					<div className="space-y-4 animate-pulse">
						<div className="h-40 bg-slate-100 rounded-xl" />
						<div className="h-40 bg-slate-100 rounded-xl" />
					</div>
				) : sprints && sprints.length > 0 ? (
					<>
						{sprints.map((sprint) => (
							<PeerFeedbackCard key={sprint.id} sprint={sprint} />
						))}

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
				) : (
					<EmptyState
						icon={MessageSquare}
						title={
							needsFeedbackFilter
								? "Tidak ada pertanyaan asistensi yang menunggu"
								: `Belum ada aktivitas di ${activeClassName}`
						}
						description={
							needsFeedbackFilter
								? "Semua mahasiswa telah mendapatkan respon, atau belum ada yang meminta asistensi khusus."
								: "Aktivitas sesi fokus dan refleksi belajar teman sekelas Anda akan muncul secara live di feed ini."
						}
					/>
				)}
			</div>
		</div>
	);
}
