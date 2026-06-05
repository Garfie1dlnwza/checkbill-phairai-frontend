"use client";
import { useMemo, useState } from "react";
import {
  FileText,
  Palette,
  Settings,
  Loader2,
  ArrowLeft,
  Plus,
  QrCode,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MinimalReceipt from "@/components/SummaryType/MinimalStyle";
import ColorStyle from "@/components/SummaryType/ColorStyle";
import { useLang } from "@/components/LanguageProvider";
import { ReceiptType, ReceiptOption } from "@/types/summary";
import { useSummaryData } from "@/hooks/useSummaryData";
import PaymentSettingsModal from "./PaymentSettingsModal";

export default function SummaryContent() {
  const { t } = useLang();
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
          <Loader2 className="w-12 h-12 animate-spin text-[var(--accent)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
            {t("summary.loading")}
          </h3>
          <p className="text-[var(--text-secondary)]">{t("summary.loadingDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start py-8 md:py-16 px-2 sm:px-4">
      <div className="relative border border-[var(--surface-border)] rounded-2xl max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 bg-[var(--surface-raised)] shadow-2xl z-10">
        {/* Header */}
        <div className="flex items-center justify-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center">
            {t("summary.title")}
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
                      ? "border-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--surface-border)] hover:border-[var(--accent)]/40 hover:bg-[var(--surface-overlay)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        receiptType === option.value
                          ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                          : "bg-[var(--surface-overlay)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        {option.fullLabel}
                      </h3>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-colors ${
                        receiptType === option.value
                          ? "border-[var(--accent)] bg-[var(--accent)]"
                          : "border-[var(--surface-border)]"
                      }`}
                    >
                      {receiptType === option.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--on-accent)] m-0.5" />
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Payment Settings Section */}
        <div className="mb-6 md:mb-8">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setShowPaymentSettings(true)}
              className="w-full group p-4 border border-[var(--surface-border)] rounded-xl hover:border-[var(--accent)]/40 transition-all duration-200 bg-[var(--surface-overlay)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface-subtle)] flex items-center justify-center">
                    {paymentInfo.type === "qr" ? (
                      <QrCode size={16} className="text-[var(--accent)]" />
                    ) : paymentInfo.type === "bank" ? (
                      <CreditCard size={16} className="text-[var(--accent)]" />
                    ) : (
                      <Plus size={16} className="text-[var(--text-secondary)]" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {paymentInfo.type === "none"
                        ? t("summary.paymentNone")
                        : t("summary.paymentSet")}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {paymentInfo.type === "none"
                        ? t("summary.paymentNoneHint")
                        : paymentInfo.type === "qr"
                        ? t("summary.paymentQrReady")
                        : t("summary.paymentBankReady")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {paymentInfo.type !== "none" && (
                    <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                  )}
                  <Settings
                    size={16}
                    className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors"
                  />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Receipt Preview */}
        {items.length === 0 && persons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-[var(--surface-border)] bg-[var(--surface-subtle)] rounded-xl">
            <FileText className="text-[var(--text-muted)] mb-4" size={48} />
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              {t("summary.noData")}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-md mx-auto text-center">
              {t("summary.noDataDesc")}
            </p>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] font-semibold shadow-lg hover:bg-[var(--accent-hover)] transition-colors text-sm sm:text-base"
            >
              <ArrowLeft size={16} />
              <span>{t("summary.backToAdd")}</span>
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border border-[var(--surface-border)] bg-[var(--surface-subtle)] rounded-xl overflow-hidden"
          >
            <div className="p-6 bg-[var(--surface-overlay)]">
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
