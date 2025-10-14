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

export default async function Header() {
    const user = await getUser();

    if (!user) {
        return null;
    }

    return (
        <header className="w-full border-b bg-sidebar z-10">
            <div className="flex h-16 items-center px-4">
                <div className="flex flex-1 items-center justify-between">
                    <HeaderPath />
                </div>
                <div className="flex items-center">
                    <div className="rounded-full border mr-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Inbox className="h-3 w-3 m-2 text-muted-foreground hover:text-foreground cursor-pointer" /></DropdownMenuTrigger>
                            <DropdownMenuContent>
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
                        <DropdownMenuContent className="w-xs">
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
                            <DropdownMenuItem>
                                <SignOut />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>
            </div>
        </header>
    );
}