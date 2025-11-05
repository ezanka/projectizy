
import { TasksTable } from "@/src/components/ui/org/project/task";
import { getUser } from "@/src/lib/auth-server";
import { User } from "@prisma/client";
type Params = { organisationSlug: string, projectSlug: string };

export default async function ProjectTasksPage({ params }: { params: Params }) {  

    const { organisationSlug, projectSlug } = await params;
    const user = await getUser();

    type FullUser = {
        name: string;
        id: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
    };

    const safeUser: FullUser | null = user
        ? {
            name: user.name,
            id: user.id,
            email: user.email,
            emailVerified: (user as User).emailVerified ?? false,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: (user as User).updatedAt ?? user.createdAt,
        }
        : null;

    return (
        <TasksTable organizationSlug={organisationSlug} projectSlug={projectSlug} user={safeUser} />
    )
}