
import type {Metadata} from "next";
import {Inter} from "next/font/google";
import {cn} from "@/lib/utils";
import React from "react";

import "./globals.css";
import {QueryProvider} from "@/components/query-provider";
import {Toaster} from "@/components/ui/sonner";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ThemeWrapper } from "@/features/settings/components/theme-wrapper";

const inter = Inter({subsets: ["latin"]});


export const metadata: Metadata = {
    title: "Create Next App",
    description: "Generated by create next app",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <ThemeWrapper>
            <html lang="en" className="h-full">
                <body className={cn(inter.className, "antialiased min-h-screen bg-primary")}>
                    <QueryProvider>
                        <NuqsAdapter>
                            <Toaster/>
                            <main className="h-full">
                    <aside className="min-h-screen w-[256px] bg-secondary min-h-screen"/>
                                {children}
                            </main>
                        </NuqsAdapter>
                    </QueryProvider>
                </body>
            </html>
        </ThemeWrapper>
    );
}