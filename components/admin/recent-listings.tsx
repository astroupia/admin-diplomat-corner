import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Check, Home, X } from "lucide-react";

export function RecentListings() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Car" />
          <AvatarFallback>
            <Car className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">
            2022 Ford F-150 Raptor
          </p>
          <p className="text-sm text-muted-foreground">
            Added by John Doe • 2 hours ago
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="ml-auto">
            Car
          </Badge>
          <Badge className="bg-yellow-500">Pending</Badge>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Check className="h-4 w-4 text-green-500" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <X className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="House" />
          <AvatarFallback>
            <Home className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">
            Luxury Villa in Palm Jumeirah
          </p>
          <p className="text-sm text-muted-foreground">
            Added by Sarah Johnson • 5 hours ago
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="ml-auto">
            House
          </Badge>
          <Badge className="bg-green-500">Approved</Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Car" />
          <AvatarFallback>
            <Car className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">
            2021 Mercedes-Benz S-Class
          </p>
          <p className="text-sm text-muted-foreground">
            Added by Michael Brown • 1 day ago
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="ml-auto">
            Car
          </Badge>
          <Badge className="bg-green-500">Approved</Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="House" />
          <AvatarFallback>
            <Home className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">
            Modern Apartment in Downtown
          </p>
          <p className="text-sm text-muted-foreground">
            Added by Emily Wilson • 2 days ago
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="ml-auto">
            House
          </Badge>
          <Badge className="bg-yellow-500">Pending</Badge>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Check className="h-4 w-4 text-green-500" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <X className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
