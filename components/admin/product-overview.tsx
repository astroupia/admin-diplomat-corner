"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Home, TrendingUp, DollarSign, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { IHouse } from "@/lib/models/house.model";
import { ICar } from "@/lib/models/car.model";

interface ProductOverviewProps {
  houses: IHouse[];
  cars: ICar[];
}

export function ProductOverview({ houses, cars }: ProductOverviewProps) {
  // Calculate statistics for houses
  const houseStats = {
    total: houses.length,
    forRent: houses.filter(h => h.advertisementType === "Rent").length,
    forSale: houses.filter(h => h.advertisementType === "Sale").length,
    active: houses.filter(h => h.status === "Active").length,
    pending: houses.filter(h => h.status === "Pending").length,
    averagePrice: houses.reduce((acc, h) => acc + h.price, 0) / (houses.length || 1),
  };

  // Calculate statistics for cars
  const carStats = {
    total: cars.length,
    forRent: cars.filter(c => c.advertisementType === "Rent").length,
    forSale: cars.filter(c => c.advertisementType === "Sale").length,
    active: cars.filter(c => c.status === "Active").length,
    pending: cars.filter(c => c.status === "Pending").length,
    averagePrice: cars.reduce((acc, c) => acc + c.price, 0) / (cars.length || 1),
  };

  return (
    <div className="space-y-6">
      {/* Houses Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Houses</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{houseStats.total}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
              {houseStats.active} Active
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3 mr-1 text-yellow-500" />
              {houseStats.pending} Pending
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">House Types</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3 mr-1" />
              {houseStats.forSale} For Sale
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Clock className="h-3 w-3 mr-1" />
              {houseStats.forRent} For Rent
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Avg. Price: ${houseStats.averagePrice.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">House Distribution</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-20 flex items-center justify-center">
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Active</span>
                  <span>{Math.round((houseStats.active / houseStats.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${(houseStats.active / houseStats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cars Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cars</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carStats.total}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
              {carStats.active} Active
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3 mr-1 text-yellow-500" />
              {carStats.pending} Pending
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Car Types</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3 mr-1" />
              {carStats.forSale} For Sale
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Clock className="h-3 w-3 mr-1" />
              {carStats.forRent} For Rent
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Avg. Price: ${carStats.averagePrice.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Car Distribution</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-20 flex items-center justify-center">
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Active</span>
                  <span>{Math.round((carStats.active / carStats.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${(carStats.active / carStats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 