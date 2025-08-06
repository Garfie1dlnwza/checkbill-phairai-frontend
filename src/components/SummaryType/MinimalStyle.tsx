"use client";
import { toPng } from "html-to-image";
import { useEffect, useState } from "react";

type Item = {
  id: number;
  name: string;
  price: number;
  qty: number;
  shareWith: string[];
};

interface MinimalReceiptProps {
  items: Item[];
  persons: string[];
  printMode?: boolean;
}

export default function MinimalReceipt({
  items,
  persons,
  printMode,
}: MinimalReceiptProps) {
  const [personAmounts, setPersonAmounts] = useState<Record<string, number>>(
    {}
  );
  const [totalBill, setTotalBill] = useState<number>(0);
  const [totalVat, setTotalVat] = useState<number>(0);
  const [hidePrinterBody, setHidePrinterBody] = useState(false);
  const [isPrinting, setIsPrinting] = useState(printMode);
  const [printedSections, setPrintedSections] = useState<Set<string>>(
    new Set()
  );
  const [currentPrintLine, setCurrentPrintLine] = useState(0);
  const [showCutter, setShowCutter] = useState(false);

  const VAT_RATE = 0.07;

  useEffect(() => {
    const amounts: Record<string, number> = {};
    persons.forEach((p) => (amounts[p] = 0));
    let calculatedTotal = 0;
    let calculatedVat = 0;

    items.forEach((item) => {
      const itemTotal = item.price * item.qty;
      calculatedTotal += itemTotal;
      calculatedVat += itemTotal * VAT_RATE;
      if (item.shareWith.length > 0) {
        const share = itemTotal / item.shareWith.length;
        const shareVat = (itemTotal * VAT_RATE) / item.shareWith.length;
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
    if (!isPrinting) return;

    const sections = [
      "header",
      ...items.map((item) => `item-${item.id}`),
      "total",
      "divider",
      "footer",
    ];
    let currentSection = 0;
    let lineInSection = 0;

    const printInterval = setInterval(() => {
      if (currentSection >= sections.length) {
        setIsPrinting(false);
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
        : 2;

      lineInSection++;
      if (lineInSection >= linesPerSection) {
        lineInSection = 0;
        currentSection++;
      }
    }, 100);

    return () => clearInterval(printInterval);
  }, [items.length, persons.length, isPrinting]);

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
    setHidePrinterBody(true);
    const node = document.getElementById("receipt-container");
    if (!node) return;
    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      link.download = "receipt.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("Export failed");
    } finally {
      setHidePrinterBody(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start py-8 px-4 text-gray-700 ">
      <div id="receipt-container" className="relative w-full max-w-lg">
        {/* Receipt Container */}
        <div className=" max-w-lg bg-white shadow-2xl relative overflow-hidden">
          {isPrinting && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse z-10"
              style={{
                top: `${Math.min(currentPrintLine * 25, 400)}px`,
                transition: "top 0.3s ease-out",
              }}
            ></div>
          )}

          {/* Perforated Top Edge */}
          <div className="h-4 bg-white relative  overflow-hidden ">
            <div
              className="absolute top-0 left-0 w-full h-4 bg-gray-100 "
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 8px, white 8px, white 12px)`,
              }}
            ></div>
          </div>

          <div className="px-6 pb-6 font-mono text-sm bg-white ">
            {/* Header */}
            <div
              className={`text-center py-4 border-b border-dashed border-gray-400 text-gray-700 transition-opacity duration-300 ${
                isSectionVisible("header", 0) ? "opacity-100" : "opacity-0"
              }`}
            >
              <h1
                className={`text-lg font-bold mb-1 transition-opacity duration-500 ${
                  isSectionVisible("header", 0) ? "opacity-100" : "opacity-0"
                }`}
              >
                ใบเสร็จรับเงิน
              </h1>
              <h2
                className={`text-base font-semibold transition-opacity duration-500 delay-100 ${
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
            <div className="py-4 space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`transition-all duration-500 ${
                    isSectionVisible(`item-${item.id}`, 0)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
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
                          หาร: {item.shareWith.join(", ")}
                        </div>
                      )}
                    </div>
                    <div
                      className={`font-bold text-right ml-4 transition-opacity duration-300 delay-100 ${
                        isSectionVisible(`item-${item.id}`, 1)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      ฿{(item.price * item.qty).toLocaleString()}
                    </div>
                  </div>
                  {index < items.length - 1 && (
                    <div className="border-b border-dotted border-gray-300 mt-2"></div>
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
              <div className="flex justify-between text-base font-bold">
                <span>TOTAL</span>
                <span>฿{totalBill.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>VAT 7%</span>
                <span>
                  ฿
                  {totalVat.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold mt-1">
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
              className={`border-t border-dashed border-gray-400 mt-6 pt-4 transition-all duration-500 ${
                isSectionVisible("divider", 0)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              <h3 className="text-center font-bold mb-3">
                ยอดแยกตามคน (รวม VAT)
              </h3>
              <div className="space-y-2">
                {persons.map((name, index) => (
                  <div
                    key={name}
                    className={`flex justify-between transition-all duration-300 ${
                      isSectionVisible("divider", index + 1)
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4"
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <span>{name}</span>
                    <span className="font-semibold">
                      ฿{personAmounts[name]?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              className={`text-center text-xs text-gray-500 mt-6 pt-4 border-t border-dotted border-gray-300 transition-all duration-500 ${
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

          {/* Perforated Bottom Edge */}
          <div className="h-4 bg-white relative overflow-hidden">
            <div
              className="absolute bottom-0 left-0 w-full h-4 bg-gray-100"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 8px, white 8px, white 12px)`,
              }}
            ></div>
          </div>
          {/* ปุ่ม export ในใบเสร็จ */}
          <div className="flex justify-end px-6 py-6">
            <button
              onClick={handleExportImage}
              className="flex items-center gap-2  text-gray-700  p-1 rounded-xl hover:bg-gray-200 transition-colors"
              aria-label="Export as Image"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 17v-6m0 0-2 2m2-2 2 2M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7M12 3v8"
                />
              </svg>
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
