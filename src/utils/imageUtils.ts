import { MAX_FILE_SIZE, SUPPORTED_IMAGE_TYPES } from "@/constants/summary";

export const validateFile = (file: File): string | null => {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return "กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "ขนาดไฟล์ต้องไม่เกิน 5MB";
  }
  return null;
};

export const getEventCoordinates = (
  e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement | null
) => {
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  let clientX: number, clientY: number;

  if ("touches" in e) {
    const touch = e.touches[0] || e.changedTouches[0];
    if (!touch) return { x: 0, y: 0 };
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  const x = Math.max(
    0,
    Math.min(canvas.width, (clientX - rect.left) * scaleX)
  );
  const y = Math.max(
    0,
    Math.min(canvas.height, (clientY - rect.top) * scaleY)
  );

  return { x, y };
};
