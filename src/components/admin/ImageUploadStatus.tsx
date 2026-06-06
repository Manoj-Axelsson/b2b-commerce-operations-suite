"use client";

import React from "react";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

interface ImageUploadStatusProps {
  status: UploadStatus;
  error?: string | null;
  hasPreview: boolean;
}

export function ImageUploadStatus({
  status,
  error = null,
  hasPreview,
}: ImageUploadStatusProps) {
  if (status === "uploading") {
    return (
      <div className="space-y-2">
        <div className="inline-block">
          <div className="animate-spin" aria-hidden="true">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>
        <p className="text-sm text-blue-600 font-semibold">Uploading...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="space-y-1">
        <svg className="h-8 w-8 text-green-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm text-green-700 font-semibold">Upload successful!</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-1">
        <svg className="h-8 w-8 text-red-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <p className="text-sm text-red-700 font-semibold">Upload failed</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (hasPreview) {
    return (
      <div className="space-y-1">
        <p className="text-sm text-gray-600">Click to change image</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <svg className="h-8 w-8 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <p className="text-sm text-gray-600">
        Click to upload or drag and drop
      </p>
      <p className="text-xs text-gray-400">
        PNG, JPG, WebP, GIF up to 10 MB
      </p>
    </div>
  );
}
