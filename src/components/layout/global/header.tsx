import { ThemeToggle } from "../../ui/global/themeToggle";
import HeaderPath from "./header-path";

export default function Header() {
    return (
        <header className="w-full border-b bg-sidebar z-10">
            <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                <div className="flex flex-1 items-center justify-between">
                    <HeaderPath />
                </div>
                <ThemeToggle />
            </div>
        </header>
    );
}