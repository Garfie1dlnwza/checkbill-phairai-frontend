"use client";
import { useState, useRef, useCallback, useMemo } from "react";
import { Settings, QrCode, CreditCard, Upload, X, Loader2 } from "lucide-react";
import { PaymentInfo } from "@/types/summary";
import { validateFile } from "@/utils/imageUtils";
import ImageCropper from "./ImageCropper";

interface PaymentSettingsModalProps {
  paymentInfo: PaymentInfo;
  onSave: (info: PaymentInfo) => void;
  onClose: () => void;
}

export default function PaymentSettingsModal({
  paymentInfo,
  onSave,
  onClose,
}: PaymentSettingsModalProps) {
  const [formData, setFormData] = useState<PaymentInfo>(paymentInfo);
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        alert(validationError);
        return;
      }

      setIsUploading(true);

      try {
        const reader = new FileReader();

        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setOriginalImage(dataUrl);
          setShowCropper(true);
          setIsUploading(false);
        };

        reader.onerror = () => {
          alert("เกิดข้อผิดพลาดในการอ่านไฟล์");
          setIsUploading(false);
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error("File processing error:", error);
        alert("เกิดข้อผิดพลาดในการประมวลผลไฟล์");
        setIsUploading(false);
      }
    },
    []
  );

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleCropComplete = useCallback((croppedImage: string) => {
    setFormData((prev) => ({ ...prev, qrCodeUrl: croppedImage }));
    setShowCropper(false);
    setOriginalImage("");
  }, []);

  const removeQrCode = useCallback(() => {
    setFormData((prev) => ({ ...prev, qrCodeUrl: "" }));
  }, []);

  const handleSave = useCallback(() => {
    // Validate form data
    if (formData.type === "bank") {
      if (
        !formData.bankName?.trim() ||
        !formData.accountNumber?.trim() ||
        !formData.accountName?.trim()
      ) {
        alert("กรุณากรอกข้อมูลธนาคารให้ครบถ้วน");
        return;
      }
    } else if (formData.type === "qr" && !formData.qrCodeUrl) {
      alert("กรุณาอัปโหลดรูป QR Code");
      return;
    }

    onSave(formData);
    onClose();
  }, [formData, onSave, onClose]);

  const isFormValid = useMemo(() => {
    if (formData.type === "none") return true;
    if (formData.type === "qr") return !!formData.qrCodeUrl;
    if (formData.type === "bank") {
      return !!(
        formData.bankName?.trim() &&
        formData.accountNumber?.trim() &&
        formData.accountName?.trim()
      );
    }
    return false;
  }, [formData]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-lg sm:mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/10 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                ตั้งค่าการชำระเงิน
              </h3>
              <p className="text-xs text-white/60">
                เลือกวิธีการชำระเงินที่ต้องการแสดง
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Payment Type Selection */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                ประเภทการชำระเงิน
              </label>
              <div className="space-y-3">
                {[
                  {
                    value: "none",
                    label: "ไม่แสดงข้อมูลการชำระเงิน",
                    icon: null,
                  },
                  {
                    value: "qr",
                    label: "QR Code PromptPay",
                    icon: <QrCode size={18} className="text-white/70" />,
                  },
                  {
                    value: "bank",
                    label: "เลขบัญชีธนาคาร",
                    icon: <CreditCard size={18} className="text-white/70" />,
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                      formData.type === option.value
                        ? "border-white bg-white/10"
                        : "border-white/20 hover:border-white/40 hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      value={option.value}
                      checked={formData.type === option.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as PaymentInfo["type"],
                        })
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        formData.type === option.value
                          ? "border-white bg-white"
                          : "border-white/40"
                      }`}
                    >
                      {formData.type === option.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-black" />
                      )}
                    </div>
                    {option.icon}
                    <span className="text-white text-sm flex-1">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* QR Code Upload */}
            {formData.type === "qr" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-white/80">
                  อัปโหลดรูป QR Code
                </label>

                {/* Current QR Code Preview */}
                {formData.qrCodeUrl && (
                  <div className="relative">
                    <div className="bg-white p-4 rounded-xl inline-block relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.qrCodeUrl}
                        alt="QR Code Preview"
                        className="w-32 h-32 object-contain"
                      />
                      <button
                        onClick={removeQrCode}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors shadow-lg"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-white/50 mt-2">
                      คลิกปุ่มด้านล่างเพื่อเปลี่ยนรูป
                    </p>
                  </div>
                )}

                {/* Enhanced File Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
                    dragActive
                      ? "border-white bg-white/10"
                      : "border-white/30 hover:border-white/50"
                  } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />

                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    {isUploading ? (
                      <>
                        <Loader2
                          size={32}
                          className="text-white animate-spin mb-3"
                        />
                        <span className="text-sm text-white/60">
                          กำลังอัปโหลด...
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-white/10 rounded-xl mb-3">
                          <Upload size={24} className="text-white/70" />
                        </div>
                        <span className="text-sm text-white font-medium mb-1">
                          แตะเพื่อเลือกรูป หรือลากไฟล์มาวาง
                        </span>
                        <span className="text-xs text-white/50">
                          รองรับ JPG, PNG, WebP (ไม่เกิน 5MB)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Bank Account Information */}
            {formData.type === "bank" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-white/80">
                  ข้อมูลบัญชีธนาคาร
                </label>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-2">
                      ชื่อธนาคาร *
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น ธนาคารกรุงเทพ, ธนาคารกสิกรไทย"
                      value={formData.bankName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, bankName: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-2">
                      เลขบัญชี *
                    </label>
                    <input
                      type="text"
                      placeholder="xxx-x-xxxxx-x"
                      value={formData.accountNumber || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountNumber: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-2">
                      ชื่อบัญชี *
                    </label>
                    <input
                      type="text"
                      placeholder="นาย/นาง/นางสาว ชื่อผู้ถือบัญชี"
                      value={formData.accountName || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 text-white/80 border border-white/20 rounded-xl hover:bg-white/5 hover:border-white/40 transition-all duration-200 order-2 sm:order-1"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              disabled={isUploading || !isFormValid}
              className="flex-1 py-3 px-4 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 shadow-lg"
            >
              {isUploading ? "กำลังอัปโหลด..." : "บันทึก"}
            </button>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && (
        <ImageCropper
          imageSrc={originalImage}
          onCrop={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setOriginalImage("");
          }}
        />
      )}
    </>
  );
}