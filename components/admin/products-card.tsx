import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  title: string;
  value: string;
  icon: React.ReactNode;
  type: "house" | "car";
}

export function ProductCard({
  id,
  title,
  value,
  icon,
  type,
}: ProductCardProps) {
  return (
    <Card>
      <Link href={`/products/${type}s/${id}`} passHref>
        <Button variant="ghost" className="w-full h-full p-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
          </CardContent>
        </Button>
      </Link>
    </Card>
  );
}
