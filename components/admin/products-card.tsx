import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductCardProps {
  id: string;
  title: string;
  value: string | React.ReactNode;
  icon: React.ReactNode;
  type: "house" | "car" | "all";
}

export function ProductCard({
  id,
  title,
  value,
  icon,
  type,
}: ProductCardProps) {
  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
