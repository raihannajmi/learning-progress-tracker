import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sound } from "../lib/sound.js";

export type SessionStatus = "IDLE" | "RUNNING" | "PAUSED" | "COMPLETED";

interface TimerStoreState {
	status: SessionStatus;
	targetSeconds: number; // default 25 * 60
	elapsedSeconds: number; // total active elapsed focus seconds
	selectedTopicId: string | null;
	selectedTopicTitle: string | null;
	startedAt: number | null; // epoch timestamp
	isReflectionModalOpen: boolean;
	reflectionDurationMinutes: number;
	isSoundEnabled: boolean;

	// Actions
	startSession: (
		topicId?: string | null,
		topicTitle?: string | null,
		durationMinutes?: number,
	) => void;
	pauseSession: () => void;
	resumeSession: () => void;
	tick: () => void;
	finishEarly: () => void;
	completeSession: () => void;
	abandonSession: () => void;
	openReflectionModal: (
		topicId?: string | null,
		durationMinutes?: number,
	) => void;
	closeReflectionModal: () => void;
	toggleSound: () => void;
	resetSession: () => void;
}

export const useTimerStore = create<TimerStoreState>()(
	persist(
		(set, get) => ({
			status: "IDLE",
			targetSeconds: 25 * 60,
			elapsedSeconds: 0,
			selectedTopicId: null,
			selectedTopicTitle: null,
			startedAt: null,
			isReflectionModalOpen: false,
			reflectionDurationMinutes: 25,
			isSoundEnabled: true,

			startSession: (
				topicId = null,
				topicTitle = null,
				durationMinutes = 25,
			) => {
				const targetSec = durationMinutes * 60;
				set({
					status: "RUNNING",
					targetSeconds: targetSec,
					elapsedSeconds: 0,
					selectedTopicId: topicId,
					selectedTopicTitle: topicTitle,
					startedAt: Date.now(),
					isReflectionModalOpen: false,
					reflectionDurationMinutes: durationMinutes,
				});

				// Trigger first tick sound on start if enabled
				if (get().isSoundEnabled) {
					sound.playClockTick(true);
				}
			},

			pauseSession: () => {
				const { status } = get();
				if (status === "RUNNING") {
					set({ status: "PAUSED" });
				}
			},

			resumeSession: () => {
				const { status } = get();
				if (status === "PAUSED") {
					set({ status: "RUNNING" });
					if (get().isSoundEnabled) {
						sound.playClockTick(true);
					}
				}
			},

			tick: () => {
				const { status, elapsedSeconds, targetSeconds, isSoundEnabled } = get();
				if (status !== "RUNNING") return;

				const nextElapsed = elapsedSeconds + 1;

				// Play procedural clock tick sound
				if (isSoundEnabled) {
					sound.playClockTick(nextElapsed % 2 === 0);
				}

				if (nextElapsed >= targetSeconds) {
					// Reached target focus time!
					get().completeSession();
				} else {
					set({ elapsedSeconds: nextElapsed });
				}
			},

			finishEarly: () => {
				const { elapsedSeconds, targetSeconds, isSoundEnabled } = get();
				// Calculate rounded elapsed minutes (minimum 1 minute if started)
				const recordedMinutes = Math.max(
					1,
					Math.min(
						Math.round(elapsedSeconds / 60),
						Math.round(targetSeconds / 60),
					),
				);

				if (isSoundEnabled) {
					sound.playCompletionChime();
				}

				set({
					status: "COMPLETED",
					isReflectionModalOpen: true,
					reflectionDurationMinutes: recordedMinutes,
				});
			},

			completeSession: () => {
				const { targetSeconds, isSoundEnabled } = get();
				const durationMin = Math.round(targetSeconds / 60);

				if (isSoundEnabled) {
					sound.playCompletionChime();
				}

				set({
					status: "COMPLETED",
					isReflectionModalOpen: true,
					reflectionDurationMinutes: durationMin,
				});
			},

			abandonSession: () => {
				set({
					status: "IDLE",
					targetSeconds: 25 * 60,
					elapsedSeconds: 0,
					selectedTopicId: null,
					selectedTopicTitle: null,
					startedAt: null,
					isReflectionModalOpen: false,
				});
			},

			openReflectionModal: (topicId = null, durationMinutes = 25) => {
				set({
					selectedTopicId: topicId,
					reflectionDurationMinutes: durationMinutes,
					isReflectionModalOpen: true,
				});
			},

			closeReflectionModal: () => {
				set({
					isReflectionModalOpen: false,
					status: "IDLE",
					elapsedSeconds: 0,
					startedAt: null,
				});
			},

			toggleSound: () => {
				const next = !get().isSoundEnabled;
				set({ isSoundEnabled: next });
				if (next) {
					sound.playClockTick(true);
				}
			},

			resetSession: () => {
				set({
					status: "IDLE",
					targetSeconds: 25 * 60,
					elapsedSeconds: 0,
					selectedTopicId: null,
					selectedTopicTitle: null,
					startedAt: null,
					isReflectionModalOpen: false,
				});
			},
		}),
		{
			name: "learning-tracker-timer",
			partialize: (state) => ({
				status: state.status,
				targetSeconds: state.targetSeconds,
				elapsedSeconds: state.elapsedSeconds,
				selectedTopicId: state.selectedTopicId,
				selectedTopicTitle: state.selectedTopicTitle,
				startedAt: state.startedAt,
				reflectionDurationMinutes: state.reflectionDurationMinutes,
				isSoundEnabled: state.isSoundEnabled,
			}),
		},
	),
);
