
import ProjectDashboard from "@/src/components/ui/org/project/dashboard";

type Params = { organisationSlug: string; projectSlug: string };

export default async function ProjectPage({ params }: { params: Promise<Params> }) {

    const { organisationSlug, projectSlug } = await params;

    return (
        <ProjectDashboard organisationSlug={organisationSlug} projectSlug={projectSlug} />
    )
}
