

export type ProjectStatus = "TODO" | "inProgress" | "done";
export type WorkspacePriority = "low" | "medium" | "high";

export type Project = {
    id: string;
    workspaceSlug: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    status: ProjectStatus;
    priority: WorkspacePriority;
}