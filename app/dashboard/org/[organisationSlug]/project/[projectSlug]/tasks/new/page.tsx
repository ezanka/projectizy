
import NewTaskForm from "./task-form";

type Params = { organisationSlug: string; projectSlug: string };

export default async function NewTaskPage({ params }: { params: Promise<Params> }) {
    const { organisationSlug, projectSlug } = await params;

    return (
        <div>
            <NewTaskForm organisationSlug={organisationSlug} projectSlug={projectSlug} />
        </div>
    );
}