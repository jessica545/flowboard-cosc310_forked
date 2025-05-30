import { UserButton } from "@/features/auth/components/user-button"
import Image from "next/image";
import Link from "next/link";

interface StandaloneLayoutProps{
    children: React.ReactNode
}

const StandaloneLayout = ({ children }: StandaloneLayoutProps) => {
    return (
        <main className="bg-secondary min-h-screen">
            <div className="mx-auto max-w-screen-2xl p-4">
                <nav className="flex justify-between items-center h-[73px] mb-4 rounded-lg bg-primary shadow-sm">
                    <Link href="/">
                        <Image src="/Flowboard Logo Light Banner-01.svg" alt="Logo" height={56} width={232} className="block dark:hidden" priority />
                        <Image src="/Flowboard Logo Dark Banner-01.svg" alt="Logo" height={56} width={232} className="hidden dark:block" priority />
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