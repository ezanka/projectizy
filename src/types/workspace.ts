

export type WorkspaceType = "personal" | "education" | "company" | "other";
export type WorkspacePlan = "free" | "pro";

export type Workspace = {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    type: WorkspaceType;
    plan: WorkspacePlan;
    _count: {
        members: number;
        projects: number;
    };
}