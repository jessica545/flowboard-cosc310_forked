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
    const valueColor = value === 0 ? "text-muted-foreground" : "test-primary";

    return (
        <Card className="shadow-none border-none w-full text-primary bg-secondary h-[calc(100%+px)]">
            <CardHeader>
                <CardDescription className="flex items-center gap-x-2 font-medium overflow-hidden">
                    <span className="truncate text-base text-primary">{title}</span>
                </CardDescription>
                <CardTitle className={`text-3xl font-semibold ${valueColor}`}>
                    {value}
                </CardTitle>
            </CardHeader>
        </Card>
    );
};