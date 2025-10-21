import { getUser } from "@/src/lib/auth-server";
import { redirect } from "next/navigation";
import { ProjectSidebar } from "@/src/components/layout/global/sidebar/project-sidebar";
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
        <main className="flex flex-1 flex-col w-full">
            <ProjectSidebar />
            <div >
                {children}
            </div>
        </main>

    )
}