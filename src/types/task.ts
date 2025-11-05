export enum TaskStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    REVIEW = "REVIEW",
    BLOCKED = "BLOCKED",
    DONE = "DONE",
    CANCELED = "CANCELED",
}

export enum TaskPriority {
    NONE = "NONE",
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT",
}

export enum TaskType {
    TASK = "TASK",
    BUG = "BUG",
    FEATURE = "FEATURE",
    CHORE = "CHORE",
}

export interface Task {
    id: string;

    projectId: string;

    slug: string;
    title: string;
    description?: string | null;

    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;

    startAt?: Date | null;
    dueAt?: Date | null;
    completedAt?: Date | null;
    archivedAt?: Date | null;

    assignedTo?: string | null;
    user?: {
        id: string;
        name?: string | null;
        email?: string | null;
    } | null;

    deadline?: Date | null;

    createdAt: Date;
    createdById?: string | null;
    createdBy?: {
        id: string;
        name?: string | null;
        email?: string | null;
    } | null;

    updatedAt: Date;
    updatedById?: string | null;
    updatedBy?: {
        id: string;
        name?: string | null;
        email?: string | null;
    } | null;
}
