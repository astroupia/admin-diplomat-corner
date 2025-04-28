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

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Resolve params if it's a Promise, or use default if undefined
  const resolvedParams = params ? await params : { id: "default" };
  const id = resolvedParams.id;

  // In a real application, you would fetch the car data based on the ID
  const car = {
    id: id,
    name: "2022 Ford F-150 Raptor",
    type: "car",
    make: "Ford",
    model: "F-150 Raptor",
    year: 2022,
    price: 85000,
    status: "pending",
    description:
      "A high-performance off-road pickup truck with exceptional capabilities.",
    features: [
      "Twin-Turbo V6 Engine",
      "10-Speed Automatic Transmission",
      "FOX Racing Shocks",
      "37-inch Tires",
    ],
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    createdAt: "2023-05-15T09:24:00",
    updatedAt: "2023-05-16T14:45:00",
  };

  return (
    <div className="main-content space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/products/cars">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-diplomat-green">
            {car.name}
          </h1>
        </div>
        <Badge
          className={
            car.status === "active"
              ? "bg-green-500"
              : car.status === "pending"
              ? "bg-yellow-500"
              : "bg-gray-500"
          }
        >
          {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Car Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">ID:</span>
              <span>{car.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Type:</span>
              <span>{car.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Make:</span>
              <span>{car.make}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Model:</span>
              <span>{car.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Year:</span>
              <span>{car.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Price:</span>
              <span>${car.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Created:</span>
              <span>{new Date(car.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Updated:</span>
              <span>{new Date(car.updatedAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{car.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4">
              {car.features.map((feature, index) => (
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
              {car.images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Car image ${index + 1}`}
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

      {car.status === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle>Approval Actions</CardTitle>
            <CardDescription>
              Approve or reject this car listing
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
