import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createRootRoute,
	HeadContent,
	Link,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { ActiveSessionBanner } from "../components/common/ActiveSessionBanner.js";
import { SprintModal } from "../components/common/SprintModal.js";
import { AppHeader } from "../components/layout/AppHeader.js";
import { AppSidebar } from "../components/layout/AppSidebar.js";
import { useAuthStore } from "../stores/authStore.js";
import { useTimerStore } from "../stores/timerStore.js";
import appCss from "../styles.css?url";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 30, // 30 seconds
			retry: 1,
		},
	},
});

const GOOGLE_CLIENT_ID =
	import.meta.env.VITE_GOOGLE_CLIENT_ID ||
	"621062881008-r1aumh0h4be7aj5k1cnns58as3goab94.apps.googleusercontent.com";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "LearningTracker — Web Development",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
			},
		],
	}),
	notFoundComponent: NotFoundComponent,
	shellComponent: RootDocument,
});

function NotFoundComponent() {
	return (
		<div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
			<div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mb-3 text-lg font-semibold font-mono">
				404
			</div>
			<h2 className="text-base font-semibold text-slate-900 mb-1">
				Halaman Tidak Ditemukan
			</h2>
			<p className="text-xs text-slate-500 max-w-sm mb-5">
				Halaman yang Anda tuju tidak tersedia atau tautan URL telah berpindah.
			</p>
			<Link
				to="/"
				className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
			>
				Kembali ke Halaman Utama
			</Link>
		</div>
	);
}

function LayoutContainer({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, user } = useAuthStore();
	const {
		isReflectionModalOpen,
		selectedTopicId,
		reflectionDurationMinutes,
		closeReflectionModal,
	} = useTimerStore();

	const routerState = useRouterState();
	const isLoginPage = routerState.location.pathname === "/";
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const [isManualModalOpen, setIsManualModalOpen] = useState(false);

	if (!isAuthenticated || !user || isLoginPage) {
		return <main className="min-h-screen bg-[#F8FAFC]">{children}</main>;
	}

	const isModalOpen = isManualModalOpen || isReflectionModalOpen;

	const handleCloseModal = () => {
		setIsManualModalOpen(false);
		closeReflectionModal();
	};

	return (
		<div className="min-h-screen bg-[#F8FAFC] flex">
			<AppSidebar
				isCollapsed={isCollapsed}
				setIsCollapsed={setIsCollapsed}
				isMobileOpen={isMobileOpen}
				setIsMobileOpen={setIsMobileOpen}
			/>
			<div
				className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${
					isCollapsed ? "lg:pl-18" : "lg:pl-60"
				}`}
			>
				{user.role === "STUDENT" && <ActiveSessionBanner />}
				<AppHeader
					isCollapsed={isCollapsed}
					setIsMobileOpen={setIsMobileOpen}
				/>
				<main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
					{children}
				</main>
			</div>

			<SprintModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				defaultTopicId={selectedTopicId || undefined}
				defaultDurationMinutes={reflectionDurationMinutes}
			/>
		</div>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="id">
			<head>
				<HeadContent />
			</head>
			<body className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
				<QueryClientProvider client={queryClient}>
					<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
						<LayoutContainer>{children}</LayoutContainer>
					</GoogleOAuthProvider>
				</QueryClientProvider>
				<Scripts />
			</body>
		</html>
	);
}
