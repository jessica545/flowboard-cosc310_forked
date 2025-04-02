"use client";

import React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
}

export const DatePicker = ({
  value,
  onChange,
  className,
  placeholder = "Select date",
}: DatePickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild className="hover:bg-secondary">
        <Button
          variant="outline"
          size="lg"
          className={cn(
            "w-full justify-start text-left font-normal relative pr-8",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {value ? format(value, "PPP") : placeholder}
            </span>
          </div>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 absolute right-1 top-1/2 -translate-y-1/2"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-tertiary">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => onChange(date as Date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
