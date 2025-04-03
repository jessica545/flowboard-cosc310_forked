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
  const valueIsZero = value === 0 ? "text-muted-foreground" : "text-primary";

  return (
    <Card className="shadow-none border-none w-full bg-secondary">
      <CardHeader>
        <CardDescription className="flex items-center gap-x-2 font-medium overflow-hidden">
          <span className="truncate text-base">{title}</span>
        </CardDescription>
        <CardTitle className={`text-3xl font-semibold ${valueIsZero}`}>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
};