"use client";
import { useState, useRef, useCallback, useMemo } from "react";
import { Settings, QrCode, CreditCard, Upload, X, Loader2, Crop } from "lucide-react";
import { PaymentInfo } from "@/types/summary";
import { validateFile } from "@/utils/imageUtils";
import ImageCropper from "./ImageCropper";
import { useLang } from "@/components/LanguageProvider";

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
  const { t } = useLang();
  const [formData, setFormData] = useState<PaymentInfo>(paymentInfo);
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File, skipCrop = false) => {
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
          
          if (skipCrop) {
            // Use image directly without cropping
            setFormData((prev) => ({ ...prev, qrCodeUrl: dataUrl }));
            setIsUploading(false);
          } else {
            // Show cropper
            setOriginalImage(dataUrl);
            setShowCropper(true);
            setIsUploading(false);
          }
        };

        reader.onerror = () => {
          alert(t("payment.errorFile"));
          setIsUploading(false);
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error("File processing error:", error);
        alert(t("payment.errorProcess"));
        setIsUploading(false);
      }
    },
    [t]
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

  const handleUseOriginal = useCallback(() => {
    setFormData((prev) => ({ ...prev, qrCodeUrl: originalImage }));
    setShowCropper(false);
    setOriginalImage("");
  }, [originalImage]);

  const removeQrCode = useCallback(() => {
    setFormData((prev) => ({ ...prev, qrCodeUrl: "" }));
  }, []);

  const openCropper = useCallback(() => {
    if (formData.qrCodeUrl) {
      setOriginalImage(formData.qrCodeUrl);
      setShowCropper(true);
    }
  }, [formData.qrCodeUrl]);

  const handleSave = useCallback(() => {
    // Validate form data
    if (formData.type === "bank") {
      if (
        !formData.bankName?.trim() ||
        !formData.accountNumber?.trim() ||
        !formData.accountName?.trim()
      ) {
        alert(t("payment.errorBank"));
        return;
      }
    } else if (formData.type === "qr" && !formData.qrCodeUrl) {
      alert(t("payment.errorQr"));
      return;
    }

    onSave(formData);
    onClose();
  }, [formData, onSave, onClose, t]);

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
        <div className="bg-[var(--surface-raised)] border border-[var(--surface-border)] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-lg sm:mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[var(--surface-overlay)] rounded-lg">
              <Settings className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {t("payment.title")}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {t("payment.subtitle")}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Payment Type Selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                {t("payment.typeLabel")}
              </label>
              <div className="space-y-3">
                {[
                  {
                    value: "none",
                    label: t("payment.typeNone"),
                    icon: null,
                  },
                  {
                    value: "qr",
                    label: t("payment.typeQr"),
                    icon: <QrCode size={18} className="text-white/70" />,
                  },
                  {
                    value: "bank",
                    label: t("payment.typeBank"),
                    icon: <CreditCard size={18} className="text-white/70" />,
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                      formData.type === option.value
                        ? "border-[var(--accent)] bg-[var(--accent)]/10"
                        : "border-[var(--surface-border)] hover:border-[var(--accent)]/40 hover:bg-[var(--surface-overlay)]"
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
                          ? "border-[var(--accent)] bg-[var(--accent)]"
                          : "border-[var(--surface-border)]"
                      }`}
                    >
                      {formData.type === option.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--on-accent)]" />
                      )}
                    </div>
                    {option.icon}
                    <span className="text-[var(--text-primary)] text-sm flex-1">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* QR Code Upload */}
            {formData.type === "qr" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">
                  {t("payment.qrUpload")}
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
                        className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--surface-base)] text-[var(--text-primary)] rounded-full flex items-center justify-center hover:bg-[var(--surface-overlay)] transition-colors shadow-lg"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={openCropper}
                        className="flex items-center gap-1 px-3 py-1 bg-[var(--surface-overlay)] hover:bg-[var(--surface-subtle)] rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <Crop size={12} />
                        {t("payment.qrCurrent")}
                      </button>
                      <p className="text-xs text-[var(--text-muted)]">
                        {t("payment.qrChange")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Enhanced File Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
                    dragActive
                      ? "border-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--surface-border)] hover:border-[var(--accent)]/50"
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
                          className="text-[var(--accent)] animate-spin mb-3"
                        />
                        <span className="text-sm text-[var(--text-secondary)]">
                          {t("payment.uploading")}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-[var(--surface-overlay)] rounded-xl mb-3">
                          <Upload size={24} className="text-[var(--text-secondary)]" />
                        </div>
                        <span className="text-sm text-[var(--text-primary)] font-medium mb-1">
                          {t("payment.uploadHint")}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {t("payment.uploadLimit")}
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
                <label className="block text-sm font-medium text-[var(--text-secondary)]">
                  {t("payment.bankInfo")}
                </label>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
                      {t("payment.bankName")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("payment.bankNamePlaceholder")}
                      value={formData.bankName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, bankName: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-[var(--surface-overlay)] border border-[var(--surface-border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
                      {t("payment.accountNumber")}
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
                      className="w-full px-4 py-3 bg-[var(--surface-overlay)] border border-[var(--surface-border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
                      {t("payment.accountName")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("payment.accountNamePlaceholder")}
                      value={formData.accountName || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-[var(--surface-overlay)] border border-[var(--surface-border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-all duration-200"
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
              className="flex-1 py-3 px-4 text-[var(--text-secondary)] border border-[var(--surface-border)] rounded-xl hover:bg-[var(--surface-overlay)] hover:border-[var(--accent)]/30 transition-all duration-200 order-2 sm:order-1"
            >
              {t("payment.cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={isUploading || !isFormValid}
              className="flex-1 py-3 px-4 bg-[var(--accent)] text-[var(--on-accent)] rounded-xl font-medium hover:bg-[var(--accent-hover)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 shadow-lg"
            >
              {isUploading ? t("payment.uploading") : t("payment.save")}
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
          onUseOriginal={handleUseOriginal}
        />
      )}
    </>
  );
}