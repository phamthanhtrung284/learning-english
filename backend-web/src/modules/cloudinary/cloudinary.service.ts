import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function uploadToCloudinary(buffer: Buffer, options: Record<string, unknown> = {}): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "image", ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result!.secure_url, public_id: result!.public_id });
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    /* ignore */
  }
}
