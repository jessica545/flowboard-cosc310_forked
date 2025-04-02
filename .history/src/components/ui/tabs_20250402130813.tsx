"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-transparent p-1 text-muted-foreground gap-x-2",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "text-hover inline-flex items-center justify-center whitespace-nowrap rounded-t-md px-3 py-1 text-sm",
      "bg-secondary font-medium border-b-0 border-transparent ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-secondary data-[state=active]:text-primary",
      "hover:bg-muted/50 hover:text-foreground data-[state=active]:border-border transition-all shadow-[0_1px_0.5px_rgba(0,0,0,0,1)]",
      "clip-path-[polygon(0_0,100%_0,100%_calc(100%_-_8px),calc(100%_-_12px)_100%,12px_100%,0_calc(100%_-_8px))]",
      "data-[state=active]:clip-path-[polygon(0_0,100%_0,100%_100%,calc(100%_-_16px)_100%,16px_100%,0_100%)]",
      "mb-[-1px] mr-[-12px] first:ml-0 z-0",
      "data-[state=active]:z-10",
      "transition-all duration-200 ease-in-out",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
