import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Filter, MessageSquare, Users } from "lucide-react";
import React, { useState } from "react";
import { PeerFeedbackCard } from "../components/common/PeerFeedbackCard.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type { ClassGroup, LearningSprint } from "../types/index.js";

export const Route = createFileRoute("/class")({ component: ClassFeedPage });

function ClassFeedPage() {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const [selectedClassId, setSelectedClassId] = useState<string>("");

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
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			{/* Header with Class Selector */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 mb-2">
						<Users size={13} />
						<span>Peer Learning & Social Accountability</span>
					</div>
					<h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
						Feed Aktivitas Kelas
					</h1>
					<p className="text-xs text-slate-500 mt-1 max-w-lg">
						Lihat apa yang sedang dipelajari teman sekelas, eksplorasi bukti
						pekerjaan, dan berikan feedback konstruktif.
					</p>
				</div>

				{/* Class Filter Dropdown */}
				<div className="flex items-center gap-2 shrink-0 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
					<Filter size={14} className="text-slate-400 ml-1" />
					<select
						value={selectedClassId}
						onChange={(e) => setSelectedClassId(e.target.value)}
						className="text-xs font-semibold text-slate-800 bg-transparent border-0 focus:ring-0 cursor-pointer pr-4"
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

			{/* Sprints Stream */}
			<div className="space-y-4">
				{isLoading ? (
					<div className="space-y-4 animate-pulse">
						<div className="h-36 bg-slate-200 rounded-xl" />
						<div className="h-36 bg-slate-200 rounded-xl" />
					</div>
				) : sprints && sprints.length > 0 ? (
					sprints.map((sprint) => (
						<PeerFeedbackCard key={sprint.id} sprint={sprint} />
					))
				) : (
					<div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs">
						<MessageSquare size={36} className="mx-auto text-slate-300 mb-2" />
						<h3 className="text-sm font-bold text-slate-800">
							Belum ada aktivitas di {activeClassName}
						</h3>
						<p className="text-xs text-slate-500 mt-1">
							Aktivitas sprint teman sekelas Anda akan muncul di feed ini.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
