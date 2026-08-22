import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "../types/index.js";

interface AuthState {
	token: string | null;
	user: User | null;
	isAuthenticated: boolean;
	setAuth: (token: string, user: User) => void;
	updateUser: (partialUser: Partial<User>) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			token: null,
			user: null,
			isAuthenticated: false,
			setAuth: (token, user) =>
				set({
					token,
					user,
					isAuthenticated: true,
				}),
			updateUser: (partialUser) =>
				set((state) => ({
					user: state.user ? { ...state.user, ...partialUser } : null,
				})),
			logout: () =>
				set({
					token: null,
					user: null,
					isAuthenticated: false,
				}),
		}),
		{
			name: "lpt-auth-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
