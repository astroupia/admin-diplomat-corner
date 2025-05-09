"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Loader2,
} from "lucide-react";
import Image from "next/image";

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
import { IAdvertisement } from "@/lib/models/advertisement.model";

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

interface AdvertisementFormProps {
  mode: "create" | "edit";
  initialData?: IAdvertisement;
  onSuccess?: () => void;
}

export function AdvertisementForm({
  mode,
  initialData,
  onSuccess,
}: AdvertisementFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [hashtags, setHashtags] = useState<string[]>(
    initialData?.hashtags || []
  );
  const [hashtagInput, setHashtagInput] = useState("");
  const [previewType, setPreviewType] = useState("desktop");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      advertisementType: initialData?.advertisementType || "banner",
      status: initialData?.status || "Draft",
      priority: initialData?.priority || "Medium",
      hashtags: initialData?.hashtags || [],
      link: initialData?.link || "",
      imageUrl: initialData?.imageUrl || "",
      targetAudience: initialData?.targetAudience || "",
      startTime: initialData?.startTime || "",
      endTime: initialData?.endTime || "",
      performanceMetrics: initialData?.performanceMetrics || "",
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

      // Set a temporary local preview using URL.createObjectURL instead of FileReader
      const localPreview = URL.createObjectURL(file);
      setImagePreview(localPreview);

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

        // Set the server-returned image URL in the form and for preview
        setValue("imageUrl", result.imageUrl);

        // Replace the local preview with the server URL once upload is complete
        URL.revokeObjectURL(localPreview);
        setImagePreview(result.imageUrl);

        console.log("Image uploaded successfully:", result.imageUrl);
      } catch (err) {
        console.error("Error uploading image:", err);
        setUploadError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );

        // Clean up the object URL on error
        URL.revokeObjectURL(localPreview);

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
        hashtags: data.hashtags || hashtags || [],
        startTime: data.startTime
          ? new Date(data.startTime).toISOString()
          : undefined,
        endTime: data.endTime
          ? new Date(data.endTime).toISOString()
          : undefined,
      };

      // Determine the endpoint based on mode
      const endpoint =
        mode === "create"
          ? "/api/advertisements"
          : `/api/advertisements/${initialData?._id}`;

      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save advertisement");
      }

      // Call the success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/advertisements");
      }
    } catch (err) {
      console.error("Error saving advertisement:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center",
                currentStep === step.id
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border",
                  currentStep === step.id
                    ? "border-primary bg-primary text-white"
                    : "border-muted-foreground"
                )}
              >
                {step.id}
              </div>
              <span className="ml-2">{step.name}</span>
              {step.id !== steps.length && (
                <ArrowRight className="w-4 h-4 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <Tabs value={currentStep.toString()} className="space-y-8">
        <TabsContent value="1">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of your advertisement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    placeholder="Enter advertisement title"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Enter advertisement description"
                    className="min-h-[100px]"
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type">Advertisement Type</Label>
                  <Select
                    value={form.watch("advertisementType")}
                    onValueChange={(value) =>
                      form.setValue("advertisementType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="popup">Popup</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="inContent">In-Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => router.back()}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!form.formState.isValid}
              >
                Next Step
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="2">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Configure how your advertisement looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Advertisement Image</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                    {imagePreview && (
                      <div className="relative w-20 h-20">
                        <div className="relative w-full h-full">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            width={80}
                            height={80}
                            className="object-cover rounded-md w-full h-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {uploadError && (
                    <p className="text-sm text-red-500 mt-2">{uploadError}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="link">Destination URL</Label>
                  <div className="flex items-center space-x-2">
                    <Link2 className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="link"
                      {...form.register("link")}
                      placeholder="https://example.com"
                      type="url"
                    />
                  </div>
                  {form.formState.errors.link && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.link.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Hashtags</Label>
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <Input
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Add hashtags"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddHashtag}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {hashtags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveHashtag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                Previous
              </Button>
              <Button type="button" onClick={() => setCurrentStep(3)}>
                Next Step
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="3">
          <Card>
            <CardHeader>
              <CardTitle>Targeting & Schedule</CardTitle>
              <CardDescription>
                Define your target audience and schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="targetAudience"
                      {...form.register("targetAudience")}
                      placeholder="Define your target audience"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="datetime-local"
                        {...form.register("startTime")}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="datetime-local"
                        {...form.register("endTime")}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Priority</Label>
                  <RadioGroup
                    value={form.watch("priority")}
                    onValueChange={(value) =>
                      form.setValue(
                        "priority",
                        value as "High" | "Medium" | "Low"
                      )
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="High" id="high" />
                      <Label htmlFor="high">High</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Medium" id="medium" />
                      <Label htmlFor="medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Low" id="low" />
                      <Label htmlFor="low">Low</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Performance Goals</Label>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    <Textarea
                      {...form.register("performanceMetrics")}
                      placeholder="Define your performance goals"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
              >
                Previous
              </Button>
              <Button type="button" onClick={() => setCurrentStep(4)}>
                Review
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="4">
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>
                Review your advertisement details before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Basic Information</h3>
                  <div className="mt-2 space-y-2">
                    <p>
                      <span className="font-medium">Title:</span>{" "}
                      {form.watch("title")}
                    </p>
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {form.watch("advertisementType")}
                    </p>
                    <p>
                      <span className="font-medium">Description:</span>{" "}
                      {form.watch("description")}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Appearance</h3>
                  <div className="mt-2 space-y-2">
                    {imagePreview && (
                      <div className="relative w-40 h-40">
                        <div className="relative w-full h-full">
                          <Image
                            src={imagePreview}
                            alt="Advertisement preview"
                            width={160}
                            height={160}
                            className="object-cover rounded-md w-full h-full"
                          />
                        </div>
                      </div>
                    )}
                    <p>
                      <span className="font-medium">Link:</span>{" "}
                      {form.watch("link")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Targeting & Schedule</h3>
                  <div className="mt-2 space-y-2">
                    <p>
                      <span className="font-medium">Target Audience:</span>{" "}
                      {form.watch("targetAudience")}
                    </p>
                    <p>
                      <span className="font-medium">Start Date:</span>{" "}
                      {(() => {
                        const startTime = form.watch("startTime");
                        return startTime &&
                          typeof startTime === "string" &&
                          startTime.length > 0
                          ? format(new Date(startTime), "PPP 'at' p")
                          : "Not set";
                      })()}
                    </p>
                    <p>
                      <span className="font-medium">End Date:</span>{" "}
                      {(() => {
                        const endTime = form.watch("endTime");
                        return endTime &&
                          typeof endTime === "string" &&
                          endTime.length > 0
                          ? format(new Date(endTime), "PPP 'at' p")
                          : "Not set";
                      })()}
                    </p>
                    <p>
                      <span className="font-medium">Priority:</span>{" "}
                      {form.watch("priority")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(3)}
              >
                Previous
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {mode === "create" ? "Creating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    {mode === "create"
                      ? "Create Advertisement"
                      : "Save Changes"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="p-4 mt-4 text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}
    </form>
  );
}
