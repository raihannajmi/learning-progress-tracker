import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Layers, Timer } from "lucide-react";
import React, { useState } from "react";
import { SelfAssessmentButton } from "../components/common/SelfAssessmentButton.js";
import { SprintModal } from "../components/common/SprintModal.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type { ChecklistStatus, RoadmapWeek } from "../types/index.js";

export const Route = createFileRoute("/roadmap")({ component: RoadmapPage });

function RoadmapPage() {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuthStore();
	const queryClient = useQueryClient();

	const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>(
		{},
	);
	const [selectedTopicIdForSprint, setSelectedTopicIdForSprint] = useState<
		string | null
	>(null);

	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/" });
		}
	}, [isAuthenticated, navigate]);

	const { data: weeks, isLoading } = useQuery<RoadmapWeek[]>({
		queryKey: ["roadmap"],
		queryFn: async () => {
			const res: any = await api.get("/roadmap");
			return res.data;
		},
		enabled: isAuthenticated,
	});

	// Auto expand current week initially
	React.useEffect(() => {
		if (weeks && Object.keys(expandedWeeks).length === 0) {
			const initial: Record<string, boolean> = {};
			weeks.forEach((w) => {
				initial[w.id] = w.isCurrent || w.weekNumber === 1;
			});
			setExpandedWeeks(initial);
		}
	}, [weeks, expandedWeeks]);

	// Checklist Mutation
	const updateChecklistMutation = useMutation({
		mutationFn: async ({
			checklistItemId,
			status,
		}: {
			checklistItemId: string;
			status: ChecklistStatus;
		}) => {
			const res: any = await api.post("/checklists/progress", {
				checklistItemId,
				status,
			});
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roadmap"] });
			queryClient.invalidateQueries({ queryKey: ["studentDashboard"] });
		},
	});

	const toggleWeek = (weekId: string) => {
		setExpandedWeeks((prev) => ({ ...prev, [weekId]: !prev[weekId] }));
	};

	if (isLoading) {
		return (
			<div className="max-w-5xl mx-auto px-4 py-10">
				<div className="animate-pulse space-y-4">
					<div className="h-20 bg-slate-200 rounded-2xl" />
					<div className="h-40 bg-slate-200 rounded-2xl" />
					<div className="h-40 bg-slate-200 rounded-2xl" />
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			{/* Header Info */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
						<Layers size={13} />
						<span>Silabus 8 Minggu Web Development</span>
					</div>
					<h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
						Learning Roadmap & Self-Assessment
					</h1>
					<p className="text-xs text-slate-500 mt-1 max-w-xl">
						Tandai pernyataan checklist sesuai kondisi pemahaman Anda saat ini:
						Belum Mulai (○) $\rightarrow$ Sedang Mempelajari (◐) $\rightarrow$
						Berlatih (◐) $\rightarrow$ Bisa Mandiri (✓).
					</p>
				</div>

				<button
					onClick={() => setSelectedTopicIdForSprint("")}
					className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 inline-flex items-center gap-2 transition-all cursor-pointer shrink-0"
				>
					<Timer size={15} />
					<span>Catat Sprint Belajar</span>
				</button>
			</div>

			{/* 4-State Legend */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100/60 p-3 rounded-xl border border-slate-200 text-xs">
				<div className="flex items-center gap-2">
					<span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
					<span className="text-slate-600">
						<strong>○ Belum Mulai:</strong> Belum sentuh
					</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
					<span className="text-sky-800">
						<strong>◐ Mempelajari:</strong> Paham konsep
					</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
					<span className="text-amber-800">
						<strong>◐ Berlatih:</strong> Sedang mencoba
					</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
					<span className="text-emerald-800">
						<strong>✓ Mandiri:</strong> Tanpa tutorial
					</span>
				</div>
			</div>

			{/* Roadmap Weeks List */}
			<div className="space-y-4">
				{weeks?.map((week) => {
					const isExpanded = expandedWeeks[week.id] ?? false;
					const totalItems = week.topics.flatMap((t) => t.checklists).length;
					const completedItems = week.topics
						.flatMap((t) => t.checklists)
						.filter((ci) => ci.status === "CAN_DO_INDEPENDENTLY").length;
					const pct =
						totalItems > 0
							? Math.round((completedItems / totalItems) * 100)
							: 0;

					return (
						<div
							key={week.id}
							className={`rounded-2xl border transition-all overflow-hidden ${
								week.isCurrent
									? "bg-white border-indigo-300 shadow-md ring-2 ring-indigo-100"
									: "bg-white border-slate-200 shadow-xs"
							}`}
						>
							{/* Week Accordion Header */}
							<button
								type="button"
								onClick={() => toggleWeek(week.id)}
								className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
							>
								<div className="flex items-center gap-3.5">
									<div
										className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm font-mono shrink-0 ${
											week.isCurrent
												? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
												: "bg-slate-100 text-slate-700"
										}`}
									>
										W{week.weekNumber}
									</div>
									<div>
										<div className="flex items-center gap-2">
											<h2 className="text-sm sm:text-base font-bold text-slate-900">
												{week.title}
											</h2>
											{week.isCurrent && (
												<span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.2 rounded-full uppercase tracking-wider">
													Fokus Minggu Ini
												</span>
											)}
										</div>
										<p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
											{week.description}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-4 shrink-0">
									<div className="hidden sm:flex flex-col items-end">
										<span className="text-xs font-bold text-slate-800 font-mono">
											{completedItems}/{totalItems} ({pct}%)
										</span>
										<span className="text-[10px] text-slate-400">Mandiri</span>
									</div>
									<div className="p-1 text-slate-400">
										{isExpanded ? (
											<ChevronUp size={18} />
										) : (
											<ChevronDown size={18} />
										)}
									</div>
								</div>
							</button>

							{/* Week Topics & Checklist Body */}
							{isExpanded && (
								<div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-6">
									{week.topics.map((topic) => (
										<div
											key={topic.id}
											className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-3"
										>
											<div className="flex justify-between items-center">
												<div className="flex items-center gap-2">
													<span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm bg-slate-200 text-slate-700 uppercase">
														{topic.category}
													</span>
													<h3 className="text-xs sm:text-sm font-bold text-slate-900">
														{topic.title}
													</h3>
												</div>

												<button
													type="button"
													onClick={() => setSelectedTopicIdForSprint(topic.id)}
													className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
												>
													<Timer size={12} />
													<span>Catat Sprint</span>
												</button>
											</div>

											{/* Checklist items list */}
											<div className="space-y-2 pt-1">
												{topic.checklists.map((item) => (
													<div
														key={item.id}
														className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-slate-100 shadow-xs hover:border-slate-200 transition-all text-xs"
													>
														<span className="text-slate-700 leading-relaxed font-medium">
															{item.statement}
														</span>
														<div className="shrink-0">
															<SelfAssessmentButton
																status={item.status}
																isLoading={
																	updateChecklistMutation.isPending &&
																	updateChecklistMutation.variables
																		?.checklistItemId === item.id
																}
																onChange={(nextStatus) => {
																	updateChecklistMutation.mutate({
																		checklistItemId: item.id,
																		status: nextStatus,
																	});
																}}
															/>
														</div>
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Sprint Modal */}
			{selectedTopicIdForSprint !== null && (
				<SprintModal
					isOpen={true}
					preselectedTopicId={selectedTopicIdForSprint}
					onClose={() => setSelectedTopicIdForSprint(null)}
				/>
			)}
		</div>
	);
}
