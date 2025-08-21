"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { X, Crop, RotateCcw, Check, Loader2, Image } from "lucide-react";
import { CropArea } from "@/types/summary";
import { getEventCoordinates } from "@/utils/imageUtils";

interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
  onUseOriginal?: (originalImage: string) => void;
}

export default function ImageCropper({
  imageSrc,
  onCrop,
  onCancel,
  onUseOriginal,
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Optimized drawing function with requestAnimationFrame
  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    requestAnimationFrame(() => {
      // Clear and draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);

      // Draw crop overlay with smooth animation
      if (cropArea.width > 0 && cropArea.height > 0) {
        // Darken background
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Clear and redraw crop area
        ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
        ctx.drawImage(
          image,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height
        );

        // Enhanced border with glow effect
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#3b82f6";
        ctx.shadowBlur = 10;
        ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
        ctx.shadowBlur = 0;

        // Corner indicators for better UX
        ctx.fillStyle = "#3b82f6";
        const corners = [
          { x: cropArea.x, y: cropArea.y },
          { x: cropArea.x + cropArea.width, y: cropArea.y },
          { x: cropArea.x, y: cropArea.y + cropArea.height },
          { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height },
        ];

        corners.forEach((corner) => {
          ctx.fillRect(corner.x - 2, corner.y - 2, 4, 4);
        });
      }
    });
  }, [cropArea, imageLoaded]);

  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;

    if (!image || !canvas) return;

    const handleImageLoad = () => {
      // ใช้ขนาดเต็มของภาพต้นฉบับ
      const { naturalWidth: width, naturalHeight: height } = image;

      canvas.width = width;
      canvas.height = height;
      setImageLoaded(true);
    };

    image.onload = handleImageLoad;

    if (image.complete) {
      handleImageLoad();
    }
  }, [imageSrc]);

  useEffect(() => {
    if (imageLoaded) {
      drawImage();
    }
  }, [drawImage, imageLoaded]);

  // Touch and mouse event handlers with improved responsiveness
  const handleStart = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
    ) => {
      e.preventDefault();
      const { x, y } = getEventCoordinates(e, canvasRef.current);
      setStartPos({ x, y });
      setIsDrawing(true);
    },
    []
  );

  const handleMove = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
    ) => {
      if (!isDrawing) return;
      e.preventDefault();

      const { x, y } = getEventCoordinates(e, canvasRef.current);
      const width = Math.abs(x - startPos.x);
      const height = Math.abs(y - startPos.y);
      const cropX = Math.min(startPos.x, x);
      const cropY = Math.min(startPos.y, y);

      setCropArea({ x: cropX, y: cropY, width, height });
    },
    [isDrawing, startPos]
  );

  const handleEnd = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
    ) => {
      e.preventDefault();
      setIsDrawing(false);
    },
    []
  );

  // Enhanced crop function with better quality
  const handleCrop = useCallback(async () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (
      !canvas ||
      !image ||
      !imageLoaded ||
      cropArea.width === 0 ||
      cropArea.height === 0
    ) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create high-quality crop canvas
      const cropCanvas = document.createElement("canvas");
      const cropCtx = cropCanvas.getContext("2d");
      if (!cropCtx) throw new Error("Failed to create crop context");

      // Set canvas size to crop area
      cropCanvas.width = cropArea.width;
      cropCanvas.height = cropArea.height;

      // Enable image smoothing for better quality
      cropCtx.imageSmoothingEnabled = true;
      cropCtx.imageSmoothingQuality = "high";

      // Draw cropped portion
      cropCtx.drawImage(
        image,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      );

      // Convert to optimized data URL
      const quality = cropArea.width * cropArea.height > 500000 ? 0.8 : 0.9;
      const croppedDataUrl = cropCanvas.toDataURL("image/jpeg", quality);

      await new Promise((resolve) => setTimeout(resolve, 500)); // Smooth UX delay
      onCrop(croppedDataUrl);
    } catch (error) {
      console.error("Crop failed:", error);
      alert("เกิดข้อผิดพลาดในการครอบตัดรูป กรุณาลองใหม่");
    } finally {
      setIsProcessing(false);
    }
  }, [cropArea, imageLoaded, onCrop]);

  const handleUseOriginalImage = useCallback(async () => {
    if (!onUseOriginal) return;
    
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300)); // Smooth UX delay
      onUseOriginal(imageSrc);
    } catch (error) {
      console.error("Failed to use original image:", error);
      alert("เกิดข้อผิดพลาดในการใช้รูปต้นฉบับ");
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, onUseOriginal]);

  const resetCrop = useCallback(() => {
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
  }, []);

  const hasCropArea = cropArea.width > 0 && cropArea.height > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/50 rounded-2xl p-4 sm:p-6 w-full max-w-5xl mx-3 sm:mx-4 max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-800/50 rounded-lg">
              <Crop className="w-5 h-5 text-neutral-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                ครอบตัดรูป QR Code
              </h3>
              <p className="text-xs text-neutral-400">เลือกพื้นที่ที่ต้องการ หรือใช้รูปต้นฉบับ</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-neutral-800/50 rounded-xl p-3 mb-4">
          <p className="text-sm text-neutral-300 text-center">
            <span className="hidden sm:inline">
              ลากเมาส์เพื่อเลือกพื้นที่ QR Code หรือใช้รูปต้นฉบับ
            </span>
            <span className="sm:hidden">
              แตะและลากเพื่อเลือกพื้นที่ QR Code หรือใช้รูปต้นฉบับ
            </span>
            {hasCropArea && (
              <span className="block text-xs text-neutral-400 mt-1">
                ขนาด: {Math.round(cropArea.width)} ×{" "}
                {Math.round(cropArea.height)} px
              </span>
            )}
          </p>
        </div>

        {/* Canvas Container */}
        <div
          ref={containerRef}
          className="relative overflow-auto max-h-[60vh] bg-neutral-800/30 rounded-xl border border-neutral-700/50"
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">กำลังโหลดรูป...</p>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            className={`cursor-crosshair touch-none transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            style={{ touchAction: "none" }}
          />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Original"
            className="hidden"
            crossOrigin="anonymous"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={resetCrop}
            disabled={!hasCropArea || isProcessing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-neutral-300 border border-neutral-700 rounded-xl hover:bg-neutral-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-3 sm:order-1"
          >
            <RotateCcw size={16} />
            <span className="text-sm">รีเซ็ต</span>
          </button>

          {onUseOriginal && (
            <button
              onClick={handleUseOriginalImage}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 flex-1 py-2.5 px-4 bg-neutral-700 text-white rounded-xl hover:bg-neutral-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">กำลังประมวลผล...</span>
                </>
              ) : (
                <>
                  <Image size={16} />
                  <span className="text-sm">ใช้รูปต้นฉบับ</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-2.5 px-4 text-neutral-300 border border-neutral-700 rounded-xl hover:bg-neutral-800 transition-all duration-200 disabled:opacity-50 order-4 sm:order-3"
          >
            <span className="text-sm">ยกเลิก</span>
          </button>

          <button
            onClick={handleCrop}
            disabled={!hasCropArea || isProcessing}
            className="flex items-center justify-center gap-2 flex-1 py-2.5 px-4 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-4 shadow-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">กำลังประมวลผล...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span className="text-sm">ครอบตัด</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}