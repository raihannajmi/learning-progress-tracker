import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import type React from "react";
import { Navbar } from "../components/layout/Navbar.js";
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
	"1234567890-placeholder.apps.googleusercontent.com";

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
				title: "Learning Progress Tracker — Web Development",
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
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap",
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="id">
			<head>
				<HeadContent />
			</head>
			<body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
				<QueryClientProvider client={queryClient}>
					<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
						<div className="min-h-screen flex flex-col">
							<Navbar />
							<main className="flex-1">{children}</main>
						</div>
					</GoogleOAuthProvider>
				</QueryClientProvider>
				<Scripts />
			</body>
		</html>
	);
}
