import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface TrackingItem {
  userId: string;
  timestamp: string;
  device?: string;
  ipAddress?: string;
}

interface AnalyticsDataPoint {
  date: string;
  count: number;
  items: TrackingItem[];
}

interface AdvertisementAnalyticsProps {
  advertisementId: string;
  title?: string;
}

export default function AdvertisementAnalytics({
  advertisementId,
  title,
}: AdvertisementAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<{
    clickCount: number;
    viewCount: number;
    clicksOverTime: AnalyticsDataPoint[];
    viewsOverTime: AnalyticsDataPoint[];
  } | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/advertisements/${advertisementId}?analytics=true`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const data = await response.json();

        if (data.success && data.analytics) {
          setAnalyticsData(data.analytics);
        } else {
          throw new Error(data.error || "No analytics data available");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load analytics"
        );
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    if (advertisementId) {
      fetchAnalytics();
    }
  }, [advertisementId]);

  // Format data for charts
  const prepareChartData = (data: AnalyticsDataPoint[] = []) => {
    // Sort data by date
    return [...data].sort((a, b) => a.date.localeCompare(b.date));
  };

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Advertisement Analytics</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Advertisement Analytics</CardTitle>
          <CardDescription>Error loading analytics</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-red-500">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Advertisement Analytics</CardTitle>
          <CardDescription>No analytics data available</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          No data available for this advertisement
        </CardContent>
      </Card>
    );
  }

  const clickChartData = prepareChartData(analyticsData.clicksOverTime);
  const viewChartData = prepareChartData(analyticsData.viewsOverTime);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>
          Advertisement Analytics
          {title && `: ${title}`}
        </CardTitle>
        <CardDescription>
          Performance metrics for this advertisement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-2 mb-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-2xl font-bold">
                {analyticsData.viewCount}
              </CardTitle>
              <CardDescription>Total Views</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-2xl font-bold">
                {analyticsData.clickCount}
              </CardTitle>
              <CardDescription>Total Clicks</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="views" className="mt-6">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="views">Views Over Time</TabsTrigger>
            <TabsTrigger value="clicks">Clicks Over Time</TabsTrigger>
          </TabsList>

          <TabsContent value="views" className="mt-4">
            <div className="h-80 w-full">
              {viewChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={viewChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Views" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No view data available
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="clicks" className="mt-4">
            <div className="h-80 w-full">
              {clickChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clickChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Clicks" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No click data available
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
