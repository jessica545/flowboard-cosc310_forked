import { UserButton } from "@/features/auth/components/user-button"

interface StandaloneLayoutProps{
    children: React.ReactNode
}

const StandaloneLayout = ({ children }: StandaloneLayoutProps) => {
    return (
        <main className="bg-primary min-h-screen">
            <div className="mx-auto max-w-screen-2xl p-4">
                <nav className="flex justify-between items-center h-[73px] mb-4 rounded-lg bg-primary shadow-sm">
                    <div></div>
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