"use client";
import { useMemo, useState } from "react";
import {
  FileText,
  Palette,
  Settings,
  Loader2,
  Download,
  ArrowLeft,
  Sparkles,
  Plus,
  Check,
  QrCode,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MinimalReceipt from "@/components/SummaryType/MinimalStyle";
import ColorStyle from "@/components/SummaryType/ColorStyle";
import { ReceiptType, ReceiptOption } from "@/types/summary";
import { useSummaryData } from "@/hooks/useSummaryData";
import PaymentSettingsModal from "./PaymentSettingsModal";

export default function SummaryContent() {
  const { items, persons, paymentInfo, isLoading, savePaymentInfo } =
    useSummaryData();
  const [receiptType, setReceiptType] = useState<ReceiptType>("minimal");
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);

  const receiptOptions = useMemo<ReceiptOption[]>(
    () => [
      {
        value: "minimal",
        label: "Minimal",
        fullLabel: "Minimal Style",
        icon: <FileText size={18} />,
      },
      {
        value: "color",
        label: "Color",
        fullLabel: "Color Style",
        icon: <Palette size={18} />,
        description: "สไตล์มีสี เหมาะสำหรับการแชร์",
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center py-8 md:py-16 px-2 sm:px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            กำลังโหลดข้อมูล
          </h3>
          <p className="text-white/60">กรุณารอสักครู่...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start py-8 md:py-16 px-2 sm:px-4">
      <div className="relative border border-white/20 rounded-2xl max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 bg-black/70 shadow-2xl backdrop-blur-lg z-10">
        {/* Header */}
        <div className="flex items-center justify-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center">
            สรุปรายการ
          </h1>
        </div>

        {/* Style Selection Section */}
        <div className="mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <AnimatePresence>
              {receiptOptions.map((option) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setReceiptType(option.value as ReceiptType)}
                  className={`group relative p-4 border-2 rounded-xl transition-all duration-300 text-left ${
                    receiptType === option.value
                      ? "border-white-400 bg-white-400/10"
                      : "border-white/20 hover:border-white/40 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        receiptType === option.value
                          ? "bg-white-400/20 text-white-400"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">
                        {option.fullLabel}
                      </h3>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-colors ${
                        receiptType === option.value
                          ? "borde-white-400 bg-white-400"
                          : "border-white/40"
                      }`}
                    >
                      {receiptType === option.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white m-0.5" />
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Payment Settings Section - Minimal Design */}
        <div className="mb-6 md:mb-8">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setShowPaymentSettings(true)}
              className="w-full group p-4 border border-white/20 rounded-xl hover:border-white/40 transition-all duration-200 bg-black/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    {paymentInfo.type === "qr" ? (
                      <QrCode size={16} className="text-white" />
                    ) : paymentInfo.type === "bank" ? (
                      <CreditCard size={16} className="text-white" />
                    ) : (
                      <Plus size={16} className="text-white/60" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">
                      {paymentInfo.type === "none"
                        ? "เพิ่มข้อมูลการชำระเงิน"
                        : "ข้อมูลการชำระเงิน"}
                    </p>
                    <p className="text-xs text-white/60">
                      {paymentInfo.type === "none"
                        ? "แตะเพื่อเพิ่มข้อมูล QR Code หรือบัญชีธนาคาร"
                        : paymentInfo.type === "qr"
                        ? "QR Code พร้อมใช้งาน"
                        : "บัญชีธนาคารพร้อมใช้งาน"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {paymentInfo.type !== "none" && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                  <Settings
                    size={16}
                    className="text-white/40 group-hover:text-white/60 transition-colors"
                  />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Receipt Preview */}
        {items.length === 0 && persons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-white/10 bg-white/5 rounded-xl">
            <FileText className="text-white/30 mb-4" size={48} />
            <h3 className="text-lg font-medium text-white mb-2">
              ไม่พบข้อมูลรายการ
            </h3>
            <p className="text-white/60 text-sm mb-6 max-w-md mx-auto text-center">
              กรุณาเพิ่มรายการอาหารและกำหนดคนที่จะหารค่าใช้จ่ายก่อนดูสรุป
            </p>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-white text-black font-semibold shadow-lg hover:scale-105 transition-transform text-sm sm:text-base"
            >
              <ArrowLeft size={16} />
              <span>กลับไปเพิ่มรายการ</span>
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border border-white/10 bg-white/5 rounded-xl overflow-hidden"
          >
            <div className="p-6 bg-black/25">
              {receiptType === "minimal" ? (
                <MinimalReceipt
                  items={items}
                  persons={persons}
                  paymentInfo={paymentInfo}
                  printMode={true}
                />
              ) : (
                <ColorStyle
                  items={items}
                  persons={persons}
                  paymentInfo={paymentInfo}
                  printMode={true}
                />
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Payment Settings Modal */}
      {showPaymentSettings && (
        <PaymentSettingsModal
          paymentInfo={paymentInfo}
          onSave={savePaymentInfo}
          onClose={() => setShowPaymentSettings(false)}
        />
      )}
    </div>
  );
}
