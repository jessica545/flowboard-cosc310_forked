import { UserButton } from "@/features/auth/components/user-button"
import Link from "next/link"
import Image from "next/image";

import logo from "@/public/Flowboard Logo Light.svg";

interface StandaloneLayoutProps{
    children: React.ReactNode
}

const StandaloneLayout = ({ children }: StandaloneLayoutProps) => {
    return (
        <main className = "bg-primary min-h-screen">
            <div className="mx-auto max-w-screen-2xl p-4">
                <nav className="flex justify-between items-center h-[73px]">
                    <Link href="/">
                        <Image src="/Flowboard Logo Light Banner-01.svg" alt="Logo" height={56} width={232} className="block dark:hidden" priority/>
                        <Image src="/Flowboard Logo Dark Banner-01.svg" alt="Logo" height={56} width={232} className="hidden dark:block" priority/>
                    </Link>
                    <UserButton/>
                </nav>
                <div className="flex flex-col items-center justify-center py-4">
                    {children}
                </div>
            </div>
        </main>
    );
}

export default StandaloneLayout;