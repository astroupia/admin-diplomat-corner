import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import {
  trackClick,
  useAdvertisementView,
} from "@/lib/utils/advertisement-tracker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface AdvertisementCardProps {
  advertisement: {
    _id: string;
    title: string;
    description: string;
    link: string;
    status: string;
    priority: string;
    advertisementType: string;
    imageUrl?: string;
    clickCount: number;
    viewCount: number;
  };
  showAnalytics?: boolean;
  isAdmin?: boolean;
}

export default function AdvertisementCard({
  advertisement,
  showAnalytics = false,
  isAdmin = false,
}: AdvertisementCardProps) {
  const { user } = useUser();
  const [clickCount, setClickCount] = useState(advertisement.clickCount);

  // Track view when the advertisement is rendered
  useAdvertisementView(advertisement._id);

  // Handle clicking the advertisement link
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    const newClickCount = await trackClick(advertisement._id);
    if (newClickCount !== null) {
      setClickCount(newClickCount);
    }

    // Open the link in a new tab
    window.open(advertisement.link, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      {advertisement.imageUrl && (
        <div className="relative aspect-video w-full">
          <Image
            src={advertisement.imageUrl}
            alt={advertisement.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Badge
              variant={
                advertisement.status === "Active" ? "default" : "secondary"
              }
            >
              {advertisement.status}
            </Badge>
            <Badge variant="outline">{advertisement.priority}</Badge>
          </div>
        </div>
      )}
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{advertisement.title}</h3>
        <p className="text-gray-600 text-sm mb-3">
          {advertisement.description}
        </p>

        {showAnalytics && (
          <div className="flex gap-4 text-sm text-gray-500 mb-3">
            <div>Views: {advertisement.viewCount}</div>
            <div>Clicks: {clickCount}</div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Button
          variant="default"
          size="sm"
          className="text-xs"
          onClick={handleClick}
        >
          Visit Link <ExternalLink className="ml-1 h-3 w-3" />
        </Button>

        {isAdmin && (
          <Link href={`/advertisements/${advertisement._id}`}>
            <Button variant="outline" size="sm" className="text-xs">
              Manage
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
