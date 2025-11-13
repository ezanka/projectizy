import { getUser } from "@/src/lib/auth-server";
import { redirect } from "next/navigation";
import Header from "@/src/components/layout/global/header";
import { SidebarProvider } from "@/src/components/ui/shadcn/sidebar";
import { cookies } from "next/headers"

export default async function LogedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("sidebar_state")?.value 
    const defaultOpen = cookie ? cookie === "true" : false

    const user = await getUser();

    if (!user) {
        redirect('/');
    } 

    return (
        <SidebarProvider defaultOpen={defaultOpen}>              
            <div className="flex min-h-screen w-full flex-col bg-sidebar text-foreground mt-12">
                <Header />
                {children}
            </div>
        </SidebarProvider>
    )
}