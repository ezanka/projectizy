"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { DropdownMenuItem } from "@/src/components/ui/shadcn/dropdown-menu"
import { Check } from "lucide-react"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const items = [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "system", label: "System" },
    ]

    return (
        <>
            {items.map((item) => (
                <DropdownMenuItem
                    key={item.value}
                    onClick={() => setTheme(item.value)}
                    className={
                        theme === item.value
                            ? "bg-accent text-accent-foreground font-medium ml-2 mb-1"
                            : "ml-2 mb-1"
                    }
                >
                    {theme === item.value && ( 
                        <Check className="h-4 w-4" />
                    )}
                    {item.label}
                </DropdownMenuItem>
            ))}
        </>
    )
}
