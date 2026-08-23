import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Filter, MessageSquare } from "lucide-react";
import React, { useState } from "react";
import { EmptyState } from "../components/common/EmptyState.js";
import { Pagination } from "../components/common/Pagination.js";
import { PeerFeedbackCard } from "../components/common/PeerFeedbackCard.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type { ClassGroup, LearningSprint } from "../types/index.js";

export const Route = createFileRoute("/class")({ component: ClassFeedPage });

function ClassFeedPage() {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const [selectedClassId, setSelectedClassId] = useState<string>("");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		}
	}, [isAuthenticated, navigate]);

	// Fetch classes for switcher
	const { data: classesList } = useQuery<ClassGroup[]>({
		queryKey: ["classes"],
		queryFn: async () => {
			const res: any = await api.get("/classes");
			return res.data;
		},
		enabled: isAuthenticated,
	});

	// Set default class to student's class
	React.useEffect(() => {
		if (user?.classId && !selectedClassId) {
			setSelectedClassId(user.classId);
		} else if (classesList && classesList.length > 0 && !selectedClassId) {
			setSelectedClassId(classesList[0].id);
		}
	}, [user, classesList, selectedClassId]);

	// Fetch Sprints for class
	const { data: sprints, isLoading } = useQuery<LearningSprint[]>({
		queryKey: ["sprints", { classId: selectedClassId }],
		queryFn: async () => {
			const param = selectedClassId ? `?classId=${selectedClassId}` : "";
			const res: any = await api.get(`/sprints${param}`);
			return res.data;
		},
		enabled: isAuthenticated,
	});

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
						onChange={(e) => setSelectedClassId(e.target.value)}
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
						{sprints
							.slice((currentPage - 1) * pageSize, currentPage * pageSize)
							.map((sprint) => (
								<PeerFeedbackCard key={sprint.id} sprint={sprint} />
							))}

						<Pagination
							currentPage={currentPage}
							totalPages={Math.ceil(sprints.length / pageSize) || 1}
							onPageChange={setCurrentPage}
							pageSize={pageSize}
							totalItems={sprints.length}
							onPageSizeChange={setPageSize}
							pageSizeOptions={[5, 10, 20]}
						/>
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
