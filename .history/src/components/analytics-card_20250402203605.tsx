import React from "react";

import {
  Card,
  CardHeader,
  CardDescription, 
  CardTitle,
} from "@/components/ui/card";

interface AnalyticsCardProps {
  title: string;
  value: number;
}

export const AnalyticsCard = ({
  title, 
  value,
}: AnalyticsCardProps) => {
  const valueIsZero = value === 0 ? "text-primary" : "text-muted";

  return (
    <Card className="shadow-none border-none w-full">
      <CardHeader>
        <CardDescription className="flex items-center gap-x-2 font-medium overflow-hidden">
          <span className="truncate text-base">{title}</span>
        </CardDescription>
        <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
};