import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, ImageIcon } from "lucide-react";

export function RecentAds() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Ad" />
          <AvatarFallback>
            <ImageIcon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">
            Summer Sale - 20% Off All Cars
          </p>
          <p className="text-sm text-muted-foreground">
            Created by Marketing Team • Active
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge className="bg-green-500">Active</Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Ad" />
          <AvatarFallback>
            <ImageIcon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">
            New Luxury Homes Collection
          </p>
          <p className="text-sm text-muted-foreground">
            Created by Property Team • Scheduled
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge className="bg-blue-500">Scheduled</Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Ad" />
          <AvatarFallback>
            <Calendar className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">
            End of Year Clearance
          </p>
          <p className="text-sm text-muted-foreground">
            Created by Marketing Team • Draft
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline">Draft</Badge>
        </div>
      </div>
    </div>
  );
}
