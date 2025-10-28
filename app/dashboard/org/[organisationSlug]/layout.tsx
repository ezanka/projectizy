import { OrgSidebar } from "@/src/components/layout/global/sidebar/org-sidebar";
import VerifOrg from "@/src/components/wrappers/VerifOrg";

type Params = { organisationSlug: string };

export default async function OrgLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<Params>
}>) {

    const { organisationSlug } = await params;

    return (
        <main className="flex flex-1 flex-col max-w-6xl mx-auto w-full p-8">
            <VerifOrg slug={organisationSlug} /* allowedRoles={["owner","admin"]} */>
                <OrgSidebar />
                <div className="ml-10">{children}</div>
            </VerifOrg>
        </main>
    );
}