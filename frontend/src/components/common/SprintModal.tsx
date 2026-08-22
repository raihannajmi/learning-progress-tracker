import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
	BookOpen,
	Code,
	HelpCircle,
	Link2,
	Pause,
	Play,
	RotateCcw,
	Sparkles,
	Timer,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { api } from "../../lib/api.js";
import type { RoadmapWeek, Topic } from "../../types/index.js";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	preselectedTopicId?: string;
}

const SprintSchema = Yup.object().shape({
	durationMinutes: Yup.number()
		.required("Durasi belajar wajib diisi")
		.min(1, "Durasi minimal 1 menit"),
	whatLearned: Yup.string()
		.required("Apa yang Anda pelajari wajib diisi")
		.min(5, "Minimal 5 karakter"),
	whatPracticed: Yup.string()
		.required("Apa yang Anda praktekkan wajib diisi")
		.min(5, "Minimal 5 karakter"),
	confusingParts: Yup.string().nullable(),
	evidenceUrl: Yup.string()
		.url("Format URL tidak valid")
		.nullable()
		.transform((curr, orig) => (orig === "" ? null : curr)),
	evidenceType: Yup.string().required(),
	topicId: Yup.string().nullable(),
});

export const SprintModal: React.FC<Props> = ({
	isOpen,
	onClose,
	preselectedTopicId,
}) => {
	const queryClient = useQueryClient();

	// Timer state (25-min habit helper)
	const [timerRunning, setTimerRunning] = useState(false);
	const [secondsElapsed, setSecondsElapsed] = useState(0);

	useEffect(() => {
		let interval: any = null;
		if (timerRunning) {
			interval = setInterval(() => {
				setSecondsElapsed((prev) => prev + 1);
			}, 1000);
		} else {
			clearInterval(interval);
		}
		return () => clearInterval(interval);
	}, [timerRunning]);

	// Fetch roadmap topics for dropdown
	const { data: roadmapData } = useQuery<RoadmapWeek[]>({
		queryKey: ["roadmap"],
		queryFn: async () => {
			const res: any = await api.get("/roadmap");
			return res.data;
		},
		enabled: isOpen,
	});

	const allTopics: Topic[] = roadmapData?.flatMap((w) => w.topics) || [];

	const mutation = useMutation({
		mutationFn: async (values: any) => {
			const res: any = await api.post("/sprints", values);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sprints"] });
			queryClient.invalidateQueries({ queryKey: ["studentDashboard"] });
			queryClient.invalidateQueries({ queryKey: ["roadmap"] });
			onClose();
		},
	});

	if (!isOpen) return null;

	const timerMinutes = Math.floor(secondsElapsed / 60);
	const timerSeconds = secondsElapsed % 60;
	const is25MinReached = timerMinutes >= 25;

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 transition-all">
				{/* Header */}
				<div className="flex justify-between items-center pb-4 border-b border-slate-100">
					<div className="flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
							<Timer size={18} />
						</div>
						<div>
							<h3 className="text-base font-bold text-slate-900 leading-tight">
								Catat 25-Min Learning Sprint
							</h3>
							<p className="text-xs text-slate-500">
								Fokus belajar minimal 25 menit untuk membangun kebiasaan
								konsisten.
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
					>
						<X size={18} />
					</button>
				</div>

				{/* Stopwatch Helper */}
				<div className="my-4 p-3.5 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-slate-50 rounded-xl border border-indigo-100 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="text-xl font-mono font-bold text-slate-900 tracking-wider">
							{String(timerMinutes).padStart(2, "0")}:
							{String(timerSeconds).padStart(2, "0")}
						</div>
						<span
							className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
								is25MinReached
									? "bg-emerald-100 text-emerald-800"
									: "bg-indigo-100 text-indigo-700"
							}`}
						>
							{is25MinReached
								? "🎯 Target 25 Menit Tercapai!"
								: `Target: 25 Menit`}
						</span>
					</div>

					<div className="flex items-center gap-1.5">
						<button
							type="button"
							onClick={() => setTimerRunning(!timerRunning)}
							className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
								timerRunning
									? "bg-amber-100 text-amber-800 hover:bg-amber-200"
									: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
							}`}
						>
							{timerRunning ? <Pause size={13} /> : <Play size={13} />}
							<span>{timerRunning ? "Jeda" : "Mulai Timer"}</span>
						</button>
						<button
							type="button"
							onClick={() => {
								setTimerRunning(false);
								setSecondsElapsed(0);
							}}
							className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg cursor-pointer"
							title="Reset Timer"
						>
							<RotateCcw size={14} />
						</button>
					</div>
				</div>

				{/* Formik Form */}
				<Formik
					initialValues={{
						topicId: preselectedTopicId || "",
						durationMinutes: timerMinutes > 0 ? timerMinutes : 25,
						whatLearned: "",
						whatPracticed: "",
						confusingParts: "",
						evidenceUrl: "",
						evidenceType: "GITHUB",
					}}
					validationSchema={SprintSchema}
					enableReinitialize={false}
					onSubmit={(values) => {
						mutation.mutate({
							...values,
							durationMinutes: Number(values.durationMinutes),
							topicId: values.topicId || null,
						});
					}}
				>
					{({ setFieldValue, isSubmitting }) => (
						<Form className="space-y-4">
							{/* Topic & Duration Row */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								<div className="sm:col-span-2">
									<label className="block text-xs font-semibold text-slate-700 mb-1">
										Topik Pembelajaran
									</label>
									<Field
										as="select"
										name="topicId"
										className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500 bg-white"
									>
										<option value="">-- Pilih Topik (Opsional) --</option>
										{allTopics.map((t) => (
											<option key={t.id} value={t.id}>
												[{t.category}] {t.title}
											</option>
										))}
									</Field>
								</div>

								<div>
									<div className="flex justify-between items-center mb-1">
										<label className="block text-xs font-semibold text-slate-700">
											Durasi (Menit)
										</label>
										{secondsElapsed > 60 && (
											<button
												type="button"
												onClick={() =>
													setFieldValue(
														"durationMinutes",
														Math.max(1, timerMinutes),
													)
												}
												className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
											>
												Pakai Timer ({timerMinutes}m)
											</button>
										)}
									</div>
									<Field
										type="number"
										name="durationMinutes"
										min="1"
										className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500 font-mono"
									/>
									<ErrorMessage
										name="durationMinutes"
										component="div"
										className="text-[11px] text-rose-600 mt-0.5"
									/>
								</div>
							</div>

							{/* What I learned */}
							<div>
								<label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
									<BookOpen size={14} className="text-indigo-600" />
									<span>Apa yang Anda pelajari?</span>
									<span className="text-rose-500">*</span>
								</label>
								<Field
									as="textarea"
									name="whatLearned"
									rows={2}
									placeholder="Contoh: Saya memahami perbedaan justify-content dan align-items pada flexbox..."
									className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
								/>
								<ErrorMessage
									name="whatLearned"
									component="div"
									className="text-[11px] text-rose-600 mt-0.5"
								/>
							</div>

							{/* What I practiced */}
							<div>
								<label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
									<Code size={14} className="text-emerald-600" />
									<span>Apa yang Anda praktekkan / coba buat?</span>
									<span className="text-rose-500">*</span>
								</label>
								<Field
									as="textarea"
									name="whatPracticed"
									rows={2}
									placeholder="Contoh: Membuat responsive navbar dan slicing card 3 kolom..."
									className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
								/>
								<ErrorMessage
									name="whatPracticed"
									component="div"
									className="text-[11px] text-rose-600 mt-0.5"
								/>
							</div>

							{/* Confusing parts reflection */}
							<div>
								<label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
									<HelpCircle size={14} className="text-amber-600" />
									<span>Bagian mana yang masih membingungkan? (Refleksi)</span>
								</label>
								<Field
									as="textarea"
									name="confusingParts"
									rows={2}
									placeholder="Contoh: Masih bingung kapan harus pakai CSS Grid vs Flexbox..."
									className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500"
								/>
							</div>

							{/* Evidence URL & Type */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								<div className="sm:col-span-2">
									<label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
										<Link2 size={14} className="text-sky-600" />
										<span>Evidence / Bukti Belajar (URL)</span>
									</label>
									<Field
										type="url"
										name="evidenceUrl"
										placeholder="https://github.com/... atau Loom / Figma"
										className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500 font-mono"
									/>
									<ErrorMessage
										name="evidenceUrl"
										component="div"
										className="text-[11px] text-rose-600 mt-0.5"
									/>
								</div>

								<div>
									<label className="block text-xs font-semibold text-slate-700 mb-1">
										Tipe Bukti
									</label>
									<Field
										as="select"
										name="evidenceType"
										className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-indigo-500 bg-white"
									>
										<option value="GITHUB">GitHub Repo</option>
										<option value="GITHUB_PAGES">GitHub Pages</option>
										<option value="LOOM">Loom Video</option>
										<option value="FIGMA">Figma</option>
										<option value="LIVE_DEMO">Live Website</option>
										<option value="OTHER">Lainnya</option>
									</Field>
								</div>
							</div>

							{/* Footer CTA */}
							<div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
								<button
									type="button"
									onClick={onClose}
									className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={isSubmitting || mutation.isPending}
									className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 inline-flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
								>
									<Sparkles size={14} />
									<span>
										{mutation.isPending
											? "Menyimpan..."
											: "Simpan Catatan Sprint"}
									</span>
								</button>
							</div>
						</Form>
					)}
				</Formik>
			</div>
		</div>
	);
};
