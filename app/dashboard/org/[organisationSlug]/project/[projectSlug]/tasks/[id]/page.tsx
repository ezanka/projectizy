
import DetailsTaskForm from "./task-form";

type Params = { organisationSlug: string; projectSlug: string; id: string };

export default async function TaskDetailsPage({ params }: { params: Promise<Params> }) {
    const { organisationSlug, projectSlug, id } = await params;

    return (
        <div>
            <DetailsTaskForm organisationSlug={organisationSlug} projectSlug={projectSlug} id={id} />
        </div>
    );
}