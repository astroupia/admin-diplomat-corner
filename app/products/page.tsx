import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Home, Plus, Upload, Package } from "lucide-react";
import { ProductsTable } from "@/components/admin/products-table";
import { ProductCard } from "@/components/admin/products-card";

export default function Page() {
  return (
    <div className="main-content main-content-expanded space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-diplomat-green">
          Products
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button variant="default">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="w-full justify-start border-b pb-px mb-4">
          <TabsTrigger value="all" className="px-4 py-2">
            All Products
          </TabsTrigger>
          <TabsTrigger value="houses" className="px-4 py-2">
            Houses
          </TabsTrigger>
          <TabsTrigger value="cars" className="px-4 py-2">
            Cars
          </TabsTrigger>
          <TabsTrigger value="pending" className="px-4 py-2">
            Pending Approval
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ProductCard
              id="total"
              title="Total Products"
              value="1,248"
              icon={<Package className="h-4 w-4 text-muted-foreground" />}
              type="house"
            />
            <ProductCard
              id="houses"
              title="Houses"
              value="842"
              icon={<Home className="h-4 w-4 text-muted-foreground" />}
              type="house"
            />
            <ProductCard
              id="cars"
              title="Cars"
              value="406"
              icon={<Car className="h-4 w-4 text-muted-foreground" />}
              type="car"
            />
            <ProductCard
              id="pending"
              title="Pending Approval"
              value="24"
              icon={<Package className="h-4 w-4 text-muted-foreground" />}
              type="house"
            />
          </div>
          <ProductsTable />
        </TabsContent>
        <TabsContent value="houses" className="space-y-4">
          <ProductsTable type="house" />
        </TabsContent>
        <TabsContent value="cars" className="space-y-4">
          <ProductsTable type="car" />
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          <ProductsTable pending={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
