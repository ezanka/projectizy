import { getUser } from "@/src/lib/auth-server";
import { redirect } from "next/navigation";
import { OrgSidebar } from "@/src/components/layout/global/sidebar/org-sidebar";
import { cookies } from "next/headers"

export default async function OrgLayout({
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

                <main className="flex flex-1 flex-col max-w-6xl mx-auto w-full p-8">
                    <OrgSidebar />
                    <div className="ml-10">
                        {children}
                    </div>
                </main>

    )
}