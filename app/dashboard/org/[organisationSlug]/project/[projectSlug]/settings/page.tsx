
import ProjectDeleteSettings from "@/src/components/ui/org/project/settings/delete";
import ProjectNameSettings from "@/src/components/ui/org/project/settings/information";

type Params = { organisationSlug: string, projectSlug: string };

export default async function ProjectSettingsPage({ params }: { params: Params }) {
    const { organisationSlug, projectSlug } = await params;

    return (
        <div className="space-y-4">
            <ProjectNameSettings organisationSlug={organisationSlug} projectSlug={projectSlug} />
            <ProjectDeleteSettings organisationSlug={organisationSlug} projectSlug={projectSlug} />
        </div>
    );
}