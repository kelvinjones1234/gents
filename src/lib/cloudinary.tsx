import { v2 as cloudinary } from "cloudinary";

// Match the exact names in your .env.local
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
}); 

export const uploadImage = async (file: File, folder: string) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{ publicId: string; url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: "auto" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Stream Error:", error);
          reject(error);
          return;
        }
        if (result) {
          resolve({ publicId: result.public_id, url: result.secure_url });
        }
      }
    );
    
    uploadStream.end(buffer);
  });
};

export default cloudinary;