/**
 * POST /api/admin/upload
 * Handles authenticated file uploads to Cloudinary.
 *
 * Authorization: Admin users only (verified via session).
 * Request: multipart/form-data with 'file' field
 * Response: { url: string, publicId: string } or error message
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkIsAdmin } from "@/lib/utils";
import { getCloudinaryConfig } from "@/lib/cloudinary";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Helper function to upload file to Cloudinary using stream API
 */
function uploadToCloudinary(buffer: Buffer): Promise<{ secure_url: string; public_id: string; bytes: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "b2b-products",
        resource_type: "auto",
        use_filename: false,
        unique_filename: true,
        timeout: 60000,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error("No result returned from upload"));
          return;
        }
        resolve(result);
      }
    );

    uploadStream.on("error", (error) => {
      reject(error);
    });

    uploadStream.end(buffer);
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // ===== AUTHENTICATION =====
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || !checkIsAdmin(session.user)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // ===== VALIDATION =====
    getCloudinaryConfig(); // Validate config is set up

    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Missing Cloudinary API credentials in environment variables");
      return NextResponse.json(
        { error: "Server misconfiguration: Cloudinary API credentials not set" },
        { status: 500 }
      );
    }

    // ===== PARSE REQUEST =====
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // ===== VALIDATE FILE =====
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed types: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    const maxFileSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size: 10 MB" },
        { status: 400 }
      );
    }

    // ===== CONVERT FILE TO BUFFER =====
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ===== UPLOAD TO CLOUDINARY =====
    const result = await uploadToCloudinary(buffer);

    return NextResponse.json(
      {
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
        width: result.width,
        height: result.height,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload endpoint error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

