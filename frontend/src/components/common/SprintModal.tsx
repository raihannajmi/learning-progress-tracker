import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Link2, Timer, X } from "lucide-react";
import type React from "react";
import * as Yup from "yup";
import { api } from "../../lib/api.js";
import type { RoadmapWeek } from "../../types/index.js";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	defaultTopicId?: string;
	defaultDurationMinutes?: number;
}

const SprintSchema = Yup.object().shape({
	topicId: Yup.string()
		.nullable()
		.transform((curr, orig) => (orig === "" ? null : curr)),
	durationMinutes: Yup.number()
		.required("Durasi belajar wajib diisi")
		.min(1, "Durasi minimal 1 menit")
		.max(300, "Durasi maksimal 300 menit"),
	whatLearned: Yup.string()
		.required("Catatan apa yang dipelajari wajib diisi")
		.min(5, "Tulis minimal 5 karakter"),
	whatPracticed: Yup.string()
		.required("Catatan apa yang dipraktekkan wajib diisi")
		.min(5, "Tulis minimal 5 karakter"),
	confusingParts: Yup.string()
		.nullable()
		.transform((curr, orig) => (orig === "" ? null : curr)),
	evidenceUrl: Yup.string()
		.url("Format URL tidak valid (harus dimulai dengan http:// atau https://)")
		.nullable()
		.transform((curr, orig) => (orig === "" ? null : curr)),
	evidenceType: Yup.string()
		.oneOf(["GITHUB", "GITHUB_PAGES", "LOOM", "FIGMA", "LIVE_DEMO", "OTHER"])
		.default("OTHER"),
});

export const SprintModal: React.FC<Props> = ({
	isOpen,
	onClose,
	defaultTopicId,
	defaultDurationMinutes = 25,
}) => {
	const queryClient = useQueryClient();

	const { data: roadmapWeeks } = useQuery<RoadmapWeek[]>({
		queryKey: ["roadmap"],
		queryFn: async () => {
			const res: any = await api.get("/roadmap");
			return res.data;
		},
		enabled: isOpen,
	});

	const allTopics =
		roadmapWeeks?.flatMap((w) =>
			w.topics.map((t) => ({
				...t,
				weekNumber: w.weekNumber,
			})),
		) || [];

	const createSprintMutation = useMutation({
		mutationFn: async (values: any) => {
			const payload = {
				...values,
				topicId: values.topicId || null,
				confusingParts: values.confusingParts || null,
				evidenceUrl: values.evidenceUrl || null,
			};
			const res: any = await api.post("/sprints", payload);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sprints"] });
			queryClient.invalidateQueries({ queryKey: ["studentDashboard"] });
			queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
			onClose();
		},
	});

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
			<div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-lg border border-slate-200 overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between pb-4 border-b border-slate-100">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
							<Timer size={16} />
						</div>
						<div>
							<h2 className="text-base font-semibold text-slate-900">
								Catat Refleksi Sprint Belajar
							</h2>
							<p className="text-xs text-slate-500">
								Dokumentasikan sesi fokus minimal 25 menit Anda
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
					>
						<X size={18} />
					</button>
				</div>

				{/* Form */}
				<Formik
					enableReinitialize={true}
					initialValues={{
						topicId: defaultTopicId || "",
						durationMinutes: defaultDurationMinutes,
						whatLearned: "",
						whatPracticed: "",
						confusingParts: "",
						evidenceUrl: "",
						evidenceType: "GITHUB",
					}}
					validationSchema={SprintSchema}
					onSubmit={async (values) => {
						await createSprintMutation.mutateAsync(values);
					}}
				>
					{({ isSubmitting }) => (
						<Form className="space-y-4 mt-4">
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								<div className="sm:col-span-2">
									<label className="block text-xs font-medium text-slate-700 mb-1">
										Topik Silabus Terkait (Opsional)
									</label>
									<Field
										as="select"
										name="topicId"
										className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
									>
										<option value="">-- Belajar Mandiri Umum --</option>
										{allTopics.map((topic) => (
											<option key={topic.id} value={topic.id}>
												[Mg {topic.weekNumber}] {topic.title} ({topic.category})
											</option>
										))}
									</Field>
								</div>

								<div>
									<label className="block text-xs font-medium text-slate-700 mb-1">
										Durasi (Menit)
									</label>
									<Field
										type="number"
										name="durationMinutes"
										min={1}
										className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
									/>
									<ErrorMessage
										name="durationMinutes"
										component="div"
										className="text-rose-500 text-[11px] mt-1"
									/>
								</div>
							</div>

							<div>
								<label className="block text-xs font-medium text-slate-700 mb-1">
									Apa yang Anda pelajari?{" "}
									<span className="text-rose-500">*</span>
								</label>
								<Field
									as="textarea"
									name="whatLearned"
									rows={2}
									placeholder="Ringkas konsep kunci atau sintaks yang Anda pahami..."
									className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
								/>
								<ErrorMessage
									name="whatLearned"
									component="div"
									className="text-rose-500 text-[11px] mt-0.5"
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-slate-700 mb-1">
									Apa yang Anda buat / praktekkan?{" "}
									<span className="text-rose-500">*</span>
								</label>
								<Field
									as="textarea"
									name="whatPracticed"
									rows={2}
									placeholder="Latihan kode, komponen UI, atau project mini yang Anda kerjakan..."
									className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
								/>
								<ErrorMessage
									name="whatPracticed"
									component="div"
									className="text-rose-500 text-[11px] mt-0.5"
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-slate-700 mb-1">
									Bagian mana yang membingungkan atau error? (Opsional)
								</label>
								<Field
									as="textarea"
									name="confusingParts"
									rows={2}
									placeholder="Tuliskan kendala agar Dosen/TA dapat memberikan asistensi terarah..."
									className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
								/>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								<div className="sm:col-span-2">
									<label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
										<Link2 size={12} className="text-slate-400" />
										<span>URL Bukti / Evidence (Opsional)</span>
									</label>
									<Field
										type="url"
										name="evidenceUrl"
										placeholder="https://github.com/..."
										className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
									/>
									<ErrorMessage
										name="evidenceUrl"
										component="div"
										className="text-rose-500 text-[11px] mt-1"
									/>
								</div>

								<div>
									<label className="block text-xs font-medium text-slate-700 mb-1">
										Tipe Bukti
									</label>
									<Field
										as="select"
										name="evidenceType"
										className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
									>
										<option value="GITHUB">GitHub</option>
										<option value="GITHUB_PAGES">GitHub Pages</option>
										<option value="LOOM">Loom Video</option>
										<option value="FIGMA">Figma</option>
										<option value="LIVE_DEMO">Live Demo</option>
										<option value="OTHER">Lainnya</option>
									</Field>
								</div>
							</div>

							<div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
								<button
									type="button"
									onClick={onClose}
									className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={isSubmitting || createSprintMutation.isPending}
									className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
								>
									{isSubmitting || createSprintMutation.isPending
										? "Menyimpan..."
										: "Simpan Refleksi"}
								</button>
							</div>
						</Form>
					)}
				</Formik>
			</div>
		</div>
	);
};
