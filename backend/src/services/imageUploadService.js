import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { AppError } from "../utils/AppError.js";

const ALLOWED_MIME_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadImagePayload({ image, filename: _filename }) {
  if (!image || typeof image !== "string") {
    throw AppError.badRequest("Image payload is required as a base64 or data URL string.", "INVALID_IMAGE_PAYLOAD");
  }

  let mimeType = "image/jpeg";
  let base64Data = image;

  const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (matches) {
    mimeType = matches[1].toLowerCase();
    base64Data = matches[2];
  }

  if (!ALLOWED_MIME_TYPES[mimeType]) {
    throw AppError.badRequest(`Unsupported image type "${mimeType}". Allowed: JPEG, PNG, WebP, GIF.`, "UNSUPPORTED_IMAGE_TYPE");
  }

  const buffer = Buffer.from(base64Data, "base64");
  if (buffer.length > MAX_SIZE_BYTES) {
    throw AppError.badRequest(`Image exceeds maximum allowed size of 5 MB (received ${(buffer.length / (1024 * 1024)).toFixed(2)} MB).`, "IMAGE_TOO_LARGE");
  }

  // Cloudinary direct integration if credentials are provided in .env
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const signatureStr = `timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

      const formData = new URLSearchParams();
      formData.append("file", `data:${mimeType};base64,${base64Data}`);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);

      const resp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();
      if (data.secure_url) {
        return { url: data.secure_url, publicId: data.public_id };
      }
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back to persistent local storage:", err.message);
    }
  }

  // Local persistent disk storage under public/uploads/products/
  const ext = ALLOWED_MIME_TYPES[mimeType];
  const safeName = `prod_${Date.now()}_${crypto.randomBytes(8).toString("hex")}.${ext}`;
  const uploadDir = path.resolve(process.cwd(), "public/uploads/products");
  await fs.mkdir(uploadDir, { recursive: true });

  const targetPath = path.join(uploadDir, safeName);
  await fs.writeFile(targetPath, buffer);

  return {
    url: `/uploads/products/${safeName}`,
    filename: safeName,
    size: buffer.length,
    mimeType,
  };
}
