import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useEffect } from "react";

interface SearchParams {
	classId?: string;
}

export const Route = createFileRoute("/admin-attention")({
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			classId: (search.classId as string) || undefined,
		};
	},
	component: AdminAttentionRedirect,
});

function AdminAttentionRedirect() {
	const navigate = useNavigate();
	const searchParams = useSearch({ from: "/admin-attention" });

	useEffect(() => {
		navigate({
			to: "/admin",
			search: {
				classId: searchParams.classId,
				tab: "attention",
			},
			replace: true,
		});
	}, [navigate, searchParams]);

	return null;
}
