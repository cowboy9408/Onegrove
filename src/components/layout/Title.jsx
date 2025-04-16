import React from "react";
import { cn } from "@/lib/utils";

export default function Title({ title, subtitle, className = "" }) {
  return (
    <div className={cn("mb-6", className)}>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}
