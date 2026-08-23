import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	Filter,
	HelpCircle,
	MessageSquareQuote,
} from "lucide-react";
import React, { useState } from "react";
import { EmptyState } from "../components/common/EmptyState.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type { AdminDashboardData, ClassGroup } from "../types/index.js";

export const Route = createFileRoute("/admin-confusions")({
	component: AdminConfusionsPage,
});

function AdminConfusionsPage() {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const [selectedClassId, setSelectedClassId] = useState<string>("");

	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		} else if (user?.role !== "ADMIN") {
			navigate({ to: "/dashboard" });
		}
	}, [isAuthenticated, user, navigate]);

	// Fetch classes
	const { data: classesList } = useQuery<ClassGroup[]>({
		queryKey: ["classes"],
		queryFn: async () => {
			const res: any = await api.get("/classes");
			return res.data;
		},
	});

	// Fetch Admin Dashboard data for confusions
	const { data, isLoading } = useQuery<AdminDashboardData>({
		queryKey: ["adminDashboard", { classId: selectedClassId }],
		queryFn: async () => {
			const param = selectedClassId ? `?classId=${selectedClassId}` : "";
			const res: any = await api.get(`/dashboard/admin${param}`);
			return res.data;
		},
	});

	if (isLoading) {
		return (
			<div className="max-w-4xl mx-auto w-full space-y-6 animate-pulse py-4">
				<div className="h-16 bg-slate-100 rounded-xl" />
				<div className="h-48 bg-slate-100 rounded-xl" />
				<div className="h-48 bg-slate-100 rounded-xl" />
			</div>
		);
	}

	const confusions = data?.commonConfusions || [];

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
						Analitik Hambatan Belajar (Common Confusions)
					</h1>
					<p className="text-xs text-slate-500 max-w-xl">
						Diagregasi otomatis dari kendala refleksi sprint mahasiswa untuk
						membantu pengajar mengidentifikasi materi yang butuh pendalaman di
						kelas.
					</p>
				</div>

				{/* Class Filter Selector */}
				<div className="flex items-center gap-2 shrink-0 bg-white px-3 py-1.5 rounded-lg border border-slate-200/90 text-xs">
					<Filter size={13} className="text-slate-400" />
					<select
						value={selectedClassId}
						onChange={(e) => setSelectedClassId(e.target.value)}
						className="text-xs font-medium text-slate-800 bg-transparent border-0 focus:ring-0 cursor-pointer pr-4"
					>
						<option value="">Semua Kelas</option>
						{classesList?.map((cls) => (
							<option key={cls.id} value={cls.id}>
								{cls.name}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* 2. Confusions Ranking List */}
			<div className="space-y-4">
				{confusions.length === 0 ? (
					<EmptyState
						icon={HelpCircle}
						title="Belum ada kendala materi yang dilaporkan"
						description="Ketika mahasiswa mengisi bagian kendala/kebingungan saat sprint refleksi, datanya akan teragregasi secara otomatis di halaman ini."
					/>
				) : (
					confusions.map((item, idx) => (
						<div
							key={idx}
							className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-3 text-xs"
						>
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
								<div className="flex items-center gap-2">
									<span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold flex items-center justify-center text-[11px]">
										#{idx + 1}
									</span>
									<h2 className="text-sm font-bold text-slate-900">
										{item.topicTitle || item.topic}
									</h2>
								</div>

								<span className="text-xs font-mono font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
									{item.mentions} mahasiswa terkendala
								</span>
							</div>

							{item.examples && item.examples.length > 0 && (
								<div className="space-y-2 pt-1">
									<p className="text-[11px] font-semibold uppercase font-mono text-slate-400">
										Kutipan Kendala Mahasiswa:
									</p>
									<div className="space-y-1.5 pl-3 border-l-2 border-amber-300 text-slate-700">
										{item.examples.map((ex, i) => (
											<div
												key={i}
												className="flex items-start gap-1.5 text-xs italic"
											>
												<MessageSquareQuote
													size={13}
													className="text-amber-500 shrink-0 mt-0.5"
												/>
												<p>"{ex}"</p>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					))
				)}
			</div>
		</div>
	);
}
