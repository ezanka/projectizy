import { ProjectSidebar } from "@/src/components/layout/global/sidebar/project-sidebar";

export default async function OrgLayout({ children }: { children: React.ReactNode }) {

    return (
        <main className="flex flex-1 flex-col w-full">
            <ProjectSidebar />
            <div>
                {children}
            </div>
        </main>

    )
}