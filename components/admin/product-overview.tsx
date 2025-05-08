"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car, Home, Package, TrendingUp } from "lucide-react";
import { IHouse } from "@/lib/models/house.model";
import { ICar } from "@/lib/models/car.model";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductOverviewProps {
  houses: IHouse[];
  cars: ICar[];
  loading?: boolean;
}

function StatsCardLoading() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Skeleton className="h-4 w-[100px]" />
        </CardTitle>
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <Skeleton className="h-7 w-[60px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductOverview({
  houses,
  cars,
  loading = false,
}: ProductOverviewProps) {
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <StatsCardLoading key={i} />
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[140px] mb-2" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingApprovals = [
    ...houses.filter((house) => house.status === "Pending"),
    ...cars.filter((car) => car.status === "Pending"),
  ].length;

  const totalProducts = houses.length + cars.length;
  const housesCount = houses.length;
  const carsCount = cars.length;

  const calculateMonthlyChange = (items: (IHouse | ICar)[]) => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthCount = items.filter((item) => {
      const createdAt = new Date(item.createdAt || "");
      return createdAt >= lastMonth && createdAt < currentMonth;
    }).length;

    const currentMonthCount = items.filter((item) => {
      const createdAt = new Date(item.createdAt || "");
      return createdAt >= currentMonth;
    }).length;

    if (lastMonthCount === 0) return 100;
    return ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;
  };

  const housesChange = calculateMonthlyChange(houses);
  const carsChange = calculateMonthlyChange(cars);
  const totalChange = calculateMonthlyChange([...houses, ...cars]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {totalChange >= 0 ? "+" : ""}
              {totalChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Houses</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{housesCount}</div>
            <p className="text-xs text-muted-foreground">
              {housesChange >= 0 ? "+" : ""}
              {housesChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cars</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carsCount}</div>
            <p className="text-xs text-muted-foreground">
              {carsChange >= 0 ? "+" : ""}
              {carsChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Distribution</CardTitle>
          <CardDescription>
            Distribution of products by type and status
          </CardDescription>
        </CardHeader>
        <CardContent>{/* Add your chart or visualization here */}</CardContent>
      </Card>
    </div>
  );
}
