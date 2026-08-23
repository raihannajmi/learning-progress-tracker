import { useRouterState } from "@tanstack/react-router";
import { Menu, Timer } from "lucide-react";
import type React from "react";
import { useAuthStore } from "../../stores/authStore.js";

interface Props {
	isCollapsed?: boolean;
	setIsMobileOpen: (open: boolean) => void;
	onOpenSprintModal?: () => void;
}

export const AppHeader: React.FC<Props> = ({
	setIsMobileOpen,
	onOpenSprintModal,
}) => {
	const { user, isAuthenticated } = useAuthStore();
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;

	if (!isAuthenticated || !user) {
		return null;
	}

	const getPageInfo = (path: string) => {
		switch (path) {
			case "/dashboard":
				return {
					title: "Dashboard",
					category: "Mahasiswa",
				};
			case "/roadmap":
				return {
					title: "Roadmap & Checklist",
					category: "Kurikulum",
				};
			case "/sprints":
				return {
					title: "Sprint Belajar",
					category: "Aktivitas",
				};
			case "/class":
				return {
					title: "Feed Kelas",
					category: "Komunitas",
				};
			case "/admin":
				return {
					title: "Monitoring Dosen & TA",
					category: "Asisten Dosen",
				};
			case "/admin-students":
				return {
					title: "Kelola Mahasiswa",
					category: "Administrasi",
				};
			case "/admin-roadmap":
				return {
					title: "Kelola Roadmap & Silabus",
					category: "Kurikulum",
				};
			default:
				return {
					title: "LearningTracker",
					category: "Portal",
				};
		}
	};

	const pageInfo = getPageInfo(currentPath);

	return (
		<header className="sticky top-0 z-30 h-14 bg-white/90 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between transition-all">
			{/* Left: Mobile Trigger & Breadcrumb */}
			<div className="flex items-center gap-3 min-w-0">
				<button
					type="button"
					onClick={() => setIsMobileOpen(true)}
					className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
					title="Buka Menu"
				>
					<Menu size={18} />
				</button>

				<div className="flex items-center gap-2 min-w-0 text-xs">
					<span className="text-slate-400 font-medium">
						{pageInfo.category}
					</span>
					<span className="text-slate-300">/</span>
					<h1 className="text-xs font-semibold text-slate-900 truncate">
						{pageInfo.title}
					</h1>
				</div>
			</div>

			{/* Right: Quick Action & User Context */}
			<div className="flex items-center gap-3 shrink-0">
				{onOpenSprintModal && user.role === "STUDENT" && (
					<button
						type="button"
						onClick={onOpenSprintModal}
						className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
					>
						<Timer size={14} />
						<span>Catat 25-Min Sprint</span>
					</button>
				)}

				<div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
					<div className="text-right">
						<p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[150px]">
							{user.name}
						</p>
						<p className="text-[11px] text-slate-500 font-mono">
							{user.className ||
								(user.role === "ADMIN" ? "Dosen / TA" : "Mahasiswa")}
						</p>
					</div>
				</div>
			</div>
		</header>
	);
};
