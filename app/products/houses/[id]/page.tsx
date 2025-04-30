"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X } from "lucide-react";
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

interface Payment {
  _id: string;
  paymentId: string;
  servicePrice: number;
  receiptUrl: string;
  uploadedAt: string;
  productId: string;
  productType: "house" | "car";
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function HouseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [house, setHouse] = useState<House | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHouseDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/house/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch house details");
        }
        const data = await response.json();
        setHouse(data);
        
        // Fetch payment details if paymentId exists
        if (data.paymentId) {
          const paymentResponse = await fetch(`/api/payment/${data.paymentId}`);
          if (paymentResponse.ok) {
            const paymentData = await paymentResponse.json();
            setPayment(paymentData);
          } else {
            console.error("Failed to fetch payment:", await paymentResponse.text());
          }
        }
      } catch (error) {
        console.error("Error fetching house details:", error);
        showToast("Failed to load house details", "error");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchHouseDetails();
    }
  }, [params.id, showToast]);

  const handleStatusChange = async (newStatus: "Pending" | "Active") => {
    try {
      const response = await fetch(`/api/house/${params.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update house status");
      }

      showToast(`House status updated to ${newStatus}`, "success");
      
      // Refresh house details
      const updatedResponse = await fetch(`/api/house/${params.id}`);
      if (updatedResponse.ok) {
        const data = await updatedResponse.json();
        setHouse(data);
      }
    } catch (error) {
      console.error("Error updating house status:", error);
      showToast("Failed to update house status", "error");
    }
  };

  if (loading) {
    return (
      <div className="main-content p-4 md:p-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="text-center">Loading house details...</div>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="main-content p-4 md:p-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="text-center">House not found</div>
      </div>
    );
  }

  return (
    <div className="main-content p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {house.status === "Pending" && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="text-red-500 border-red-500 hover:bg-red-50"
              onClick={() => handleStatusChange("Pending")}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button 
              variant="default" 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => handleStatusChange("Active")}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{house.name}</CardTitle>
              <Badge
                className={
                  house.status === "Active"
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }
              >
                {house.status}
              </Badge>
            </div>
            <CardDescription>
              {house.houseType} • {house.advertisementType}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">{house.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Price</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: house.currency || "USD",
                    }).format(house.price)}
                    {house.advertisementType === "Rent" && ` / ${house.paymentMethod}`}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Size</h3>
                  <p className="text-sm text-muted-foreground">{house.size} sq ft</p>
                </div>
                <div>
                  <h3 className="font-medium">Bedrooms</h3>
                  <p className="text-sm text-muted-foreground">{house.bedroom}</p>
                </div>
                <div>
                  <h3 className="font-medium">Bathrooms</h3>
                  <p className="text-sm text-muted-foreground">{house.bathroom}</p>
                </div>
                <div>
                  <h3 className="font-medium">Parking Spaces</h3>
                  <p className="text-sm text-muted-foreground">{house.parkingSpace}</p>
                </div>
                <div>
                  <h3 className="font-medium">Condition</h3>
                  <p className="text-sm text-muted-foreground">{house.condition || "N/A"}</p>
                </div>
              </div>
              
              {house.essentials && house.essentials.length > 0 && (
                <div>
                  <h3 className="font-medium">Essentials</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {house.essentials.map((item, index) => (
                      <Badge key={index} variant="outline">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {house.maintenance && (
                <div>
                  <h3 className="font-medium">Maintenance</h3>
                  <p className="text-sm text-muted-foreground">{house.maintenance}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Created: {new Date(house.createdAt || "").toLocaleDateString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Updated: {new Date(house.updatedAt || "").toLocaleDateString()}
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Payment details for this listing</CardDescription>
          </CardHeader>
          <CardContent>
            {payment ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Amount</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: house.currency || "USD",
                      }).format(payment.servicePrice)}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Payment ID</h3>
                    <p className="text-sm text-muted-foreground">{payment.paymentId}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Product Type</h3>
                    <p className="text-sm text-muted-foreground capitalize">{payment.productType}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Uploaded</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {payment.receiptUrl && (
                  <div>
                    <h3 className="font-medium mb-2">Payment Receipt</h3>
                    <div className="relative w-full h-80 border rounded-md overflow-hidden bg-gray-50">
                      <Image 
                        src={payment.receiptUrl} 
                        alt="Payment Receipt" 
                        fill
                        className="object-contain"
                        priority
                        onError={(e) => {
                          console.error("Error loading receipt image");
                          // Fallback to a placeholder or show an error message
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <a 
                        href={payment.receiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View full receipt
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No payment information available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
