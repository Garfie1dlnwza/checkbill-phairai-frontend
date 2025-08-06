"use client";
import { useEffect, useState } from "react";
import { toPng } from "html-to-image";
import { getColor } from "@/constants/color";

const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY;
const DIVIDER_KEY = process.env.NEXT_PUBLIC_DIVIDER_KEY;
const VAT_RATE = 0.07;

type Item = {
  id: number;
  name: string;
  price: number;
  qty: number;
  shareWith: string[];
};

interface ColorStyleProps {
  items?: Item[];
  persons?: string[];
  printMode?: boolean;
}

export default function ColorStyle({ items: propItems, persons: propPersons, printMode }: ColorStyleProps) {
  const [items, setItems] = useState<Item[]>(propItems || []);
  const [persons, setPersons] = useState<string[]>(propPersons || []);
  const [personAmounts, setPersonAmounts] = useState<Record<string, number>>({});
  const [totalBill, setTotalBill] = useState<number>(0);
  const [totalVat, setTotalVat] = useState<number>(0);

  // Animation print states
  const [isPrinting, setIsPrinting] = useState(printMode);
  const [printedSections, setPrintedSections] = useState<Set<string>>(new Set());
  const [currentPrintLine, setCurrentPrintLine] = useState(0);
  const [showCutter, setShowCutter] = useState(false);

  useEffect(() => {
    if ((!propItems || !propPersons) && STORAGE_KEY && DIVIDER_KEY) {
      const itemsRaw = localStorage.getItem(STORAGE_KEY);
      const dividerRaw = localStorage.getItem(DIVIDER_KEY);
      if (!propItems && itemsRaw) setItems(JSON.parse(itemsRaw));
      if (!propPersons && dividerRaw) setPersons(JSON.parse(dividerRaw));
    }
  }, [propItems, propPersons]);

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

  // Animation print effect
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
        ? 2
        : sectionName === "header"
        ? 2
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

  const isSectionVisible = (sectionName: string, lineIndex: number = 0) => {
    return !isPrinting || printedSections.has(`${sectionName}-${lineIndex}`);
  };

  // Export as image
  const handleExportImage = async () => {
    const node = document.getElementById("color-style-receipt");
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
    <div className="min-h-screen flex justify-center items-start py-12 px-4 text-neutral-800">
      <div
        id="color-style-receipt"
        className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-10 space-y-8 font-mono border border-neutral-200 relative overflow-hidden"
      >
        {/* Printer Animation Bar */}
        {isPrinting && (
          <div
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse z-10"
            style={{
              top: `${Math.min(currentPrintLine * 25, 400)}px`,
              transition: "top 0.3s ease-out",
            }}
          ></div>
        )}
        {/* Cutter Animation */}
        {showCutter && (
          <div className="absolute inset-x-0 top-0 flex items-center justify-center z-20">
            <div className="w-full h-0.5 bg-green-700 animate-pulse"></div>
          </div>
        )}

        {/* Header */}
        <div
          className={`text-center pb-6 border-b border-dashed border-neutral-300 transition-opacity duration-300 ${
            isSectionVisible("header", 0) ? "opacity-100" : "opacity-0"
          }`}
        >
          <h1
            className={`text-3xl font-extrabold mb-2 tracking-wide transition-opacity duration-500 ${
              isSectionVisible("header", 0) ? "opacity-100" : "opacity-0"
            }`}
          >
            ใบสรุปค่าใช้จ่าย
          </h1>
          <p
            className={`text-base text-neutral-500 transition-opacity duration-500 delay-100 ${
              isSectionVisible("header", 1) ? "opacity-100" : "opacity-0"
            }`}
          >
            สรุปรายการอาหารและยอดหาร
          </p>
          <p
            className={`text-xs text-neutral-400 mt-2 transition-opacity duration-500 delay-200 ${
              isSectionVisible("header", 1) ? "opacity-100" : "opacity-0"
            }`}
          >
            {currentDate}
          </p>
        </div>

        {/* Menu Items Section */}
        <div className="space-y-6">
          <h2
            className={`text-xl font-semibold transition-opacity duration-500 ${
              isSectionVisible("item-0", 0) ? "opacity-100" : "opacity-0"
            }`}
          >
            รายการอาหาร
          </h2>
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`border-b border-neutral-200 pb-4 transition-all duration-500 ${
                isSectionVisible(`item-${item.id}`, 0)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-base">
                  {item.name}{" "}
                  <span className="text-sm text-neutral-500">x{item.qty}</span>
                </span>
                <span className="font-bold text-lg">
                  ฿{(item.price * item.qty).toLocaleString()}
                </span>
              </div>
              <div
                className={`flex flex-wrap gap-2 items-center text-sm text-neutral-500 transition-opacity duration-300 delay-100 ${
                  isSectionVisible(`item-${item.id}`, 1)
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              >
                <span>หารกับ:</span>
                {item.shareWith.length > 0 ? (
                  item.shareWith.map((name) => (
                    <span
                      key={name}
                      className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${getColor(
                        name
                      )} bg-neutral-100`}
                    >
                      {name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-neutral-400">ไม่มีคนหาร</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total Bill Section */}
        <div
          className={`pt-6 border-t border-dashed border-neutral-300 space-y-3 transition-all duration-500 ${
            isSectionVisible("total", 0)
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          }`}
        >
          <div className="flex justify-between text-lg font-semibold">
            <span>ยอดรวมทั้งหมด</span>
            <span>฿{totalBill.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-neutral-600">
            <span>VAT 7%</span>
            <span>
              ฿{totalVat.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between font-bold text-green-700 text-lg">
            <span>รวมทั้งหมด</span>
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
          className={`space-y-4 border-t border-dashed border-neutral-300 mt-8 pt-6 transition-all duration-500 ${
            isSectionVisible("divider", 0)
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          }`}
        >
          <h2 className="text-xl font-semibold text-center mb-4">
            ยอดที่แต่ละคนต้องจ่าย (รวม VAT)
          </h2>
          <div className="flex flex-col gap-3">
            {persons.map((name, idx) => (
              <div
                key={name}
                className={`flex justify-between items-center py-3 px-6 rounded-xl border-2 ${getColor(
                  name
                )} bg-neutral-50 transition-all duration-300 ${
                  isSectionVisible("divider", idx + 1)
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4"
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <span className="font-semibold">{name}</span>
                <span className="font-bold text-base">
                  ฿
                  {personAmounts[name]?.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  }) || "0"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`text-center text-xs text-neutral-500 mt-8 pt-6 border-t border-dotted border-neutral-300 transition-all duration-500 ${
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

        {/* Export Button */}
        <div className="flex justify-center pt-8">
          <button
            onClick={handleExportImage}
            className="px-6 py-2 text-neutral-700 bg-neutral-100 rounded-xl font-semibold hover:bg-neutral-200 transition-colors shadow-sm"
            aria-label="Export as Image"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}