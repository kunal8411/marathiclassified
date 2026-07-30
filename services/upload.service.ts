import { getCloudinarySignParams } from "@/lib/cloudinary";

export function getSignedUpload(folder?: string) {
  return getCloudinarySignParams(folder);
}
