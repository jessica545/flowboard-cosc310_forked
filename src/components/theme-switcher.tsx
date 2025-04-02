"use client";

import { useTheme } from "@/features/settings/components/theme-wrapper";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    
    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={`Toggle ${theme === "light" ? "dark" : "light"} mode`}
            className="relative flex items-center justify-between w-16 h-8 rounded-full p-1 bg-quaternary focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300 ease-in-out"
        >
            <motion.div
                layout
                className="absolute top-1 bottom-1 w-6 h-6 rounded-full bg-white shadow-md"
                animate={{
                    left: theme === "light" ? "0.25rem" : "2.25rem",
                }}
                transition={{
                    type: "tween",
                }}
            />
            <div className="flex items-center justify-center w-6 h-6">
                <Sun className={`w-4 h-4 ${theme === "light" ? "text-yellow-500" : "text-gray-400"}`} />
            </div>
            <div className="flex items-center justify-center w-6 h-6">
                <Moon className={`w-4 h-4 ${theme === "dark" ? "text-blue-400" : "text-gray-700"}`} />
            </div>
        </button>
    );
}