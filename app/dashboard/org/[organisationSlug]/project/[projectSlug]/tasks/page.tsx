
import { TasksTable } from "@/src/components/ui/org/project/task";
type Params = { organisationSlug: string, projectSlug: string };

export default async function ProjectTasksPage({ params }: { params: Params }) {  

    const { organisationSlug, projectSlug } = await params;

    return (
        <TasksTable organizationSlug={organisationSlug} projectSlug={projectSlug} />
    )
}