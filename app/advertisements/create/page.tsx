"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CreateAdvertisementPage() {
  const [adType, setAdType] = useState("wide");
  const [priority, setPriority] = useState("medium");
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="main-content space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/advertisements">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-diplomat-green">
            Create Advertisement
          </h1>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Advertisement Format</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue="wide"
              onValueChange={setAdType}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer ${
                    adType === "wide"
                      ? "border-diplomat-green"
                      : "border-gray-200"
                  }`}
                >
                  <div className="w-32 h-16 bg-gray-100 rounded" />
                </div>
                <RadioGroupItem value="wide" id="wide" className="sr-only" />
                <Label htmlFor="wide">Wide</Label>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer ${
                    adType === "banner"
                      ? "border-diplomat-green"
                      : "border-gray-200"
                  }`}
                >
                  <div className="w-24 h-24 bg-gray-100 rounded" />
                </div>
                <RadioGroupItem
                  value="banner"
                  id="banner"
                  className="sr-only"
                />
                <Label htmlFor="banner">Banner</Label>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer ${
                    adType === "small"
                      ? "border-diplomat-green"
                      : "border-gray-200"
                  }`}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded" />
                </div>
                <RadioGroupItem value="small" id="small" className="sr-only" />
                <Label htmlFor="small">Small</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advertisement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" placeholder="Enter company name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Input id="product" placeholder="Enter product name" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input type="date" id="startDate" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input type="date" id="endDate" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <RadioGroup defaultValue="current" className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="current" id="current" />
                  <Label htmlFor="current">Current</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="past" id="past" />
                  <Label htmlFor="past">Past</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <RadioGroup
                defaultValue="medium"
                onValueChange={setPriority}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="important" id="important" />
                  <Label htmlFor="important">Important</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="visibility"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="visibility">Visible</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" placeholder="Write your tags like #carforrent" />
            </div>

            <div className="space-y-2">
              <Label>Media</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <h3 className="font-medium">Upload media</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or click to browse
                  </p>
                </div>
                <Button variant="outline" className="mt-4">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Media
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                placeholder="Write your message..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button variant="default">Create Advertisement</Button>
        </div>
      </div>
    </div>
  );
}
