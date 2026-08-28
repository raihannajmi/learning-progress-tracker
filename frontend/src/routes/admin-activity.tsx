import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useEffect } from "react";

interface SearchParams {
	classId?: string;
}

export const Route = createFileRoute("/admin-activity")({
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			classId: (search.classId as string) || undefined,
		};
	},
	component: AdminActivityRedirect,
});

function AdminActivityRedirect() {
	const navigate = useNavigate();
	const searchParams = useSearch({ from: "/admin-activity" });

	useEffect(() => {
		navigate({
			to: "/admin",
			search: {
				classId: searchParams.classId,
				tab: "activity",
			},
			replace: true,
		});
	}, [navigate, searchParams]);

	return null;
}
