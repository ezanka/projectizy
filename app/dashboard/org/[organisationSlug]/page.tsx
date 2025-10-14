
import { ProjectTable } from "@/src/components/ui/org/project/table"

export default async function OrganizationProjectPage({
    params,
}: {
    params: { organisationSlug: string }
}) {
    const { organisationSlug } = await params

    return (
        <>
            <h1 className="text-xl font-semibold mb-4">Projets</h1>
            <ProjectTable organizationSlug={organisationSlug} />
        </>
    );
}