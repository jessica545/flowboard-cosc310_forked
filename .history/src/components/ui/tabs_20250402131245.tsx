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
      "flex h-11 items-end border-b border-border bg-background p-0 pl-4 overflow-visible",
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
      "group relative inline-flex h-10 items-center justify-center whitespace-nowrap px-6 pt-1 pb-0 text-sm font-medium",
      // Base styles
      "bg-muted text-muted-foreground",
      "hover:bg-muted/80 hover:text-foreground",
      // Active state
      "data-[state=active]:bg-background data-[state=active]:text-foreground",
      // Positioning
      "mb-[-1px] mr-[-16px] first:ml-0 z-0",
      "data-[state=active]:z-10",
      // Shape container
      "overflow-visible",
      className
    )}
    {...props}
  >
  <span 
      className="absolute inset-0 bg-inherit rounded-t-md 
                before:absolute before:content-[''] before:left-0 before:bottom-0 before:w-4 before:h-full before:bg-inherit 
                before:transform before:origin-bottom-left before:-skew-x-12
                after:absolute after:content-[''] after:right-0 after:bottom-0 after:w-4 after:h-full after:bg-inherit
                after:transform after:origin-bottom-right after:skew-x-12"
    />
    </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "mt-0 pt-4 rounded-b-md border-t-0 border-border bg-background",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
