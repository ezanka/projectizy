

export type WorkspaceType = "school" | "personal" | "business" | "free";

export type Workspace = {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    type: WorkspaceType;
}