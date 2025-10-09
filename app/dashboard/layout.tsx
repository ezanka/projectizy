import { getUser } from "@/src/lib/auth-server";
import { redirect } from "next/navigation";
import Header from "@/src/components/layout/global/header";

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
        <main className="flex min-h-screen flex-col bg-sidebar text-foreground">
            <Header />
            {children}
        </main>
    )
}