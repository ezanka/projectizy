import OrganizationNameSettings from "@/src/components/ui/org/settings/name";
import { getUser } from "@/src/lib/auth-server";

export default async function OrganizationSettingsPage({ 
    params,
}: {
    params: { organisationSlug: string }
}) {

    const { organisationSlug } = await params

    return (
        <>
            <h1 className="text-xl font-semibold mb-4">Paramètres de l&apos;organisation</h1>
            <div>
                <h1 className="mb-2">Détails</h1>
                <OrganizationNameSettings organisationSlug={organisationSlug} />
            </div>
        </>
    );
}