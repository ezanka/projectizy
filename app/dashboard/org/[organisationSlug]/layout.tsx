import { getUser } from "@/src/lib/auth-server";
import { redirect } from "next/navigation";
import { OrgSidebar } from "@/src/components/layout/global/sidebar/org-sidebar";
import { prisma } from "@/src/lib/prisma";

type Params = { organisationSlug: string };

export default async function OrgLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Params;
}>) {

    const user = await getUser();
    const { organisationSlug } = await params;

    if (!user) {
        redirect('/');
    }

    const membership = await prisma.member.findFirst({
        where: {
            userId: user?.id,
            organization: {
                slug: organisationSlug,
            },
        },
    });

    if (!membership) {
        redirect('/dashboard/organizations');
    }

    return (

        <main className="flex flex-1 flex-col max-w-6xl mx-auto w-full p-8">
            <OrgSidebar />
            <div className="ml-10">
                {children}
            </div>
        </main>

    )
}