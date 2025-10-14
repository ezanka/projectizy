import { OrgTeamTable } from "@/src/components/ui/org/team/table"

export default async function OrganizationTeamsPage({
    params,
}: {
    params: { organisationSlug: string }
}) {
    const { organisationSlug } = await params

    return (
        <div>
            <h1 className="text-xl font-semibold mb-4">Organization Teams</h1>
            <OrgTeamTable organizationSlug={organisationSlug} />
        </div>
    )
}
