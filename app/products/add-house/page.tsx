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
import { ArrowLeft, Home, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AddHousePage() {
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
            Add House
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of the house listing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter house name" />
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
                    <RadioGroupItem value="sale" id="sale" />
                    <Label htmlFor="sale">For Sale</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rent" id="rent" />
                    <Label htmlFor="rent">For Rent</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" placeholder="Enter price" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <RadioGroup defaultValue="monthly" className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly">Monthly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="quarterly" id="quarterly" />
                      <Label htmlFor="quarterly">Quarterly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="annual" id="annual" />
                      <Label htmlFor="annual">Annual</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Property Features</CardTitle>
              <CardDescription>
                Specify the features of the property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedroom">Bedrooms</Label>
                  <Input
                    id="bedroom"
                    type="number"
                    placeholder="Number of bedrooms"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathroom">Bathrooms</Label>
                  <Input
                    id="bathroom"
                    type="number"
                    placeholder="Number of bathrooms"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parking">Parking Spaces</Label>
                  <Input
                    id="parking"
                    type="number"
                    placeholder="Number of parking spaces"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Size (sq ft)</Label>
                  <Input id="size" type="number" placeholder="Property size" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Features</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="wifi" />
                    <Label htmlFor="wifi">WiFi</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="furnished" />
                    <Label htmlFor="furnished">Furnished</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pool" />
                    <Label htmlFor="pool">Swimming Pool</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="gym" />
                    <Label htmlFor="gym">Gym</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="security" />
                    <Label htmlFor="security">24/7 Security</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="balcony" />
                    <Label htmlFor="balcony">Balcony</Label>
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
              <CardDescription>Upload images of the property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center">
                <Home className="h-8 w-8 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <h3 className="font-medium">Upload property images</h3>
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
                    alt="Property preview"
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
                    alt="Property preview"
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
                    alt="Property preview"
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
              <CardTitle>Location</CardTitle>
              <CardDescription>
                Enter the property location details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Enter full address" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="City" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" placeholder="State/Province" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="Country" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip">Postal/Zip Code</Label>
                  <Input id="zip" placeholder="Postal/Zip Code" />
                </div>
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
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Active (Approved)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending" id="pending" />
                  <Label htmlFor="pending">Pending Approval</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline">Cancel</Button>
            <Button variant="default">Save House Listing</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
