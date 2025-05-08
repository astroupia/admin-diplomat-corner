"use client";

import type React from "react";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  ArrowLeft,
  ArrowRight,
  Upload,
  Hash,
  Link2,
  BarChart3,
  Users,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Form schema based on the advertisement model
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  targetAudience: z.string().optional(),
  advertisementType: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(["Active", "Inactive", "Scheduled", "Expired", "Draft"]),
  priority: z.enum(["High", "Medium", "Low"]),
  performanceMetrics: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  link: z.string().url({ message: "Please enter a valid URL" }),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateAdvertisementPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [previewType, setPreviewType] = useState("desktop");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      advertisementType: "banner",
      status: "Draft",
      priority: "Medium",
      hashtags: [],
      link: "",
    },
  });

  const { watch, setValue, formState } = form;
  const watchedValues = watch();

  const steps = [
    { id: 1, name: "Basic Info" },
    { id: 2, name: "Appearance" },
    { id: 3, name: "Targeting" },
    { id: 4, name: "Review" },
  ];

  const handleAddHashtag = () => {
    if (hashtagInput && !hashtags.includes(hashtagInput)) {
      const newHashtags = [
        ...hashtags,
        hashtagInput.startsWith("#") ? hashtagInput : `#${hashtagInput}`,
      ];
      setHashtags(newHashtags);
      setValue("hashtags", newHashtags);
      setHashtagInput("");
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    const newHashtags = hashtags.filter((t) => t !== tag);
    setHashtags(newHashtags);
    setValue("hashtags", newHashtags);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && hashtagInput) {
      e.preventDefault();
      handleAddHashtag();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Preview the image locally
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload the file
      try {
        setIsUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/advertisements/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to upload image");
        }

        // Set the image URL in the form
        setValue("imageUrl", result.imageUrl);
        console.log("Image uploaded successfully:", result.imageUrl);
      } catch (err) {
        console.error("Error uploading image:", err);
        setUploadError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Prepare the data for submission
      const submissionData = {
        ...data,
        // If hashtags is undefined, provide an empty array
        hashtags: data.hashtags || hashtags || [],
        // Convert date objects to ISO strings
        startTime: data.startTime
          ? new Date(data.startTime).toISOString()
          : undefined,
        endTime: data.endTime
          ? new Date(data.endTime).toISOString()
          : undefined,
        // Include the image URL if available
        imageUrl: data.imageUrl || undefined,
      };

      // Send the data to your API
      const response = await fetch("/api/advertisements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create advertisement");
      }

      // Successfully created advertisement
      console.log("Advertisement created:", result.advertisement);

      // Redirect to the advertisements list
      router.push("/advertisements");
    } catch (err) {
      console.error("Error creating advertisement:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      // Go back to the form step
      setCurrentStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-content p-6 md:p-8 max-w-6xl py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/advertisements">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Advertisement
          </h1>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Progress Steps */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2"></div>
        <ol className="relative flex justify-between">
          {steps.map((step) => (
            <li key={step.id} className="flex items-center">
              <div
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background z-10",
                  currentStep >= step.id
                    ? "border-primary"
                    : "border-muted-foreground/30"
                )}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <span
                    className={cn(
                      "text-sm font-medium",
                      currentStep >= step.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.id}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "absolute top-12 text-xs font-medium",
                  currentStep >= step.id
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {step.name}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-12">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="grid gap-8 md:grid-cols-2 animate-in fade-in slide-in-from-left duration-500">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the core details of your advertisement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter a compelling title"
                    {...form.register("title")}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your advertisement"
                    className="min-h-[120px] resize-none"
                    {...form.register("description")}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">
                    Destination URL <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="link"
                      placeholder="https://example.com/landing-page"
                      {...form.register("link")}
                    />
                  </div>
                  {form.formState.errors.link && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.link.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    defaultValue="Draft"
                    onValueChange={(value) =>
                      setValue(
                        "status",
                        value as
                          | "Active"
                          | "Inactive"
                          | "Scheduled"
                          | "Expired"
                          | "Draft"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduling</CardTitle>
                <CardDescription>
                  Set when your advertisement should run
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {watchedValues.startTime ? (
                            format(new Date(watchedValues.startTime), "PPP")
                          ) : (
                            <span className="text-muted-foreground">
                              Pick a date
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            watchedValues.startTime
                              ? new Date(watchedValues.startTime)
                              : undefined
                          }
                          onSelect={(date: Date | undefined) =>
                            setValue(
                              "startTime",
                              date ? date.toISOString() : undefined
                            )
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {watchedValues.endTime ? (
                            format(new Date(watchedValues.endTime), "PPP")
                          ) : (
                            <span className="text-muted-foreground">
                              Pick a date
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            watchedValues.endTime
                              ? new Date(watchedValues.endTime)
                              : undefined
                          }
                          onSelect={(date: Date | undefined) =>
                            setValue(
                              "endTime",
                              date ? date.toISOString() : undefined
                            )
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <RadioGroup
                    defaultValue="Medium"
                    onValueChange={(value) =>
                      setValue("priority", value as "High" | "Medium" | "Low")
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="High" id="high" />
                      <Label htmlFor="high" className="flex items-center">
                        <Badge className="mr-1 bg-red-100 text-red-800 hover:bg-red-100">
                          High
                        </Badge>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Medium" id="medium" />
                      <Label htmlFor="medium" className="flex items-center">
                        <Badge className="mr-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
                          Medium
                        </Badge>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Low" id="low" />
                      <Label htmlFor="low" className="flex items-center">
                        <Badge className="mr-1 bg-green-100 text-green-800 hover:bg-green-100">
                          Low
                        </Badge>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Hashtags</Label>
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Add hashtag and press Enter"
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button type="button" size="sm" onClick={handleAddHashtag}>
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {hashtags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {tag}
                        <button
                          type="button"
                          className="ml-2 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemoveHashtag(tag)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Appearance */}
        {currentStep === 2 && (
          <div className="grid gap-8 md:grid-cols-2 animate-in fade-in slide-in-from-left duration-500">
            <Card>
              <CardHeader>
                <CardTitle>Advertisement Appearance</CardTitle>
                <CardDescription>
                  Configure how your advertisement will look
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="image">Advertisement Image</Label>
                    <div className="mt-2">
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isUploading ? (
                          <div className="flex items-center justify-center h-40">
                            <div className="flex flex-col items-center">
                              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                              <span className="mt-2 text-sm text-gray-500">
                                Uploading...
                              </span>
                            </div>
                          </div>
                        ) : imagePreview ? (
                          <div className="relative h-40">
                            <Image
                              src={imagePreview}
                              alt="Advertisement Preview"
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                Change Image
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-40">
                            <Upload className="h-10 w-10 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">
                              Click to upload an image for your advertisement
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Recommended size: 1200x628px
                            </p>
                          </div>
                        )}
                      </div>
                      <input
                        id="image"
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                    {uploadError && (
                      <p className="text-red-500 text-sm mt-1">{uploadError}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="advertisementType">
                      Advertisement Type
                    </Label>
                    <RadioGroup
                      defaultValue={watchedValues.advertisementType || "banner"}
                      onValueChange={(value) =>
                        setValue("advertisementType", value)
                      }
                      className="grid grid-cols-1 gap-4"
                    >
                      <div className="relative">
                        <RadioGroupItem
                          value="banner"
                          id="banner"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="banner"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <div className="w-full h-24 bg-gradient-to-r from-primary/20 to-primary/40 rounded-md flex items-center justify-center mb-4">
                            <span className="text-sm font-medium">
                              Banner Advertisement
                            </span>
                          </div>
                          <div className="text-sm font-medium">
                            Banner (728×90)
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Horizontal banner that appears at the top or bottom
                            of a page
                          </div>
                        </Label>
                      </div>

                      <div className="relative">
                        <RadioGroupItem
                          value="sidebar"
                          id="sidebar"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="sidebar"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <div className="w-32 h-32 bg-gradient-to-r from-primary/20 to-primary/40 rounded-md flex items-center justify-center mb-4">
                            <span className="text-sm font-medium">
                              Sidebar Ad
                            </span>
                          </div>
                          <div className="text-sm font-medium">
                            Sidebar (300×250)
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Rectangle ad that appears in the sidebar of a page
                          </div>
                        </Label>
                      </div>

                      <div className="relative">
                        <RadioGroupItem
                          value="popup"
                          id="popup"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="popup"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <div className="w-full h-40 bg-gradient-to-r from-primary/20 to-primary/40 rounded-md flex items-center justify-center mb-4">
                            <span className="text-sm font-medium">
                              Popup Advertisement
                            </span>
                          </div>
                          <div className="text-sm font-medium">
                            Popup (550×450)
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Modal popup that appears over the content
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Media Upload</CardTitle>
                <CardDescription>
                  Upload images or videos for your advertisement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Upload media</h3>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports: JPG, PNG, GIF, MP4 (max 10MB)
                    </p>
                  </div>
                  <Button variant="outline" className="mt-4">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Preview</Label>
                  <Tabs defaultValue="desktop" onValueChange={setPreviewType}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="desktop">Desktop</TabsTrigger>
                      <TabsTrigger value="tablet">Tablet</TabsTrigger>
                      <TabsTrigger value="mobile">Mobile</TabsTrigger>
                    </TabsList>
                    <TabsContent value="desktop" className="mt-4">
                      <div className="border rounded-lg p-4 aspect-video bg-muted flex items-center justify-center">
                        <div
                          className={cn(
                            "bg-gradient-to-r from-primary/20 to-primary/40 flex items-center justify-center text-center p-4 rounded",
                            watchedValues.advertisementType === "banner"
                              ? "w-full h-24"
                              : watchedValues.advertisementType === "sidebar"
                              ? "w-64 h-64"
                              : "w-3/4 h-3/4"
                          )}
                        >
                          <div className="space-y-2">
                            <p className="font-medium">
                              {watchedValues.title || "Advertisement Title"}
                            </p>
                            <p className="text-xs">
                              {watchedValues.description?.substring(0, 50) ||
                                "Advertisement description will appear here"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="tablet" className="mt-4">
                      <div className="border rounded-lg p-4 max-w-md mx-auto aspect-[4/3] bg-muted flex items-center justify-center">
                        <div
                          className={cn(
                            "bg-gradient-to-r from-primary/20 to-primary/40 flex items-center justify-center text-center p-4 rounded",
                            watchedValues.advertisementType === "banner"
                              ? "w-full h-16"
                              : watchedValues.advertisementType === "sidebar"
                              ? "w-48 h-48"
                              : "w-3/4 h-3/4"
                          )}
                        >
                          <div className="space-y-2">
                            <p className="font-medium">
                              {watchedValues.title || "Advertisement Title"}
                            </p>
                            <p className="text-xs">
                              {watchedValues.description?.substring(0, 30) ||
                                "Advertisement description"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="mobile" className="mt-4">
                      <div className="border rounded-lg p-4 max-w-xs mx-auto aspect-[9/16] bg-muted flex items-center justify-center">
                        <div
                          className={cn(
                            "bg-gradient-to-r from-primary/20 to-primary/40 flex items-center justify-center text-center p-4 rounded",
                            watchedValues.advertisementType === "banner"
                              ? "w-full h-12"
                              : watchedValues.advertisementType === "sidebar"
                              ? "w-32 h-32"
                              : "w-3/4 h-1/2"
                          )}
                        >
                          <div className="space-y-2">
                            <p className="font-medium text-sm">
                              {watchedValues.title || "Ad Title"}
                            </p>
                            <p className="text-xs">
                              {watchedValues.description?.substring(0, 20) ||
                                "Ad description"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Targeting */}
        {currentStep === 3 && (
          <div className="grid gap-8 md:grid-cols-2 animate-in fade-in slide-in-from-left duration-500">
            <Card>
              <CardHeader>
                <CardTitle>Audience Targeting</CardTitle>
                <CardDescription>
                  Define who should see your advertisement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="targetAudience"
                      placeholder="e.g., Young professionals, 25-34"
                      {...form.register("targetAudience")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Demographics</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-24">18-24</SelectItem>
                      <SelectItem value="25-34">25-34</SelectItem>
                      <SelectItem value="35-44">35-44</SelectItem>
                      <SelectItem value="45-54">45-54</SelectItem>
                      <SelectItem value="55+">55+</SelectItem>
                      <SelectItem value="all">All ages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Interests</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interests" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="food">Food & Dining</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="health">Health & Fitness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="north-america">
                        North America
                      </SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                      <SelectItem value="australia">Australia</SelectItem>
                      <SelectItem value="africa">Africa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Set your performance goals and tracking options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="performanceMetrics">Performance Goals</Label>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="performanceMetrics"
                      placeholder="e.g., 5% CTR, 1000 conversions"
                      {...form.register("performanceMetrics")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tracking Options</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="track-clicks">Track Clicks</Label>
                        <p className="text-xs text-muted-foreground">
                          Record when users click on your advertisement
                        </p>
                      </div>
                      <Switch id="track-clicks" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="track-views">Track Views</Label>
                        <p className="text-xs text-muted-foreground">
                          Record when your advertisement is viewed
                        </p>
                      </div>
                      <Switch id="track-views" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="track-device">Track Device Info</Label>
                        <p className="text-xs text-muted-foreground">
                          Collect information about user devices
                        </p>
                      </div>
                      <Switch id="track-device" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Display Frequency</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        Low (1-2 times per session)
                      </SelectItem>
                      <SelectItem value="medium">
                        Medium (3-5 times per session)
                      </SelectItem>
                      <SelectItem value="high">
                        High (6+ times per session)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="animate-in fade-in slide-in-from-left duration-500">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Advertisement</CardTitle>
                <CardDescription>
                  Review all details before creating your advertisement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Basic Information
                      </h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Title:</span>
                          <span className="text-sm font-medium">
                            {watchedValues.title || "Not provided"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Type:</span>
                          <span className="text-sm font-medium">
                            {watchedValues.advertisementType || "Not selected"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Status:</span>
                          <Badge variant="outline">
                            {watchedValues.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Priority:</span>
                          <Badge
                            className={cn(
                              watchedValues.priority === "High"
                                ? "bg-red-100 text-red-800 hover:bg-red-100"
                                : watchedValues.priority === "Medium"
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                : "bg-green-100 text-green-800 hover:bg-green-100"
                            )}
                          >
                            {watchedValues.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Scheduling
                      </h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Start Date:</span>
                          <span className="text-sm font-medium">
                            {watchedValues.startTime
                              ? format(new Date(watchedValues.startTime), "PPP")
                              : "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">End Date:</span>
                          <span className="text-sm font-medium">
                            {watchedValues.endTime
                              ? format(new Date(watchedValues.endTime), "PPP")
                              : "Not set"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Targeting
                      </h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Target Audience:</span>
                          <span className="text-sm font-medium">
                            {watchedValues.targetAudience || "Not specified"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Performance Goals:</span>
                          <span className="text-sm font-medium">
                            {watchedValues.performanceMetrics ||
                              "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Description
                      </h3>
                      <p className="mt-2 text-sm border rounded-md p-3 bg-muted/50">
                        {watchedValues.description || "No description provided"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Destination URL
                      </h3>
                      <p className="mt-2 text-sm border rounded-md p-3 bg-muted/50 break-all">
                        {watchedValues.link || "No URL provided"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Hashtags
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {hashtags.length > 0 ? (
                          hashtags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No hashtags added
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Preview
                      </h3>
                      <div className="mt-2 border rounded-md p-3 aspect-video bg-muted flex items-center justify-center">
                        <div
                          className={cn(
                            "bg-gradient-to-r from-primary/20 to-primary/40 flex items-center justify-center text-center p-4 rounded",
                            watchedValues.advertisementType === "banner"
                              ? "w-full h-24"
                              : watchedValues.advertisementType === "sidebar"
                              ? "w-64 h-64"
                              : "w-3/4 h-3/4"
                          )}
                        >
                          <div className="space-y-2">
                            <p className="font-medium">
                              {watchedValues.title || "Advertisement Title"}
                            </p>
                            <p className="text-xs">
                              {watchedValues.description?.substring(0, 50) ||
                                "Advertisement description will appear here"}
                            </p>
                            {hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1 justify-center">
                                {hashtags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs text-primary"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {hashtags.length > 3 && (
                                  <span className="text-xs text-primary">
                                    +{hashtags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  disabled={isSubmitting}
                >
                  Back to Targeting
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Creating...
                    </>
                  ) : (
                    "Create Advertisement"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1 || isSubmitting}
            >
              Previous Step
            </Button>
            <Button
              type="button"
              onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
              className="gap-2"
              disabled={isSubmitting}
            >
              {currentStep === 3 ? "Review" : "Next Step"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
