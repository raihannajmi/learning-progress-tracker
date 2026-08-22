export type UserRole = "STUDENT" | "ADMIN";

export type ChecklistStatus =
	| "NOT_STARTED"
	| "LEARNING"
	| "PRACTICING"
	| "CAN_DO_INDEPENDENTLY";

export type EvidenceType =
	| "GITHUB"
	| "GITHUB_PAGES"
	| "LOOM"
	| "FIGMA"
	| "LIVE_DEMO"
	| "OTHER";

export interface User {
	id: string;
	name: string;
	email: string;
	nim?: string | null;
	role: UserRole;
	classId?: string | null;
	className?: string | null;
	classAcademicTerm?: string | null;
	githubRepoUrl?: string | null;
	githubPageUrl?: string | null;
	avatarUrl?: string | null;
	isActive?: boolean;
}

export interface ClassGroup {
	id: string;
	name: string;
	academicTerm: string;
	studentCount?: number;
}

export interface ChecklistItem {
	id: string;
	topicId: string;
	statement: string;
	sortOrder: number;
	status: ChecklistStatus;
}

export interface Topic {
	id: string;
	weekId: string;
	title: string;
	category: "HTML" | "CSS" | "JAVASCRIPT" | "BACKEND" | "FULLSTACK";
	sortOrder: number;
	checklists: ChecklistItem[];
}

export interface RoadmapWeek {
	id: string;
	weekNumber: number;
	title: string;
	description?: string | null;
	isCurrent: boolean;
	topics: Topic[];
}

export interface PeerFeedback {
	id: string;
	sprintId: string;
	authorId: string;
	comment: string;
	createdAt: string;
	author: {
		id: string;
		name: string;
		avatarUrl?: string | null;
		role: UserRole;
	};
}

export interface LearningSprint {
	id: string;
	durationMinutes: number;
	whatLearned: string;
	whatPracticed: string;
	confusingParts?: string | null;
	evidenceUrl?: string | null;
	evidenceType: EvidenceType;
	createdAt: string;
	isHabitQualified: boolean;
	user?: {
		id: string;
		name: string;
		email: string;
		nim?: string | null;
		avatarUrl?: string | null;
		className?: string | null;
	};
	topic?: {
		id: string;
		title: string;
		category: string;
	} | null;
	feedbacks?: PeerFeedback[];
	feedbackCount?: number;
}

export interface StudentDashboardData {
	currentWeek: {
		weekNumber: number;
		title: string;
		description: string;
	};
	summary: {
		totalChecklists: number;
		completedChecklists: number;
		overallPercentage: number;
		totalSprints: number;
		totalMinutesLearned: number;
		habitReachedCount: number;
		sprintsThisWeek: number;
	};
	categoryProgress: Array<{
		category: string;
		total: number;
		independent: number;
		practicing: number;
		learning: number;
		percentage: number;
	}>;
	nextAction: {
		suggestedFocus: string;
		minimumTarget: string;
	};
	recentSprints: LearningSprint[];
}

export interface AdminDashboardData {
	totalStudents: number;
	activeStudentsThisWeek: number;
	totalSprints: number;
	totalFeedbackGiven: number;
	commonConfusions: Array<{
		topic: string;
		mentions: number;
	}>;
	studentsNeedingAttention: Array<{
		id: string;
		name: string;
		email: string;
		nim?: string | null;
		className?: string | null;
		avatarUrl?: string | null;
		lastActivity: string | null;
		statusLabel: string;
	}>;
	recentEvidences: Array<{
		id: string;
		studentName: string;
		className: string;
		evidenceUrl: string;
		evidenceType: EvidenceType;
		whatLearned: string;
		createdAt: string;
	}>;
}

// Runtime marker
export const TYPES_READY = true;
