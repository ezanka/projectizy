import { getUser } from "@/src/lib/auth-server";
import { redirect } from "next/navigation";
import { ProjectSidebar } from "@/src/components/layout/global/sidebar/project-sidebar";

export default async function OrgLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const user = await getUser();

    if (!user) {
        redirect('/');
    } 

    return (
        <main className="flex flex-1 flex-col max-w-6xl mx-auto w-full p-8">
            <ProjectSidebar />
            <div className="ml-10">
                {children}
            </div>
        </main>

    )
}