import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Car, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AddCarPage() {
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
            Add Car
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of the car listing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter car name (e.g. 2022 Ford F-150 Raptor)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter detailed description"
                  className="min-h-32"
                />
              </div>

              <div className="space-y-2">
                <Label>Advertisement Type</Label>
                <RadioGroup defaultValue="sale" className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sale" id="car-sale" />
                    <Label htmlFor="car-sale">For Sale</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rent" id="car-rent" />
                    <Label htmlFor="car-rent">For Rent</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="car-price">Price</Label>
                  <Input
                    id="car-price"
                    type="number"
                    placeholder="Enter price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="car-payment-method">Payment Method</Label>
                  <RadioGroup defaultValue="monthly" className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily">Daily</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly">Weekly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="car-monthly" />
                      <Label htmlFor="car-monthly">Monthly</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Specifications</CardTitle>
              <CardDescription>
                Specify the technical details of the vehicle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage</Label>
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="Enter mileage"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="speed">Speed (mph)</Label>
                  <Input id="speed" type="number" placeholder="Maximum speed" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mpg">Miles Per Gallon</Label>
                  <Input id="mpg" type="number" placeholder="Fuel efficiency" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="Manufacturing year"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Features</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="leather" />
                    <Label htmlFor="leather">Leather Seats</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sunroof" />
                    <Label htmlFor="sunroof">Sunroof</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="navigation" />
                    <Label htmlFor="navigation">Navigation System</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="bluetooth" />
                    <Label htmlFor="bluetooth">Bluetooth</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="backup-camera" />
                    <Label htmlFor="backup-camera">Backup Camera</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="heated-seats" />
                    <Label htmlFor="heated-seats">Heated Seats</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>Upload images of the vehicle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center">
                <Car className="h-8 w-8 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <h3 className="font-medium">Upload vehicle images</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop images or click to browse
                  </p>
                </div>
                <Button variant="outline" className="mt-4">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Images
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="relative aspect-square rounded-md border overflow-hidden">
                  <Image
                    src="/placeholder.svg"
                    alt="Vehicle preview"
                    className="object-cover w-full h-full"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative aspect-square rounded-md border overflow-hidden">
                  <Image
                    src="/placeholder.svg"
                    alt="Vehicle preview"
                    className="object-cover w-full h-full"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative aspect-square rounded-md border overflow-hidden">
                  <Image
                    src="/placeholder.svg"
                    alt="Vehicle preview"
                    className="object-cover w-full h-full"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Condition & Maintenance</CardTitle>
              <CardDescription>
                Enter details about the vehicle condition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <RadioGroup defaultValue="excellent" className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excellent" id="excellent" />
                    <Label htmlFor="excellent">Excellent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="good" id="good" />
                    <Label htmlFor="good">Good</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fair" id="fair" />
                    <Label htmlFor="fair">Fair</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="poor" id="poor" />
                    <Label htmlFor="poor">Poor</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenance">Maintenance History</Label>
                <RadioGroup defaultValue="regular" className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular" id="regular" />
                    <Label htmlFor="regular">Regular Maintenance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="some" id="some" />
                    <Label htmlFor="some">Some Maintenance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimal" id="minimal" />
                    <Label htmlFor="minimal">Minimal Maintenance</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval Status</CardTitle>
              <CardDescription>Set the initial approval status</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="pending" className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="car-active" />
                  <Label htmlFor="car-active">Active (Approved)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending" id="car-pending" />
                  <Label htmlFor="car-pending">Pending</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rejected" id="car-rejected" />
                  <Label htmlFor="car-rejected">Rejected</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
