"use client"
import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
    return (
        <SonnerToaster
        theme="system" // or "light" | "dark"
        className="toaster group"
        toastOptions={{
            classNames: {
                toast:
                "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                description: "group-[.toast]:text-muted-foreground",
                actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                error: "group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground group-[.toaster]:border-destructive",
                success: "group-[.toaster]:bg-success group-[.toaster]:text-success-foreground group-[.toaster]:border-success",
                warning: "group-[.toaster]:bg-warning group-[.toaster]:text-warning-foreground group-[.toaster]:border-warning",
                info: "group-[.toaster]:bg-info group-[.toaster]:text-info-foreground group-[.toaster]:border-info",
                icon: "group-[.toast]:text-foreground",
                closeButton: "group-[.toast]:text-muted-foreground group-[.toast]:hover:text-foreground",
            },
        }}
        />
    )
}