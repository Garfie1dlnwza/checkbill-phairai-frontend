"use client";
import { toBlob } from "html-to-image";
import { useEffect, useState, useRef } from "react";
import { Share2 } from "lucide-react";

type Item = {
  id: string;
  name: string;
  price: number;
  qty: number;
  shareWith: string[];
  includeVat?: boolean;
};

type PaymentInfo = {
  type: "qr" | "bank" | "none";
  qrCodeUrl?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
};

interface MinimalReceiptProps {
  items: Item[];
  persons: string[];
  paymentInfo?: PaymentInfo;
  printMode?: boolean;
}

export default function MinimalReceipt({
  items,
  persons,
  paymentInfo = { type: "none" },
  printMode,
}: MinimalReceiptProps) {
  const [personAmounts, setPersonAmounts] = useState<Record<string, number>>({});
  const [totalBill, setTotalBill] = useState<number>(0);
  const [totalVat, setTotalVat] = useState<number>(0);
  const [hidePrinterBody, setHidePrinterBody] = useState(false);
  const [isPrinting, setIsPrinting] = useState(printMode);
  const [printedSections, setPrintedSections] = useState<Set<string>>(new Set());
  const [currentPrintLine, setCurrentPrintLine] = useState(0);
  const [showCutter, setShowCutter] = useState(false);
  const [isFullyRendered, setIsFullyRendered] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const VAT_RATE = 0.07;

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
        ? 3
        : sectionName === "header"
        ? 3
        : sectionName === "divider"
        ? persons.length + 1
        : sectionName === "payment"
        ? paymentInfo.type === "bank" ? 3 : 1
        : 2;

      lineInSection++;
      if (lineInSection >= linesPerSection) {
        lineInSection = 0;
        currentSection++;
      }
    }, 100);

    return () => clearInterval(printInterval);
  }, [items.length, persons.length, isPrinting, paymentInfo.type]);

  const currentDate = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isSectionVisible = (sectionName: string, lineIndex: number = 0) => {
    return !isPrinting || printedSections.has(`${sectionName}-${lineIndex}`);
  };

  const handleExportImage = async () => {
    if (!isFullyRendered || isExporting) return;

    setIsExporting(true);
    setHidePrinterBody(true);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const node = receiptRef.current;
    if (!node) {
      setIsExporting(false);
      setHidePrinterBody(false);
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
        await navigator.share({ files: [file], title: "สรุปบิล" });
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
      setHidePrinterBody(false);
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start py-4 sm:py-8 px-2 sm:px-4 text-gray-700">
      <div ref={receiptRef} id="receipt-container" className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <div className="w-full bg-white shadow-2xl relative overflow-hidden rounded-lg sm:rounded-none">
          {isPrinting && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse z-10"
              style={{
                top: `${Math.min(currentPrintLine * 25, 400)}px`,
                transition: "top 0.3s ease-out",
              }}
            />
          )}

          {!hidePrinterBody && (
            <div className="hidden sm:block h-4 bg-white relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-full h-4 bg-gray-100"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 8px, white 8px, white 12px)`,
                }}
              />
            </div>
          )}

          <div className="px-4 sm:px-6 pb-4 sm:pb-6 font-mono text-xs sm:text-sm bg-white">
            {/* Header */}
            <div
              className={`text-center py-3 sm:py-4 border-b border-dashed border-gray-400 text-gray-700 transition-opacity duration-300 ${
                isSectionVisible("header", 0) ? "opacity-100" : "opacity-0"
              }`}
            >
              <h1
                className={`text-base sm:text-lg font-bold mb-1 transition-opacity duration-500 ${
                  isSectionVisible("header", 0) ? "opacity-100" : "opacity-0"
                }`}
              >
                ใบเสร็จรับเงิน
              </h1>
              <h2
                className={`text-sm sm:text-base font-semibold transition-opacity duration-500 delay-100 ${
                  isSectionVisible("header", 1) ? "opacity-100" : "opacity-0"
                }`}
              >
                RECEIPT
              </h2>
              <p
                className={`text-xs text-gray-600 mt-2 transition-opacity duration-500 delay-200 ${
                  isSectionVisible("header", 2) ? "opacity-100" : "opacity-0"
                }`}
              >
                {currentDate}
              </p>
            </div>

            {/* Items */}
            <div className="py-3 sm:py-4 space-y-2 sm:space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`transition-all duration-500 ${
                    isSectionVisible(`item-${item.id}`, 0)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs sm:text-sm truncate">{item.name}</div>
                      <div
                        className={`text-xs text-gray-600 transition-opacity duration-300 delay-100 ${
                          isSectionVisible(`item-${item.id}`, 1)
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      >
                        {item.qty} x ฿{item.price.toLocaleString()}
                      </div>
                      {item.shareWith.length > 0 && (
                        <div
                          className={`text-xs text-gray-500 mt-1 transition-opacity duration-300 delay-200 ${
                            isSectionVisible(`item-${item.id}`, 2)
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        >
                          <span className="hidden sm:inline">หาร: </span>
                          <span className="sm:hidden">หาร:</span>
                          <span className="break-words">{item.shareWith.join(", ")}</span>
                        </div>
                      )}
                    </div>
                    <div
                      className={`font-bold text-right ml-2 flex-shrink-0 text-xs sm:text-sm transition-opacity duration-300 delay-100 ${
                        isSectionVisible(`item-${item.id}`, 1)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      ฿{(item.price * item.qty).toLocaleString()}
                    </div>
                  </div>
                  {index < items.length - 1 && (
                    <div className="border-b border-dotted border-gray-300 mt-2" />
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div
              className={`border-t border-dashed border-gray-400 pt-3 transition-all duration-500 ${
                isSectionVisible("total", 0)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              <div className="flex justify-between text-sm sm:text-base font-bold">
                <span>TOTAL</span>
                <span>฿{totalBill.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 mt-1">
                <span>VAT 7%</span>
                <span>
                  ฿
                  {totalVat.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold mt-1">
                <span>รวมทั้งหมด</span>
                <span>
                  ฿
                  {(totalBill + totalVat).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div
              className={`border-t border-dashed border-gray-400 mt-4 sm:mt-6 pt-3 sm:pt-4 transition-all duration-500 ${
                isSectionVisible("divider", 0)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              <h3 className="text-center font-bold mb-3 text-xs sm:text-sm">
                ยอดแยกตามคน (รวม VAT)
              </h3>
              <div className="space-y-1 sm:space-y-2">
                {persons.map((name, index) => (
                  <div
                    key={name}
                    className={`flex justify-between items-center transition-all duration-300 ${
                      isSectionVisible("divider", index + 1)
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4"
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <span className="text-xs sm:text-sm truncate flex-1">{name}</span>
                    <span className="font-semibold text-xs sm:text-sm ml-2 flex-shrink-0">
                      ฿{personAmounts[name]?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Information */}
            {paymentInfo.type !== "none" && (
              <div
                className={`border-t border-dashed border-gray-400 mt-4 sm:mt-6 pt-3 sm:pt-4 transition-all duration-500 ${
                  isSectionVisible("payment", 0)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }`}
              >
                <h3 className="text-center font-bold mb-3 text-xs sm:text-sm">
                  ข้อมูลการชำระเงิน
                </h3>
                {paymentInfo.type === "qr" && paymentInfo.qrCodeUrl && (
                  <div className="text-center">
                    <img
                      src={paymentInfo.qrCodeUrl}
                      alt="QR Code สำหรับชำระเงิน"
                      className="mx-auto max-w-24 sm:max-w-32 h-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">สแกน QR Code เพื่อชำระเงิน</p>
                  </div>
                )}
                {paymentInfo.type === "bank" && (
                  <div className="space-y-1">
                    {paymentInfo.bankName && (
                      <div
                        className={`flex justify-between text-xs sm:text-sm transition-opacity duration-300 ${
                          isSectionVisible("payment", 0) ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <span>ธนาคาร:</span>
                        <span>{paymentInfo.bankName}</span>
                      </div>
                    )}
                    {paymentInfo.accountNumber && (
                      <div
                        className={`flex justify-between text-xs sm:text-sm transition-opacity duration-300 delay-100 ${
                          isSectionVisible("payment", 1) ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <span>เลขบัญชี:</span>
                        <span className="font-mono">{paymentInfo.accountNumber}</span>
                      </div>
                    )}
                    {paymentInfo.accountName && (
                      <div
                        className={`flex justify-between text-xs sm:text-sm transition-opacity duration-300 delay-200 ${
                          isSectionVisible("payment", 2) ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <span>ชื่อบัญชี:</span>
                        <span>{paymentInfo.accountName}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div
              className={`text-center text-xs text-gray-500 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-dotted border-gray-300 transition-all duration-500 ${
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

          {!hidePrinterBody && (
            <div className="h-4 bg-white relative overflow-hidden">
              <div
                className="absolute bottom-0 left-0 w-full h-4 bg-gray-100"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 8px, white 8px, white 12px)`,
                }}
              ></div>
            </div>
          )}

          {!hidePrinterBody && (
            <div className="hidden sm:block h-4 bg-white relative overflow-hidden">
              <div
                className="absolute bottom-0 left-0 w-full h-4 bg-gray-100"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 8px, white 8px, white 12px)`,
                }}
              />
            </div>
          )}

          {/* Export Button */}
          {!hidePrinterBody && (
            <div className="flex justify-center px-4 sm:px-6 py-3 sm:py-6 bg-gray-50 sm:bg-white">
              <button
                onClick={handleExportImage}
                disabled={!isFullyRendered || isExporting}
                className={`flex items-center gap-2 text-gray-700 bg-white border border-gray-300 px-4 py-2 rounded-xl transition-colors shadow-sm w-full sm:w-auto justify-center ${
                  !isFullyRendered || isExporting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
                aria-label="แชร์รูปใบเสร็จ"
              >
                <Share2
                  size={16}
                  className={isExporting ? "animate-pulse" : ""}
                />
                <span className="text-sm font-medium">
                  {isExporting
                    ? "กำลังเตรียม..."
                    : !isFullyRendered
                    ? "กำลังโหลด..."
                    : "แชร์รูป"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}