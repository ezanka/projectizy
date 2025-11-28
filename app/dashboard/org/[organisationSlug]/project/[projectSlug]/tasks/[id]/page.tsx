
import DetailsTaskForm from "./task-form";
import { getUser } from "@/src/lib/auth-server";

type Params = { organisationSlug: string; projectSlug: string; id: string };

export default async function TaskDetailsPage({ params }: { params: Promise<Params> }) {
    const { organisationSlug, projectSlug, id } = await params;
    const user = await getUser();

    return (
        <div>
            <DetailsTaskForm organisationSlug={organisationSlug} projectSlug={projectSlug} id={id} currentUserId={user?.id} />
        </div>
    );
}