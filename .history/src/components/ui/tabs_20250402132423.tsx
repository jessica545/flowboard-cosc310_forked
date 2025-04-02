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
      "group relative bg-secondary flex h-full items-center justify-center whitespace-nowrap text-sm font-medium",
      // Shape and positioning
      "px-4 mx-[-8px] first:ml-0", // Reduced overlap
      // Visual styles
      "bg-muted text-muted-foreground hover:bg-muted/80",
      "data-[state=active]:bg-secondary data-[state=active]:text-foreground",
      // Trapezoid effect
      "before:absolute before:content-[''] before:left-0 before:bottom-0 before:w-3 before:h-full before:bg-inherit",
      "before:transform before:skew-x-[12deg] before:origin-bottom-left",
      "after:absolute after:content-[''] after:right-0 after:bottom-0 after:w-3 after:h-full after:bg-inherit",
      "after:transform after:skew-x-[-12deg] after:origin-bottom-right",
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
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
