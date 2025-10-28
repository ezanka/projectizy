import OrganizationNameSettings from "@/src/components/ui/org/settings/name";
import OrganizationDangerZoneSettings from "@/src/components/ui/org/settings/dangerZone";

export default async function OrganizationSettingsPage({
    params,
}: {
    params: { organisationSlug: string }
}) {
    const { organisationSlug } = await params;

    return (
        <>
            <h1 className="text-xl font-semibold mb-4">Paramètres de l&apos;organisation</h1>
            <div>
                <h1 className="mb-2 font-bold text-2xl">Détails</h1>
                <OrganizationNameSettings organisationSlug={organisationSlug} />
                <h1 className="mt-10 mb-2 font-bold text-2xl">Supprimer l&apos;organisation</h1>
                <OrganizationDangerZoneSettings organisationSlug={organisationSlug} />
            </div>
        </>
    );
}