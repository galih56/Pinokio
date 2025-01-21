import { z } from 'zod';

export const datetimeSchema = z.preprocess(
    (arg) => (typeof arg === "string" || arg instanceof Date ? new Date(arg) : arg),
    z.date()
  ).refine(date => !isNaN(date.getTime()), {
    message: 'Invalid date format. Please provide a valid date.',
  });
  
// Helper for validating Base64 image size
export const validateBase64ImageSize = (base64: string, maxSizeInMB: number): boolean => {
    const stringLength = base64.length - (base64.indexOf(",") + 1);
    const sizeInBytes = (4 * Math.ceil(stringLength / 3)) * 0.5624896334383812; // Approximation for Base64 size
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB <= maxSizeInMB;
  };
  
// Refinement for Base64 images
export const base64ImageSchema = z
    .string()
    .nonempty({ message: "Photo is required." })
    .refine((base64) => base64.startsWith("data:image/"), {
      message: "Invalid photo format. Must be a valid image.",
    })
    .refine((base64) => validateBase64ImageSize(base64, 2), {
      message: "Image size must be under 2MB.",
    });
  
export const fileSchema = z
    .instanceof(File)
    .refine((file) => ["image/png", "image/jpeg", "image/webp"].includes(file.type), {
        message: "Only PNG or JPG files are allowed.",
    });
// Schema for location
export const longitudeSchema = z
  .number({ required_error: "Longitude is required." })
  .min(-180, "Longitude must be greater than or equal to -180.")
  .max(180, "Longitude must be less than or equal to 180.").nullable();

export const latitudeSchema = z
  .number({ required_error: "Latitude is required." })
  .min(-90, "Latitude must be greater than or equal to -90.")
  .max(90, "Latitude must be less than or equal to 90.").nullable();

export const locationSchema = z.object({
    longitude: longitudeSchema,
    latitude: latitudeSchema,
});
  