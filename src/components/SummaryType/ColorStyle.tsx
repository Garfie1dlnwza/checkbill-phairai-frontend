"use client";
import { useEffect, useState, useRef } from "react";
import { toBlob } from "html-to-image";
import { getColor } from "@/constants/color";
import { Share2 } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";

const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY;
const DIVIDER_KEY = process.env.NEXT_PUBLIC_DIVIDER_KEY;
const VAT_RATE = 0.07;

type Item = {
  id: string;
  name: string;
  price: number;
  qty: number;
  includeVat?: boolean;
  shareWith: string[];
};

type PaymentInfo = {
  type: "qr" | "bank" | "none";
  qrCodeUrl?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
};

interface ColorStyleProps {
  items?: Item[];
  persons?: string[];
  paymentInfo?: PaymentInfo;
  includeVat?: boolean;
  printMode?: boolean;
}

export default function ColorStyle({
  items: propItems,
  persons: propPersons,
  paymentInfo = { type: "none" },
  printMode,
}: ColorStyleProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Local state only used when props are absent (standalone / localStorage mode)
  const [localItems, setLocalItems] = useState<Item[]>([]);
  const [localPersons, setLocalPersons] = useState<string[]>([]);

  useEffect(() => {
    if (propItems || !STORAGE_KEY) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setLocalItems(JSON.parse(raw));
  }, [propItems]);

  useEffect(() => {
    if (propPersons || !DIVIDER_KEY) return;
    const raw = localStorage.getItem(DIVIDER_KEY);
    if (raw) setLocalPersons(JSON.parse(raw));
  }, [propPersons]);

  // Always use props when provided so parent re-renders are reflected immediately
  const items = propItems ?? localItems;
  const persons = propPersons ?? localPersons;

  const [personAmounts, setPersonAmounts] = useState<Record<string, number>>({});
  const [totalBill, setTotalBill] = useState<number>(0);
  const [totalVat, setTotalVat] = useState<number>(0);

  const [isPrinting, setIsPrinting] = useState(printMode);
  const [printedSections, setPrintedSections] = useState<Set<string>>(new Set());
  const [currentPrintLine, setCurrentPrintLine] = useState(0);
  const { t } = useLang();
  const [showCutter, setShowCutter] = useState(false);
  const [isFullyRendered, setIsFullyRendered] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const amounts: Record<string, number> = {};
    persons.forEach((p) => (amounts[p] = 0));
    let calculatedTotal = 0;
    let calculatedVat = 0;

    items.forEach((item) => {
      const itemTotal = item.price * item.qty;
      calculatedTotal += itemTotal;
      const itemVat = item.includeVat ? itemTotal * VAT_RATE : 0;
      calculatedVat += itemVat;

      if (item.shareWith.length > 0) {
        const share = itemTotal / item.shareWith.length;
        const shareVat = itemVat / item.shareWith.length;
        item.shareWith.forEach((p) => {
          if (amounts[p] !== undefined) amounts[p] += share + shareVat;
        });
      }
    });

    setPersonAmounts(amounts);
    setTotalBill(calculatedTotal);
    setTotalVat(calculatedVat);
  }, [items, persons]);

  // Animation print effect — use paymentInfo.type (primitive) not the whole object
  // to avoid re-triggering on every render when paymentInfo uses the default parameter
  useEffect(() => {
    if (!isPrinting) {
      setIsFullyRendered(true);
      return;
    }

    const sections = [
      "header",
      ...items.map((item) => `item-${item.id}`),
      "total",
      "divider",
      ...(paymentInfo.type !== "none" ? ["payment"] : []),
      "footer",
    ];
    let currentSection = 0;
    let lineInSection = 0;

    const printInterval = setInterval(() => {
      if (currentSection >= sections.length) {
        setIsPrinting(false);
        setIsFullyRendered(true);
        setTimeout(() => setShowCutter(true), 500);
        setTimeout(() => setShowCutter(false), 1500);
        clearInterval(printInterval);
        return;
      }

      const sectionName = sections[currentSection];
      setPrintedSections(
        (prev) => new Set([...prev, `${sectionName}-${lineInSection}`])
      );
      setCurrentPrintLine((prev) => prev + 1);

      const linesPerSection = sectionName.startsWith("item")
        ? 2
        : sectionName === "header"
        ? 3
        : sectionName === "divider"
        ? persons.length + 1
        : sectionName === "payment"
        ? paymentInfo.type === "bank"
          ? 3
          : 1
        : 2;

      lineInSection++;
      if (lineInSection >= linesPerSection) {
        lineInSection = 0;
        currentSection++;
      }
    }, 100);

    return () => clearInterval(printInterval);
  }, [items.length, persons.length, isPrinting, paymentInfo.type]);

  const isSectionVisible = (sectionName: string, lineIndex: number = 0) => {
    return !isPrinting || printedSections.has(`${sectionName}-${lineIndex}`);
  };

  const handleExportImage = async () => {
    if (!isFullyRendered || isExporting) return;

    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const node = receiptRef.current;
    if (!node) {
      setIsExporting(false);
      return;
    }

    try {
      const blob = await toBlob(node, {
        cacheBust: true,
        backgroundColor: "#fff",
        width: node.offsetWidth,
        height: node.offsetHeight,
        style: { transform: "scale(1)", transformOrigin: "top left" },
        filter: (n) => {
          const cls = n.className;
          return !(typeof cls === "string" && cls.includes("animate-pulse"));
        },
      });

      if (!blob) throw new Error("blob is null");

      const filename = `receipt-${Date.now()}.png`;
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: t("receipt.shareTitle") });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Export error:", err);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const currentDate = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen flex justify-center items-start py-4 sm:py-8 lg:py-12 px-2 sm:px-4 text-neutral-800">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
        {/* Receipt card — this is the export capture target */}
        <div
          ref={receiptRef}
          id="color-style-receipt"
          className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-10 space-y-4 sm:space-y-6 lg:space-y-8 font-mono border border-neutral-200 relative overflow-hidden"
        >
          {/* Printer Animation Bar */}
          {isPrinting && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse z-10"
              style={{
                top: `${Math.min(currentPrintLine * 25, 400)}px`,
                transition: "top 0.3s ease-out",
              }}
            />
          )}
          {/* Cutter Animation */}
          {showCutter && (
            <div className="absolute inset-x-0 top-0 flex items-center justify-center z-20">
              <div className="w-full h-0.5 bg-green-700 animate-pulse" />
            </div>
          )}

          {/* Header */}
          <div
            className={`text-center pb-4 sm:pb-6 border-b border-dashed border-neutral-300 transition-opacity duration-300 ${
              isSectionVisible("header", 0) ? "opacity-100" : "opacity-0"
            }`}
          >
            <h1
              className={`text-xl sm:text-2xl lg:text-3xl font-extrabold mb-2 tracking-wide transition-opacity duration-500 ${
                isSectionVisible("header", 0) ? "opacity-100" : "opacity-0"
              }`}
            >
              ใบสรุปค่าใช้จ่าย
            </h1>
            <p
              className={`text-xs sm:text-sm lg:text-base text-neutral-500 transition-opacity duration-500 delay-100 ${
                isSectionVisible("header", 1) ? "opacity-100" : "opacity-0"
              }`}
            >
              สรุปรายการอาหารและยอดหาร
            </p>
            <p
              className={`text-xs text-neutral-400 mt-2 transition-opacity duration-500 delay-200 ${
                isSectionVisible("header", 2) ? "opacity-100" : "opacity-0"
              }`}
            >
              {currentDate}
            </p>
          </div>

          {/* Menu Items Section */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            <h2
              className={`text-base sm:text-lg lg:text-xl font-semibold transition-opacity duration-500 ${
                isSectionVisible("item-header", 0) ? "opacity-100" : "opacity-0"
              }`}
            >
              รายการอาหาร
            </h2>
            {items.map((item) => (
              <div
                key={item.id}
                className={`border-b border-neutral-200 pb-3 sm:pb-4 transition-all duration-500 ${
                  isSectionVisible(`item-${item.id}`, 0)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-1 sm:mb-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm sm:text-base lg:text-lg block truncate">
                      {item.name}
                    </span>
                    <span className="text-xs sm:text-sm text-neutral-500">
                      {item.qty} x ฿{item.price.toLocaleString()}
                    </span>
                  </div>
                  <span className="font-bold text-sm sm:text-base lg:text-lg flex-shrink-0">
                    ฿{(item.price * item.qty).toLocaleString()}
                  </span>
                </div>
                <div
                  className={`flex flex-wrap gap-1 sm:gap-2 items-center text-xs sm:text-sm text-neutral-500 transition-opacity duration-300 delay-100 ${
                    isSectionVisible(`item-${item.id}`, 1)
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                >
                  <span className="flex-shrink-0">{t("receipt.shareWithLabel")}</span>
                  {item.shareWith.length > 0 ? (
                    item.shareWith.map((name) => (
                      <span
                        key={name}
                        className={`inline-block px-2 sm:px-3 py-0.5 rounded-full text-xs font-semibold ${getColor(
                          name
                        )} bg-neutral-100 flex-shrink-0`}
                      >
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-neutral-400">{t("receipt.noDivider")}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Total Bill Section */}
          <div
            className={`pt-4 sm:pt-6 border-t border-dashed border-neutral-300 space-y-2 sm:space-y-3 transition-all duration-500 ${
              isSectionVisible("total", 0)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            <div className="flex justify-between text-base sm:text-lg font-semibold">
              <span>{t("receipt.grandTotal")}</span>
              <span>฿{totalBill.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-neutral-600">
              <span>VAT 7%</span>
              <span>
                ฿
                {totalVat.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between font-bold text-green-700 text-base sm:text-lg">
              <span>{t("receipt.totalAll")}</span>
              <span>
                ฿
                {(totalBill + totalVat).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Person Summary Section */}
          <div
            className={`space-y-3 sm:space-y-4 border-t border-dashed border-neutral-300 mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 transition-all duration-500 ${
              isSectionVisible("divider", 0)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-center mb-3 sm:mb-4">
              ยอดที่แต่ละคนต้องจ่าย (รวม VAT)
            </h2>
            <div className="flex flex-col gap-2 sm:gap-3">
              {persons.map((name, idx) => (
                <div
                  key={name}
                  className={`flex justify-between items-center py-2 sm:py-3 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl border-2 ${getColor(
                    name
                  )} bg-neutral-50 transition-all duration-300 ${
                    isSectionVisible("divider", idx + 1)
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4"
                  }`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <span className="font-semibold text-sm sm:text-base truncate flex-1">
                    {name}
                  </span>
                  <span className="font-bold text-sm sm:text-base flex-shrink-0 ml-2">
                    ฿
                    {personAmounts[name]?.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    }) || "0"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Information */}
          {paymentInfo.type !== "none" && (
            <div
              className={`space-y-3 sm:space-y-4 border-t border-dashed border-neutral-300 mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 transition-all duration-500 ${
                isSectionVisible("payment", 0)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-center mb-3 sm:mb-4">
                ข้อมูลการชำระเงิน
              </h2>
              {paymentInfo.type === "qr" && paymentInfo.qrCodeUrl && (
                <div className="text-center">
                  <img
                    src={paymentInfo.qrCodeUrl}
                    alt="QR Code สำหรับชำระเงิน"
                    className="mx-auto max-w-24 sm:max-w-32 lg:max-w-40 h-auto border border-neutral-200 rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <p className="text-xs sm:text-sm text-neutral-500 mt-2">
                    {t("receipt.qrScan")}
                  </p>
                </div>
              )}
              {paymentInfo.type === "bank" && (
                <div className="bg-neutral-50 rounded-lg p-3 sm:p-4 space-y-2">
                  {paymentInfo.bankName && (
                    <div
                      className={`flex justify-between items-center text-sm sm:text-base transition-opacity duration-300 ${
                        isSectionVisible("payment", 0)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <span className="text-neutral-600">{t("receipt.bank")}</span>
                      <span className="font-semibold">{paymentInfo.bankName}</span>
                    </div>
                  )}
                  {paymentInfo.accountNumber && (
                    <div
                      className={`flex justify-between items-center text-sm sm:text-base transition-opacity duration-300 delay-100 ${
                        isSectionVisible("payment", 1)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <span className="text-neutral-600">{t("receipt.accountNumber")}</span>
                      <span className="font-mono font-semibold">
                        {paymentInfo.accountNumber}
                      </span>
                    </div>
                  )}
                  {paymentInfo.accountName && (
                    <div
                      className={`flex justify-between items-center text-sm sm:text-base transition-opacity duration-300 delay-200 ${
                        isSectionVisible("payment", 2)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <span className="text-neutral-600">{t("receipt.accountName")}</span>
                      <span className="font-semibold">
                        {paymentInfo.accountName}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div
            className={`text-center text-xs text-neutral-500 mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 border-t border-dotted border-neutral-300 transition-all duration-500 ${
              isSectionVisible("footer", 0)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            <p
              className={`transition-opacity duration-300 ${
                isSectionVisible("footer", 0) ? "opacity-100" : "opacity-0"
              }`}
            >
              ขอบคุณที่ใช้บริการ
            </p>
            <p
              className={`transition-opacity duration-300 delay-200 ${
                isSectionVisible("footer", 1) ? "opacity-100" : "opacity-0"
              }`}
            >
              THANK YOU
            </p>
          </div>
        </div>

        {/* Share Button — outside the capture target so it never appears in exported images */}
        <div className="flex justify-center pt-4 sm:pt-6 lg:pt-8">
          <button
            onClick={handleExportImage}
            disabled={!isFullyRendered || isExporting}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-neutral-700 bg-neutral-100 rounded-xl font-semibold transition-colors shadow-sm w-full sm:w-auto justify-center ${
              !isFullyRendered || isExporting
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-neutral-200"
            }`}
            aria-label={t("receipt.ariaShare")}
          >
            <Share2
              size={16}
              className={isExporting ? "animate-pulse" : ""}
            />
            <span className="text-sm sm:text-base">
              {isExporting
                ? t("receipt.preparing")
                : !isFullyRendered
                ? t("receipt.loading")
                : t("receipt.shareBtn")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
