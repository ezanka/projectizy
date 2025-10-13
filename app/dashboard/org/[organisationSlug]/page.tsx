
import { ProjectTable } from "@/src/components/ui/org/project/table"

export default async function OrganizationProjectPage({
    params,
}: {
    params: { organisationSlug: string }
}) {
    const { organisationSlug } = await params

    return (
        <>
            <div>Organization Project Page</div>
            <ProjectTable organizationSlug={organisationSlug} />
        </>
    );
}