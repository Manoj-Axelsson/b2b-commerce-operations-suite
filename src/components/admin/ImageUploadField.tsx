"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ImageUploadStatus, type UploadStatus } from "./ImageUploadStatus";

interface ImageUploadFieldProps {
  value: string | null;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
}

export function ImageUploadField({
  value,
  onChange,
  label = "Product Image",
  required = false,
}: ImageUploadFieldProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Client-side preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Validate file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Allowed: JPEG, PNG, WebP, GIF");
      setStatus("error");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      setError("File too large. Maximum: 10 MB");
      setStatus("error");
      return;
    }

    // Upload to server
    setStatus("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMessage = data.error || "Upload failed";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      onChange(data.url);
      setStatus("success");

      // Reset status after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
        {label}
        {required && " *"}
      </label>

      {/* Preview */}
      {preview && (
        <div className="relative w-full h-48 bg-gray-100 rounded border border-gray-200 overflow-hidden">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized // Allow data URLs and temporary URLs
          />
        </div>
      )}

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          status === "uploading"
            ? "border-blue-400 bg-blue-50"
            : status === "error"
              ? "border-red-400 bg-red-50"
              : status === "success"
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-yellow-400 hover:bg-yellow-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
          aria-label="Upload image file"
        />

        <ImageUploadStatus status={status} error={error} hasPreview={!!preview} />
      </div>

      {/* Current URL Display */}
      {value && (
        <div className="text-xs text-gray-500 break-all font-mono bg-gray-50 p-2 rounded">
          {value}
        </div>
      )}
    </div>
  );
}
