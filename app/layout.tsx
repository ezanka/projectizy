import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/src/components/ui/shadcn/sonner"
import { ThemeProvider } from "@/src/components/theme-provider"

export const metadata: Metadata = {
  title: "Projectizy",
  description: "Project management made easy",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body
                className={`antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster position="top-right" />
                </ThemeProvider>
            </body>
        </html>
    );
}
