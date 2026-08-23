import { useQuery } from "@tanstack/react-query";
import { Code2, ExternalLink, Globe, Layers, Timer, X } from "lucide-react";
import type React from "react";
import { api } from "../../lib/api.js";
import type { StudentDashboardData } from "../../types/index.js";
import { HabitBadge } from "./HabitBadge.js";
import { ProgressBar } from "./ProgressBar.js";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	student: {
		id: string;
		name: string;
		email: string;
		nim?: string | null;
		className?: string | null;
		avatarUrl?: string | null;
		githubRepoUrl?: string | null;
		githubPageUrl?: string | null;
	} | null;
}

export const StudentDetailModal: React.FC<Props> = ({
	isOpen,
	onClose,
	student,
}) => {
	const { data: dashboardData, isLoading } = useQuery<StudentDashboardData>({
		queryKey: ["studentInspector", student?.id],
		queryFn: async () => {
			const res: any = await api.get(
				`/dashboard/student?userId=${student?.id}`,
			);
			return res.data;
		},
		enabled: isOpen && !!student?.id,
	});

	if (!isOpen || !student) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
			<div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-lg border border-slate-200 overflow-hidden">
				{/* Modal Header */}
				<div className="p-6 border-b border-slate-200 flex items-start justify-between bg-white">
					<div className="flex items-center gap-3.5">
						<div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-semibold text-sm text-slate-700 shrink-0">
							{student.avatarUrl ? (
								<img
									src={student.avatarUrl}
									alt={student.name}
									className="w-full h-full object-cover rounded-lg"
								/>
							) : (
								student.name.charAt(0).toUpperCase()
							)}
						</div>
						<div>
							<h2 className="text-base font-semibold text-slate-900 leading-tight">
								{student.name}
							</h2>
							<div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
								<span>{student.nim || "Tanpa NIM"}</span>
								<span>•</span>
								<span className="text-slate-600 font-sans">
									{student.className || "Kelas Belum Ditentukan"}
								</span>
							</div>
							<p className="text-xs text-slate-400 mt-0.5">{student.email}</p>
						</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
					>
						<X size={18} />
					</button>
				</div>

				{/* Links & Quick Stats Ribbon */}
				<div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
					<div className="flex items-center gap-3">
						{student.githubRepoUrl && (
							<a
								href={student.githubRepoUrl}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-blue-600 transition-colors"
							>
								<Code2 size={13} />
								<span>GitHub Repo</span>
								<ExternalLink size={10} className="text-slate-400" />
							</a>
						)}
						{student.githubPageUrl && (
							<a
								href={student.githubPageUrl}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-blue-600 transition-colors"
							>
								<Globe size={13} />
								<span>Live Page</span>
								<ExternalLink size={10} className="text-slate-400" />
							</a>
						)}
					</div>

					{dashboardData?.summary && (
						<div className="flex items-center gap-2 font-mono text-xs">
							<span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
								{dashboardData.summary.overallPercentage}% Mandiri
							</span>
							<span className="text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-full font-medium">
								{dashboardData.summary.habitReachedCount}x Habit ≥25m
							</span>
						</div>
					)}
				</div>

				{/* Modal Scrollable Body */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{isLoading ? (
						<div className="text-center py-12 animate-pulse space-y-3">
							<div className="w-8 h-8 bg-slate-200 rounded-full mx-auto" />
							<p className="text-xs text-slate-400">
								Memuat profil dan progres mahasiswa...
							</p>
						</div>
					) : dashboardData ? (
						<>
							{/* Category Breakdown */}
							<div className="space-y-3">
								<h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
									<Layers size={13} />
									<span>Progres Self-Assessment Per Kategori</span>
								</h3>
								<div className="space-y-2.5">
									{dashboardData.categoryProgress.map((cat) => (
										<div key={cat.category} className="space-y-1">
											<div className="flex justify-between text-xs font-medium text-slate-700">
												<span>{cat.category}</span>
												<span className="font-mono text-slate-500">
													{cat.independent}/{cat.total} Mandiri (
													{cat.percentage}%)
												</span>
											</div>
											<ProgressBar percentage={cat.percentage} />
										</div>
									))}
								</div>
							</div>

							{/* Sprints History */}
							<div className="space-y-3 pt-2">
								<h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
									<Timer size={13} />
									<span>Riwayat Sprint Belajar Mahasiswa</span>
								</h3>

								{dashboardData.recentSprints &&
								dashboardData.recentSprints.length > 0 ? (
									<div className="space-y-2.5">
										{dashboardData.recentSprints.map((sp) => (
											<div
												key={sp.id}
												className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200/80 space-y-1.5 text-xs"
											>
												<div className="flex items-center justify-between gap-2">
													<span className="font-semibold text-slate-800">
														{sp.topic?.title || "Sesi Mandiri"}
													</span>
													<HabitBadge durationMinutes={sp.durationMinutes} />
												</div>

												<p className="text-slate-600 leading-relaxed">
													<strong className="text-slate-700">Pelajari:</strong>{" "}
													{sp.whatLearned}
												</p>
												<p className="text-slate-600 leading-relaxed">
													<strong className="text-slate-700">Praktek:</strong>{" "}
													{sp.whatPracticed}
												</p>

												{sp.confusingParts && (
													<p className="text-amber-800 bg-amber-50 p-2 rounded-md border border-amber-200 leading-relaxed">
														<strong>Kendala:</strong> {sp.confusingParts}
													</p>
												)}
											</div>
										))}
									</div>
								) : (
									<p className="text-xs text-slate-400 italic py-4 text-center border border-dashed border-slate-200 rounded-lg">
										Belum ada riwayat sprint belajar yang dicatat.
									</p>
								)}
							</div>
						</>
					) : (
						<p className="text-xs text-slate-500">
							Data mahasiswa tidak tersedia.
						</p>
					)}
				</div>

				{/* Modal Footer */}
				<div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
					>
						Tutup
					</button>
				</div>
			</div>
		</div>
	);
};
