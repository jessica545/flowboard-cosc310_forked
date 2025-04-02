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
  return (
    <Card className="shadow-none border-none w-full text-primary bg-secondary">
      <CardHeader>
        <CardDescription className="flex items-center gap-x-2 font-medium overflow-hidden">
          <span className="truncate text-base text-primary">{title}</span>
        </CardDescription>
        <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
};