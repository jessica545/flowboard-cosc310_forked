import { UserButton } from "@/features/auth/components/user-button";
import { MobileSidebar } from "./mobile-sidebar";
import { EmailModal } from "./EmailTest";
import { Notifications } from "./notifications";

export const Navbar = () => {
    return(
        <nav className="pt-4 px-6 flex items-center justify-between">
            <div className="flex-col hidden lg:flex">
                <h1 className="text-2xl font-semibold">Home</h1>
                <p className="text-muted-foreground">Monitor all your projects and tasks here</p>
            </div>
            <MobileSidebar />
            <div className="flex items-center gap-x-4">
                <Notifications />
                <EmailModal />
                <UserButton />
            </div>
        </nav>
    )
}