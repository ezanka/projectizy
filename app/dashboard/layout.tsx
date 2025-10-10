import { getUser } from "@/src/lib/auth-server";
import { redirect } from "next/navigation";
import Header from "@/src/components/layout/global/header";
import { OrgSidebar } from "@/src/components/layout/global/sidebar/org-sidebar";
import { SidebarProvider } from "@/src/components/ui/shadcn/sidebar";

export default async function LogedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const user = await getUser();

    if (!user) {
        redirect('/');
    } 

    return (
        <SidebarProvider>              
            <div className="flex min-h-screen w-full flex-col bg-sidebar text-foreground">
                <Header />
                <main className="flex flex-1 flex-col max-w-6xl mx-auto w-full p-8">
                    <OrgSidebar />
                    <div className="ml-10">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}