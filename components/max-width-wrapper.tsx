import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return <div className={cn("w-full h-full", className)}>{children}</div>;
};

export default MaxWidthWrapper;
