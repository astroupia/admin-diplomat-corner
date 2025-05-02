import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ImageIcon, Plus, Users } from "lucide-react";
import { AdvertisementsTable } from "@/components/admin/advertisements-table";
import Link from "next/link";

export default function AdvertisementsPage() {
  return (
    <div className="main-content space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-diplomat-green">
          Advertisements
        </h1>
        <div className="flex items-center gap-2">
          <Link href="/advertisements/create">
            <Button variant="default">
              <Plus className="mr-2 h-4 w-4" />
              Create Advertisement
            </Button>
          </Link>
        </div>
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Ads</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Ads
                </CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">32</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Scheduled Ads
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ad Impressions
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.8K</div>
              </CardContent>
            </Card>
          </div>
          <AdvertisementsTable />
        </TabsContent>
        <TabsContent value="active" className="space-y-4">
          <AdvertisementsTable status="active" />
        </TabsContent>
        <TabsContent value="scheduled" className="space-y-4">
          <AdvertisementsTable status="scheduled" />
        </TabsContent>
        <TabsContent value="draft" className="space-y-4">
          <AdvertisementsTable status="draft" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
