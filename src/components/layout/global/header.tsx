import { ThemeToggle } from "../../ui/global/themeToggle";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/shadcn/avatar";
import HeaderPath from "./header-path";
import { getUser } from "@/src/lib/auth-server";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/shadcn/dropdown-menu"
import SignOut from "../../ui/global/signOut";
import { Inbox, Settings } from "lucide-react";
import Link from "next/link";
import Notifications from "./notifications";
import { prisma } from "@/src/lib/prisma";

export default async function Header() {
    const user = await getUser();

    if (!user) {
        return null;
    }

    const notificationCount = await prisma.invitation.count({
        where: {
            email: user.email,
            status: "pending",
            inviterId: { not: user.id },
        },
    });

    return (
        <header className="fixed top-0 left-0 right-0 w-full border-b bg-sidebar z-10">
            <div className="flex h-16 items-center px-4">
                <div className="flex flex-1 items-center justify-between">
                    <HeaderPath />
                </div>
                <div className="flex items-center">
                    <div className="rounded-full border mr-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="relative">
                                    <Inbox className="h-3 w-3 m-2 text-muted-foreground hover:text-foreground cursor-pointer" />
                                    {notificationCount > 0 && (
                                        <div className="absolute bottom-3 right-0">
                                            <div className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center top-0 right-0 -mt-2 -mr-2">
                                                {notificationCount}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="mr-2">
                                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <Notifications />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Avatar>
                                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                                <AvatarFallback>{user?.name ? user.name.charAt(0) : "U"}</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-xs mx-2">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/settings`} title="Paramètres" aria-label="Paramètres" className="flex items-center cursor-pointer">
                                    <Settings />
                                    <span>Paramètres</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Thème</DropdownMenuLabel>
                            <ThemeToggle />
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <SignOut />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>
            </div>
        </header>
    );
}