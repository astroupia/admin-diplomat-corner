"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Home, Plus, Trash2, Edit, Save, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import Image from "next/image";

interface House {
  _id: string;
  name: string;
  userId: string;
  description: string;
  advertisementType: "Rent" | "Sale";
  price: number;
  paymentMethod?: "Monthly" | "Quarterly" | "Annual";
  bedroom?: number;
  parkingSpace?: number;
  bathroom?: number;
  size?: number;
  houseType: "House" | "Apartment" | "Guest House";
  condition?: string;
  maintenance?: string;
  essentials?: string[];
  currency: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  paymentId: string;
  visibility: "Private" | "Public";
  status: "Pending" | "Active";
}

interface HouseFormData {
  name: string;
  bedroom: number;
  size: number;
  bathroom: number;
  parkingSpace: number;
  condition: string;
  maintenance: string;
  price: number;
  description: string;
  advertisementType: "Rent" | "Sale";
  paymentMethod: "Monthly" | "Quarterly" | "Annual";
  houseType: "House" | "Apartment" | "Guest House";
  essentials: string[];
  currency: string;
  imageUrl?: string;
}

interface ManageHouseProps {
  initialData?: House;
  isEditMode?: boolean;
}

const ManageHouse: React.FC<ManageHouseProps> = ({
  initialData,
  isEditMode = false,
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [formData, setFormData] = useState<HouseFormData>({
    name: initialData?.name || "",
    bedroom: initialData?.bedroom || 0,
    size: initialData?.size || 0,
    bathroom: initialData?.bathroom || 0,
    parkingSpace: initialData?.parkingSpace || 0,
    condition: initialData?.condition || "",
    maintenance: initialData?.maintenance || "",
    price: initialData?.price || 0,
    description: initialData?.description || "",
    advertisementType: initialData?.advertisementType || "Rent",
    paymentMethod: initialData?.paymentMethod || "Monthly",
    houseType: initialData?.houseType || "House",
    essentials: initialData?.essentials || [],
    currency: initialData?.currency || "USD",
  });

  const essentials = [
    "WiFi",
    "Furnished",
    "Play Ground",
    "Living Area",
    "Gym",
    "Outdoor",
    "Dining Area",
    "Jacuzzi",
    "Steam",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "bedroom" ||
        name === "size" ||
        name === "bathroom" ||
        name === "parkingSpace" ||
        name === "price"
          ? Number(value)
          : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleEssential = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      essentials: prev.essentials.includes(item)
        ? prev.essentials.filter((i) => i !== item)
        : [...prev.essentials, item],
    }));
  };

  const resetForm = () => {
    if (initialData && isEditMode) {
      // Reset to initial data in edit mode
      setFormData({
        name: initialData.name,
        bedroom: initialData.bedroom || 0,
        size: initialData.size || 0,
        bathroom: initialData.bathroom || 0,
        parkingSpace: initialData.parkingSpace || 0,
        condition: initialData.condition || "",
        maintenance: initialData.maintenance || "",
        price: initialData.price,
        description: initialData.description,
        advertisementType: initialData.advertisementType,
        paymentMethod: initialData.paymentMethod || "Monthly",
        houseType: initialData.houseType,
        essentials: initialData.essentials || [],
        currency: initialData.currency,
      });
      setImagePreview(initialData.imageUrl || null);
    } else {
      // Reset to empty form in create mode
      setFormData({
        name: "",
        bedroom: 0,
        size: 0,
        bathroom: 0,
        parkingSpace: 0,
        condition: "",
        maintenance: "",
        price: 0,
        description: "",
        advertisementType: "Rent",
        paymentMethod: "Monthly",
        houseType: "House",
        essentials: [],
        currency: "USD",
      });
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.advertisementType ||
      !formData.houseType ||
      !formData.currency
    ) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);

    try {
      const apiFormData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "essentials" && Array.isArray(value)) {
            apiFormData.append(key, JSON.stringify(value));
          } else {
            apiFormData.append(key, String(value));
          }
        }
      });

      // Add admin metadata
      apiFormData.append("visiblity", "Public"); // Support both spellings for backward compatibility
      apiFormData.append("visibility", "Public");
      apiFormData.append("status", "Active");
      apiFormData.append("timestamp", new Date().toISOString());
      apiFormData.append("paymentId", "admin-created");

      if (selectedFile) {
        apiFormData.append("file", selectedFile);
      }

      // Determine the endpoint based on whether we're editing or creating
      const endpoint =
        isEditMode && initialData?._id
          ? `/api/house/${initialData._id}`
          : "/api/house/create";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        body: apiFormData,
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? "update" : "create"} house`);
      }

      const result = await response.json();

      if (result.success) {
        showToast(
          `House ${isEditMode ? "updated" : "created"} successfully!`,
          "success"
        );

        if (isEditMode) {
          router.push("/products/houses");
        } else {
          resetForm();
        }
      } else {
        throw new Error(
          result.error || `Failed to ${isEditMode ? "update" : "create"} house`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showToast(
        `Failed to ${isEditMode ? "update" : "create"} house: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit House" : "Add New House"}
        </h1>
      </div> */}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Form Section */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>House Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">House Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter house name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="houseType">House Type *</Label>
                    <Select
                      value={formData.houseType}
                      onValueChange={(value: string) =>
                        handleSelectChange("houseType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select house type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="Guest House">Guest House</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedroom">Bedrooms</Label>
                    <Input
                      id="bedroom"
                      name="bedroom"
                      type="number"
                      value={formData.bedroom || ""}
                      onChange={handleInputChange}
                      placeholder="Number of bedrooms"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathroom">Bathrooms</Label>
                    <Input
                      id="bathroom"
                      name="bathroom"
                      type="number"
                      value={formData.bathroom || ""}
                      onChange={handleInputChange}
                      placeholder="Number of bathrooms"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parkingSpace">Parking Spaces</Label>
                    <Input
                      id="parkingSpace"
                      name="parkingSpace"
                      type="number"
                      value={formData.parkingSpace || ""}
                      onChange={handleInputChange}
                      placeholder="Number of parking spaces"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Size (sq ft)</Label>
                    <Input
                      id="size"
                      name="size"
                      type="number"
                      value={formData.size || ""}
                      onChange={handleInputChange}
                      placeholder="House size"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter house description"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Essentials</Label>
                  <div className="flex flex-wrap gap-2">
                    {essentials.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={item}
                          checked={formData.essentials.includes(item)}
                          onCheckedChange={() => toggleEssential(item)}
                        />
                        <Label htmlFor={item} className="text-sm">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Input
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      placeholder="House condition"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenance">Maintenance</Label>
                    <Input
                      id="maintenance"
                      name="maintenance"
                      value={formData.maintenance}
                      onChange={handleInputChange}
                      placeholder="Maintenance details"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price || ""}
                      onChange={handleInputChange}
                      placeholder="Enter price"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value: string) =>
                        handleSelectChange("currency", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="ETB">ETB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="advertisementType">Listing Type *</Label>
                    <Select
                      value={formData.advertisementType}
                      onValueChange={(value: "Rent" | "Sale") =>
                        handleSelectChange("advertisementType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select listing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rent">For Rent</SelectItem>
                        <SelectItem value="Sale">For Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.advertisementType === "Rent" && (
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Period</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value: string) =>
                        handleSelectChange("paymentMethod", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Reset
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {isEditMode ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>{isEditMode ? "Update House" : "Create House"}</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Image Upload Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>House Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {imagePreview ? (
                    <div className="relative w-full h-48 mb-4">
                      <Image
                        src={imagePreview}
                        alt="House preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48">
                      <Home className="h-10 w-10 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        No image selected
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="house-image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() =>
                      document.getElementById("house-image")?.click()
                    }
                    disabled={loading}
                  >
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManageHouse;
