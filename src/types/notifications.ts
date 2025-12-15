import { MemberRole } from "@prisma/client";

export type Notification = {
    id: string;
    email: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    organization: {
        id: string;
        name: string;
        slug: string;
        createdAt: string;
        updatedAt: string;
    } | null;
    inviterEmail: string | null;
    role: MemberRole;
};