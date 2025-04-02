"use client"

import { Loader } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface PageLoaderProps {
    isLoaded: boolean;
}

const PageLoader = ({ isLoaded }: PageLoaderProps) => {
    const [shouldRender, setShouldRender] = useState(!isLoaded);
    
    useEffect(() => {
        if (isLoaded) {
            // Start fade-out animation
            const animationTimer = setTimeout(() => {
                // Remove from DOM after animation completes
                setShouldRender(false);
            }, 500); // Matches the duration-500
            
            return () => clearTimeout(animationTimer);
        }
    }, [isLoaded]);
    
    if (!shouldRender) return null;
    
    return (
            <div className={`fixed inset-0 z-[9999] top-0 left-0 h-screen w-full flex flex-col items-center justify-center bg-background transition-opacity duration-500 ease-in-out ${isLoaded ? 'opacity-0' : 'opacity-100'}`}>
                <Image src="/Flowboard Logo Light.svg" alt="Logo" className="block dark:hidden" width={56} height={56} priority />
                <Image src="/Flowboard Logo Dark.svg" alt="Logo" className="hidden dark:block" width={56} height={56} priority />
                <Loader className="size-6 animate-spin text-muted-foreground mt-4" />
            </div>
        );
    }

export default PageLoader;