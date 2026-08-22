import { Link, useRouterState } from "@tanstack/react-router";
import {
	CheckCircle2,
	Compass,
	LogOut,
	ShieldCheck,
	Sparkles,
	Timer,
	UserCheck,
	Users,
} from "lucide-react";
import type React from "react";
import { useAuthStore } from "../../stores/authStore.js";

export const Navbar: React.FC = () => {
	const { user, isAuthenticated, logout } = useAuthStore();
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;

	if (!isAuthenticated || !user) {
		return null;
	}

	const isAdmin = user.role === "ADMIN";

	const navLinks = [
		{
			to: "/dashboard",
			label: "Dashboard",
			icon: Compass,
			show: true,
		},
		{
			to: "/roadmap",
			label: "Roadmap & Checklist",
			icon: CheckCircle2,
			show: true,
		},
		{
			to: "/sprints",
			label: "Sprint Belajar",
			icon: Timer,
			show: true,
		},
		{
			to: "/class",
			label: "Class Feed",
			icon: Users,
			show: true,
		},
		{
			to: "/admin",
			label: "TA Monitoring",
			icon: ShieldCheck,
			show: isAdmin,
		},
		{
			to: "/admin-students",
			label: "Kelola Mahasiswa",
			icon: UserCheck,
			show: isAdmin,
		},
	];

	return (
		<header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16 items-center">
					{/* Logo & Brand */}
					<div className="flex items-center gap-3">
						<Link to="/dashboard" className="flex items-center gap-2 group">
							<div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
								<Sparkles size={18} />
							</div>
							<div className="flex flex-col">
								<span className="font-bold text-slate-900 text-sm sm:text-base leading-tight tracking-tight">
									Learning Progress
								</span>
								<span className="text-[11px] font-medium text-slate-500">
									Web Development Tracker
								</span>
							</div>
						</Link>
					</div>

					{/* Nav Items */}
					<nav className="hidden md:flex items-center gap-1">
						{navLinks
							.filter((item) => item.show)
							.map((item) => {
								const Icon = item.icon;
								const isActive = currentPath === item.to;
								return (
									<Link
										key={item.to}
										to={item.to}
										className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
											isActive
												? "bg-indigo-50 text-indigo-700 shadow-xs"
												: "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
										}`}
									>
										<Icon size={15} />
										{item.label}
									</Link>
								);
							})}
					</nav>

					{/* User profile & Logout */}
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
							<img
								src={
									user.avatarUrl ||
									`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`
								}
								alt={user.name}
								className="w-8 h-8 rounded-full ring-2 ring-indigo-100 object-cover"
							/>
							<div className="hidden sm:flex flex-col text-left">
								<span className="text-xs font-bold text-slate-800 leading-none">
									{user.name}
								</span>
								<div className="flex items-center gap-1.5 mt-0.5">
									<span
										className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-sm ${
											user.role === "ADMIN"
												? "bg-purple-100 text-purple-700 font-mono"
												: "bg-emerald-100 text-emerald-700 font-mono"
										}`}
									>
										{user.role === "ADMIN"
											? "Dosen/TA"
											: user.className || "Mahasiswa"}
									</span>
									{user.nim && (
										<span className="text-[10px] text-slate-400 font-mono">
											{user.nim}
										</span>
									)}
								</div>
							</div>
						</div>

						<button
							onClick={logout}
							title="Keluar"
							className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer"
						>
							<LogOut size={16} />
						</button>
					</div>
				</div>
			</div>
		</header>
	);
};
