import { Link, useRouterState } from "@tanstack/react-router";
import {
	ChevronLeft,
	ChevronRight,
	ClipboardCheck,
	Code2,
	Compass,
	Layers,
	LogOut,
	Map as MapIcon,
	ShieldCheck,
	Timer,
	UserCheck,
	Users,
} from "lucide-react";
import type React from "react";
import { useAuthStore } from "../../stores/authStore.js";

interface Props {
	isCollapsed: boolean;
	setIsCollapsed: (collapsed: boolean) => void;
	isMobileOpen: boolean;
	setIsMobileOpen: (open: boolean) => void;
}

export const AppSidebar: React.FC<Props> = ({
	isCollapsed,
	setIsCollapsed,
	isMobileOpen,
	setIsMobileOpen,
}) => {
	const { user, isAuthenticated, logout } = useAuthStore();
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;

	if (!isAuthenticated || !user) {
		return null;
	}

	const isAdmin = user.role === "ADMIN";

	const studentLinks = [
		{
			to: "/dashboard",
			label: "Dashboard",
			icon: Compass,
		},
		{
			to: "/roadmap",
			label: "Roadmap & Checklist",
			icon: MapIcon,
		},
		{
			to: "/sprints",
			label: "Sprint Belajar",
			icon: Timer,
		},
		{
			to: "/class",
			label: "Feed Kelas",
			icon: Users,
		},
	];

	const adminLinks = [
		{
			to: "/admin",
			label: "Monitoring Kelas",
			icon: ShieldCheck,
		},
		{
			to: "/admin-review",
			label: "Review & Asistensi",
			icon: ClipboardCheck,
		},
		{
			to: "/admin-students",
			label: "Kelola Mahasiswa",
			icon: UserCheck,
		},
		{
			to: "/admin-roadmap",
			label: "Kelola Roadmap",
			icon: Layers,
		},
	];

	const navLinkClass = (path: string) => {
		const isActive = currentPath === path;
		return `group flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
			isActive
				? "bg-blue-50 text-blue-700 font-semibold"
				: "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
		}`;
	};

	return (
		<>
			{/* Mobile Backdrop Overlay */}
			{isMobileOpen && (
				<button
					type="button"
					aria-label="Tutup menu navigasi"
					onClick={() => setIsMobileOpen(false)}
					className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden transition-opacity border-0 w-full h-full cursor-pointer"
				/>
			)}

			{/* Sidebar Container */}
			<aside
				className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-200 ease-in-out ${
					isMobileOpen
						? "translate-x-0 w-64"
						: "-translate-x-full lg:translate-x-0"
				} ${isCollapsed ? "lg:w-18" : "lg:w-60"}`}
			>
				{/* Brand Header */}
				<div className="h-14 flex items-center justify-between px-4 border-b border-slate-200">
					<Link
						to={isAdmin ? "/admin" : "/dashboard"}
						onClick={() => setIsMobileOpen(false)}
						className="flex items-center gap-2.5 overflow-hidden"
					>
						<div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
							<Code2 size={18} />
						</div>
						{!isCollapsed && (
							<div className="flex flex-col min-w-0">
								<span className="text-xs font-semibold text-slate-900 tracking-tight truncate">
									LearningTracker
								</span>
								<span className="text-[10px] text-slate-400 font-normal">
									Web Development
								</span>
							</div>
						)}
					</Link>

					{/* Desktop Collapse / Expand Button */}
					<button
						type="button"
						onClick={() => setIsCollapsed(!isCollapsed)}
						className="hidden lg:flex p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
						title={isCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
					>
						{isCollapsed ? (
							<ChevronRight size={15} />
						) : (
							<ChevronLeft size={15} />
						)}
					</button>
				</div>

				{/* Semester Context Pill */}
				{!isCollapsed && (
					<div className="px-3 pt-3 pb-1">
						<div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
							<span className="text-[11px] text-slate-500">Semester</span>
							<span className="text-[11px] font-mono font-medium text-slate-800">
								2026/2027 Ganjil
							</span>
						</div>
					</div>
				)}

				{/* Navigation Sections */}
				<div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
					{/* Student Navigation (Students Only) */}
					{!isAdmin && (
						<div>
							{!isCollapsed && (
								<div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
									Navigasi Mahasiswa
								</div>
							)}
							<nav className="space-y-0.5">
								{studentLinks.map((link) => {
									const Icon = link.icon;
									return (
										<Link
											key={link.to}
											to={link.to}
											onClick={() => setIsMobileOpen(false)}
											className={navLinkClass(link.to)}
											title={isCollapsed ? link.label : undefined}
										>
											<Icon size={16} className="shrink-0" />
											{!isCollapsed && (
												<span className="truncate">{link.label}</span>
											)}
										</Link>
									);
								})}
							</nav>
						</div>
					)}

					{/* Admin Zone (Dosen / TA only) */}
					{isAdmin && (
						<div>
							{!isCollapsed && (
								<div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
									Area Dosen & TA
								</div>
							)}
							<nav className="space-y-0.5">
								{adminLinks.map((link) => {
									const Icon = link.icon;
									return (
										<Link
											key={link.to}
											to={link.to}
											onClick={() => setIsMobileOpen(false)}
											className={navLinkClass(link.to)}
											title={isCollapsed ? link.label : undefined}
										>
											<Icon size={16} className="shrink-0" />
											{!isCollapsed && (
												<span className="truncate">{link.label}</span>
											)}
										</Link>
									);
								})}
							</nav>
						</div>
					)}
				</div>

				{/* Sidebar Footer — User Capsule */}
				<div className="p-3 border-t border-slate-200 bg-white">
					<div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200">
						<div className="flex items-center gap-2 min-w-0">
							<div className="w-7 h-7 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs shrink-0">
								{user.avatarUrl ? (
									<img
										src={user.avatarUrl}
										alt={user.name}
										className="w-full h-full object-cover rounded-md"
									/>
								) : (
									user.name.charAt(0).toUpperCase()
								)}
							</div>
							{!isCollapsed && (
								<div className="flex flex-col min-w-0">
									<span className="text-xs font-semibold text-slate-900 truncate">
										{user.name}
									</span>
									<span className="text-[10px] text-slate-500 font-mono leading-none">
										{isAdmin ? "DOSEN/TA" : "MAHASISWA"}
									</span>
								</div>
							)}
						</div>

						<button
							type="button"
							onClick={logout}
							className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
							title="Keluar"
						>
							<LogOut size={14} />
						</button>
					</div>
				</div>
			</aside>
		</>
	);
};
