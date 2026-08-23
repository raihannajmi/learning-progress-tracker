import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Star, Timer } from "lucide-react";
import React, { useState } from "react";
import { ProgressBar } from "../components/common/ProgressBar.js";
import { SelfAssessmentButton } from "../components/common/SelfAssessmentButton.js";
import { SprintModal } from "../components/common/SprintModal.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../stores/authStore.js";
import type { ChecklistProgressStatus, RoadmapWeek } from "../types/index.js";

export const Route = createFileRoute("/roadmap")({ component: RoadmapPage });

function RoadmapPage() {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
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
		} else if (user?.role === "ADMIN") {
			navigate({ to: "/admin-roadmap" });
		}
	}, [isAuthenticated, user, navigate]);

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
			status: ChecklistProgressStatus;
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

	const getCategoryBadge = (cat: string) => {
		switch (cat) {
			case "HTML":
				return "text-orange-700 bg-orange-50 border-orange-200";
			case "CSS":
				return "text-sky-700 bg-sky-50 border-sky-200";
			case "JAVASCRIPT":
				return "text-amber-700 bg-amber-50 border-amber-200";
			case "BACKEND":
				return "text-emerald-700 bg-emerald-50 border-emerald-200";
			case "FULLSTACK":
				return "text-blue-700 bg-blue-50 border-blue-200";
			default:
				return "text-slate-700 bg-slate-100 border-slate-200";
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="h-20 bg-white border border-slate-200 rounded-xl animate-pulse" />
				<div className="h-48 bg-white border border-slate-200 rounded-xl animate-pulse" />
				<div className="h-48 bg-white border border-slate-200 rounded-xl animate-pulse" />
			</div>
		);
	}

	// Calculate total checklists and completed
	const totalItems =
		weeks?.reduce(
			(acc, w) =>
				acc +
				w.topics.reduce((tAcc, t) => tAcc + (t.checklists?.length || 0), 0),
			0,
		) || 0;

	const completedItems =
		weeks?.reduce(
			(acc, w) =>
				acc +
				w.topics.reduce(
					(tAcc, t) =>
						tAcc +
						(t.checklists?.filter((c) => c.status === "CAN_DO_INDEPENDENTLY")
							.length || 0),
					0,
				),
			0,
		) || 0;

	const overallPercent =
		totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

	return (
		<div className="space-y-6">
			{/* 1. Header Information & Overall Progress */}
			<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
							Kurikulum Silabus
						</span>
						<span className="text-slate-300">•</span>
						<span className="text-xs font-mono font-medium text-slate-600">
							8 Minggu Pembelajaran
						</span>
					</div>

					<h2 className="text-lg font-semibold text-slate-900 tracking-tight">
						Roadmap & Self-Assessment Mandiri
					</h2>

					<p className="text-xs text-slate-500 leading-relaxed max-w-xl">
						Tandai butir kemampuan sesuai pemahaman Anda saat ini untuk memantau
						kesiapan kemandirian coding tanpa tutorial.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
					<div className="text-left sm:text-right">
						<div className="flex items-center gap-2">
							<span className="text-xs text-slate-500">Total Penguasaan:</span>
							<span className="text-sm font-semibold font-mono text-slate-900">
								{overallPercent}%
							</span>
						</div>
						<span className="text-[11px] text-slate-400 font-mono">
							{completedItems}/{totalItems} poin mandiri
						</span>
					</div>

					<button
						type="button"
						onClick={() => setSelectedTopicIdForSprint("")}
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
					>
						<Timer size={14} />
						<span>Catat Sprint Belajar</span>
					</button>
				</div>
			</div>

			{/* 2. 4-State Legend Bar */}
			<div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
				<span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">
					Panduan Status:
				</span>
				<div className="flex flex-wrap items-center gap-4 text-xs">
					<div className="flex items-center gap-1.5">
						<span className="w-2 h-2 rounded-full bg-slate-300" />
						<span className="text-slate-600">Belum Mulai (0%)</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span className="w-2 h-2 rounded-full bg-sky-500" />
						<span className="text-slate-600">
							Mempelajari (Paham konsep dasar)
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span className="w-2 h-2 rounded-full bg-amber-500" />
						<span className="text-slate-600">
							Berlatih (Sedang mencoba coding)
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span className="w-2 h-2 rounded-full bg-emerald-500" />
						<span className="text-slate-600 font-medium">
							Mandiri (Bisa tanpa tutorial)
						</span>
					</div>
				</div>
			</div>

			{/* 3. Weeks Accordion List */}
			<div className="space-y-4">
				{weeks?.map((week) => {
					const isExpanded = !!expandedWeeks[week.id];
					const weekChecklists = week.topics.flatMap((t) => t.checklists || []);
					const weekCompleted = weekChecklists.filter(
						(c) => c.status === "CAN_DO_INDEPENDENTLY",
					).length;
					const weekPercent =
						weekChecklists.length > 0
							? Math.round((weekCompleted / weekChecklists.length) * 100)
							: 0;

					return (
						<div
							key={week.id}
							className={`bg-white rounded-xl border transition-all duration-150 overflow-hidden shadow-xs ${
								week.isCurrent
									? "border-blue-300"
									: "border-slate-200 hover:border-slate-300"
							}`}
						>
							{/* Week Accordion Header */}
							<button
								type="button"
								onClick={() => toggleWeek(week.id)}
								className="w-full text-left p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-white hover:bg-slate-50/50 transition-colors border-0"
							>
								<div className="flex items-start sm:items-center gap-3 min-w-0">
									<div className="p-1 rounded-md text-slate-400 group-hover:text-slate-600 mt-0.5 sm:mt-0">
										{isExpanded ? (
											<ChevronUp size={16} />
										) : (
											<ChevronDown size={16} />
										)}
									</div>

									<div>
										<div className="flex items-center gap-2 flex-wrap">
											<span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
												Minggu {week.weekNumber}
											</span>

											{week.isCurrent && (
												<span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.2 rounded-full inline-flex items-center gap-1 font-mono">
													<Star
														size={11}
														className="fill-blue-600 text-blue-600"
													/>
													<span>Minggu Berjalan</span>
												</span>
											)}

											<span className="text-xs text-slate-400">
												{week.topics.length} Topik • {weekChecklists.length}{" "}
												Checklist
											</span>
										</div>

										<h3 className="text-sm font-semibold text-slate-900 mt-1">
											{week.title}
										</h3>
										{week.description && (
											<p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
												{week.description}
											</p>
										)}
									</div>
								</div>

								<div className="flex items-center gap-4 self-end sm:self-center shrink-0">
									<div className="text-right hidden sm:block">
										<span className="text-xs font-mono font-medium text-slate-700">
											{weekPercent}% Selesai
										</span>
										<div className="w-24 mt-1">
											<ProgressBar percentage={weekPercent} height="sm" />
										</div>
									</div>
								</div>
							</button>

							{/* Topics & Checklist Body */}
							{isExpanded && (
								<div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4">
									{week.topics.length === 0 ? (
										<p className="text-xs text-slate-400 italic py-3 text-center">
											Belum ada topik pembelajaran pada minggu ini.
										</p>
									) : (
										week.topics.map((topic) => (
											<div
												key={topic.id}
												className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4 space-y-3"
											>
												{/* Topic Subheader */}
												<div className="flex items-center justify-between gap-3">
													<div className="flex items-center gap-2">
														<span
															className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm border ${getCategoryBadge(
																topic.category,
															)}`}
														>
															{topic.category}
														</span>
														<h4 className="text-xs font-semibold text-slate-900">
															{topic.title}
														</h4>
													</div>

													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															setSelectedTopicIdForSprint(topic.id);
														}}
														className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
													>
														<Timer size={12} />
														<span>Sprint Topik Ini</span>
													</button>
												</div>

												{/* Checklist Statements */}
												<div className="space-y-2 pt-1">
													{topic.checklists && topic.checklists.length > 0 ? (
														topic.checklists.map((item, idx) => (
															<div
																key={item.id}
																className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-md bg-white border border-slate-200/70 text-xs"
															>
																<div className="flex items-start gap-2.5 min-w-0">
																	<span className="font-mono text-slate-400 text-[11px] mt-0.5 shrink-0">
																		#{idx + 1}
																	</span>
																	<p className="text-slate-700 leading-relaxed">
																		{item.statement}
																	</p>
																</div>

																<div className="self-end sm:self-center shrink-0">
																	<SelfAssessmentButton
																		status={
																			item.status as ChecklistProgressStatus
																		}
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
														))
													) : (
														<p className="text-xs text-slate-400 italic py-1">
															Belum ada butir checklist mandiri pada topik ini.
														</p>
													)}
												</div>
											</div>
										))
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>

			<SprintModal
				isOpen={selectedTopicIdForSprint !== null}
				onClose={() => setSelectedTopicIdForSprint(null)}
				defaultTopicId={selectedTopicIdForSprint || undefined}
			/>
		</div>
	);
}
