import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log("cloudName", cloudName);
  console.log("apiKey", apiKey);
  console.log("apiSecret", apiSecret);
  console.log("process.env.CLOUDINARY_CLOUD_NAME", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("process.env.CLOUDINARY_API_KEY", process.env.CLOUDINARY_API_KEY);
  console.log("process.env.CLOUDINARY_API_SECRET", process.env.CLOUDINARY_API_SECRET);
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured");
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  configured = true;
}

export function getCloudinarySignParams(folder = "marathi-classifieds") {
  ensureConfigured();
  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!,
  );
  return {
    timestamp,
    folder,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  };
}

export { cloudinary };
