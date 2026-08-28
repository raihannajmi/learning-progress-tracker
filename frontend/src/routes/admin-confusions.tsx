import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useEffect } from "react";

interface SearchParams {
	classId?: string;
}

export const Route = createFileRoute("/admin-confusions")({
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			classId: (search.classId as string) || undefined,
		};
	},
	component: AdminConfusionsRedirect,
});

function AdminConfusionsRedirect() {
	const navigate = useNavigate();
	const searchParams = useSearch({ from: "/admin-confusions" });

	useEffect(() => {
		navigate({
			to: "/admin",
			search: {
				classId: searchParams.classId,
				tab: "confusions",
			},
			replace: true,
		});
	}, [navigate, searchParams]);

	return null;
}
