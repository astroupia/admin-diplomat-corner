"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  paymentMethod: "Monthly" | "Quarterly" | "Annual";
  bedroom: number;
  parkingSpace: number;
  bathroom: number;
  size: number;
  houseType: "House" | "Apartment" | "Guest House";
  condition: string;
  maintenance: string;
  essentials: string[];
  currency: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  paymentId: string;
  visiblity: "Private" | "Public";
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

export default function ManageHousesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingHouseId, setEditingHouseId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<HouseFormData>({
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

  const fetchHouses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/house");
      if (!response.ok) {
        throw new Error("Failed to fetch houses");
      }
      const data = await response.json();
      setHouses(data);
    } catch (error) {
      console.error("Error fetching houses:", error);
      showToast("Failed to load houses", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

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
    setIsEditing(false);
    setEditingHouseId(null);
  };

  const handleEdit = (house: House) => {
    setFormData({
      name: house.name,
      bedroom: house.bedroom,
      size: house.size,
      bathroom: house.bathroom,
      parkingSpace: house.parkingSpace,
      condition: house.condition || "",
      maintenance: house.maintenance || "",
      price: house.price,
      description: house.description,
      advertisementType: house.advertisementType,
      paymentMethod: house.paymentMethod,
      houseType: house.houseType,
      essentials: house.essentials || [],
      currency: house.currency || "USD",
      imageUrl: house.imageUrl,
    });
    setImagePreview(house.imageUrl || null);
    setIsEditing(true);
    setEditingHouseId(house._id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this house?")) {
      return;
    }

    try {
      const response = await fetch(`/api/house/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete house");
      }

      showToast("House deleted successfully", "success");
      fetchHouses();
    } catch (error) {
      console.error("Error deleting house:", error);
      showToast("Failed to delete house", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const apiFormData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === "object") {
            apiFormData.append(key, JSON.stringify(value));
          } else {
            apiFormData.append(key, String(value));
          }
        }
      });

      // Add a default servicePrice if not provided
      if (!apiFormData.has("servicePrice")) {
        apiFormData.append("servicePrice", "0");
      }

      if (selectedFile) {
        apiFormData.append("file", selectedFile);
      }

      const endpoint = isEditing
        ? `/api/house/${editingHouseId}`
        : "/api/house/create";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        body: apiFormData,
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to save house");
        }
        
        showToast(
          isEditing ? "House updated successfully" : "House created successfully",
          "success"
        );
        
        resetForm();
        fetchHouses();
      } else {
        // Handle non-JSON response (likely HTML error page)
        console.error("Server returned non-JSON response");
        throw new Error("Server error. Please try again later.");
      }
    } catch (error) {
      console.error("Error saving house:", error);
      showToast("Failed to save house", "error");
    }
  };

  return (
    <div className="main-content p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit House" : "Add New House"}
        </h1>
      </div>

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
                    <Label htmlFor="name">House Name</Label>
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
                    <Label htmlFor="houseType">House Type</Label>
                    <Select
                      value={formData.houseType}
                      onValueChange={(value: string) => handleSelectChange("houseType", value)}
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
                      required
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
                      required
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
                      required
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
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
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
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price || ""}
                      onChange={handleInputChange}
                      placeholder="House price"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value: string) => handleSelectChange("currency", value)}
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
                    <Label htmlFor="advertisementType">Advertisement Type</Label>
                    <Select
                      value={formData.advertisementType}
                      onValueChange={(value: string) => handleSelectChange("advertisementType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select advertisement type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sale">For Sale</SelectItem>
                        <SelectItem value="Rent">For Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.advertisementType === "Rent" && (
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value: string) => handleSelectChange("paymentMethod", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="image">House Image</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    {imagePreview && (
                      <div className="relative w-20 h-20">
                        <Image
                          src={imagePreview}
                          alt="House preview"
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                  <Button type="submit">
                    {isEditing ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update House
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add House
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Houses List Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Houses List</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading houses...</div>
              ) : houses.length === 0 ? (
                <div className="text-center py-4">No houses found</div>
              ) : (
                <div className="space-y-4">
                  {houses.map((house) => (
                    <div
                      key={house._id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{house.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {house.houseType} • {house.advertisementType}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={
                                house.status === "Active"
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                              }
                            >
                              {house.status}
                            </Badge>
                            <span className="text-sm font-medium">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: house.currency || "USD",
                              }).format(house.price)}
                              {house.advertisementType === "Rent" &&
                                ` / ${house.paymentMethod}`}
                            </span>
                          </div>
                        </div>
                        {house.imageUrl && (
                          <div className="relative w-16 h-16">
                            <Image
                              src={house.imageUrl}
                              alt={house.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(house)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(house._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 