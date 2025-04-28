import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function HouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Resolve params if it's a Promise
  const resolvedParams = params instanceof Promise ? await params : params;
  const id = resolvedParams.id;

  // In a real application, you would fetch the house data based on the ID
  const house = {
    id: id,
    name: "Luxury Villa in Palm Jumeirah",
    type: "house",
    bedrooms: 5,
    bathrooms: 4,
    price: 2500000,
    status: "pending",
    description:
      "A stunning luxury villa with breathtaking views of the Arabian Gulf.",
    features: [
      "Swimming Pool",
      "Private Beach",
      "Smart Home System",
      "Gym",
      "Home Theater",
    ],
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    createdAt: "2023-05-15T09:24:00",
    updatedAt: "2023-05-16T14:45:00",
  };

  return (
    <div className="main-content space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/products/houses">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-diplomat-green">
            {house.name}
          </h1>
        </div>
        <Badge
          className={
            house.status === "active"
              ? "bg-green-500"
              : house.status === "pending"
              ? "bg-yellow-500"
              : "bg-gray-500"
          }
        >
          {house.status.charAt(0).toUpperCase() + house.status.slice(1)}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>House Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">ID:</span>
              <span>{house.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Type:</span>
              <span>{house.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Bedrooms:</span>
              <span>{house.bedrooms}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Bathrooms:</span>
              <span>{house.bathrooms}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Price:</span>
              <span>${house.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Created:</span>
              <span>{new Date(house.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Updated:</span>
              <span>{new Date(house.updatedAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{house.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4">
              {house.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {house.images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`House image ${index + 1}`}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video">
              <Image
                src="/placeholder.svg"
                alt="Payment transaction"
                fill
                className="object-cover rounded-md"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {house.status === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle>Approval Actions</CardTitle>
            <CardDescription>
              Approve or reject this house listing
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end space-x-4">
            <Button variant="outline" className="w-32">
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button variant="default" className="w-32">
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
