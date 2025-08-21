// Storage keys
export const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY;
export const DIVIDER_KEY = process.env.NEXT_PUBLIC_DIVIDER_KEY;
export const PAYMENT_KEY = process.env.NEXT_PUBLIC_PAYMENT_KEY || "checkbill_payment_info";

// File upload constants
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/webp",
];
