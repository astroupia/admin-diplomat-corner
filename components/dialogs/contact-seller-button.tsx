"use client"

import { useState } from "react"
import { Phone } from "lucide-react"
import ContactSellerDialog from "./contact-seller-dialog"

interface ContactSellerButtonProps {
  productType?: "car" | "house" | "item"
  sellerName?: string
  className?: string
  variant?: "primary" | "outline" | "secondary"
}

export default function ContactSellerButton({
  productType = "item",
  sellerName = "the seller",
  className = "",
  variant = "primary",
}: ContactSellerButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Determine button styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case "outline":
        return "bg-white border border-primary text-primary hover:bg-primary/5"
      case "secondary":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      case "primary":
      default:
        return "bg-primary text-white hover:bg-primary/90"
    }
  }

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${getButtonStyles()} ${className}`}
      >
        <Phone className="h-5 w-5" />
        <span>Contact {sellerName}</span>
      </button>

      <ContactSellerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        productType={productType}
        sellerName={sellerName}
      />
    </>
  )
}
