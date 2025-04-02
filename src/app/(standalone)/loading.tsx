"use client"

import { PageLoader } from "@/components/page-loader";
import { useEffect, useState } from "react";

const LoadingPage = () => {
    const [ isAppReady, setIsAppReady ] = useState(false);
    
    useEffect(() => {
        // Simulate loading (replace with your actual loading logic)
        const timer = setTimeout(() => setIsAppReady(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="h-screen flex flex-col items-center justify-center">
            {!isAppReady && <PageLoader />}
        </div>
    );
}

export default LoadingPage;
