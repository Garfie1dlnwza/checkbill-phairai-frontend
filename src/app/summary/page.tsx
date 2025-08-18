"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MinimalReceipt from "@/components/SummaryType/MinimalStyle";
import ColorStyle from "@/components/SummaryType/ColorStyle";
import { FileText, Palette } from "lucide-react";

type Item = {
  id: string;
  name: string;
  price: number;
  qty: number;
  shareWith: string[];
  includeVat?: boolean;
};

const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY;
const DIVIDER_KEY = process.env.NEXT_PUBLIC_DIVIDER_KEY;

function SummaryPageContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [persons, setPersons] = useState<string[]>([]);
  const [receiptType, setReceiptType] = useState<"minimal" | "color">(
    "minimal"
  );

  useEffect(() => {
    const itemsParam = searchParams.get("items");
    const personsParam = searchParams.get("persons");
    let initialItems: Item[] = [];
    let initialPersons: string[] = [];

    if (itemsParam && personsParam) {
      try {
        initialItems = JSON.parse(atob(itemsParam));
        initialPersons = JSON.parse(atob(personsParam));
      } catch (e) {
        console.error(
          "Failed to parse data from URL, falling back to localStorage.",
          e
        );
      }
    }

    if (initialItems.length === 0 && initialPersons.length === 0) {
      const itemsRaw = STORAGE_KEY ? localStorage.getItem(STORAGE_KEY) : null;
      const dividerRaw = DIVIDER_KEY ? localStorage.getItem(DIVIDER_KEY) : null;

      if (itemsRaw) {
        initialItems = JSON.parse(itemsRaw).map((item: Item) => ({
          ...item,
          includeVat: item.includeVat ?? false,
        }));
      }
      if (dividerRaw) initialPersons = JSON.parse(dividerRaw);
    }

    setItems(initialItems);
    setPersons(initialPersons);
  }, [searchParams]);

  const receiptOptions = [
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
    },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Container with consistent padding */}
      <div className="container mx-auto px-4 py-6 mt-8   sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              สรุปรายการ
            </h1>
            <p className="text-sm sm:text-base text-neutral-400">
              เลือกสไตล์การแสดงผลและพิมพ์ใบเสร็จ
            </p>
          </div>

          {/* Style Selector */}
          <div className="flex justify-center mb-2 sm:mb-2">
            <div className="w-full max-w-xs sm:max-w-sm">
              <div
                role="radiogroup"
                aria-label="Receipt Style"
                className="flex w-full p-1 space-x-1 bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg"
              >
                {receiptOptions.map((option) => (
                  <button
                    key={option.value}
                    role="radio"
                    aria-checked={receiptType === option.value}
                    onClick={() =>
                      setReceiptType(option.value as "minimal" | "color")
                    }
                    className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white focus-visible:ring-offset-neutral-900 ${
                      receiptType === option.value
                        ? "bg-white text-black shadow-md transform scale-[0.98]"
                        : "bg-transparent text-neutral-300 hover:bg-neutral-700 hover:text-white"
                    }`}
                  >
                    <span className="flex-shrink-0">{option.icon}</span>
                    <span className="hidden sm:inline">{option.fullLabel}</span>
                    <span className="sm:hidden">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            {/* Loading state */}
            {items.length === 0 && persons.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-800 rounded-full mb-4">
                  <FileText size={24} className="text-neutral-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  ไม่พบข้อมูล
                </h3>
                <p className="text-neutral-400 text-sm">
                  กรุณาเพิ่มรายการอาหารก่อนดูสรุป
                </p>
              </div>
            ) : (
              <>
                {receiptType === "minimal" ? (
                  <MinimalReceipt
                    items={items}
                    persons={persons}
                    printMode={true}
                  />
                ) : (
                  <ColorStyle
                    items={items}
                    persons={persons}
                    printMode={true}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Print Instructions - Mobile Hidden */}
        {(items.length > 0 || persons.length > 0) && (
          <div className="hidden sm:block mt-8 text-center">
            <p className="text-xs text-neutral-500">
              กด{" "}
              <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-300">
                Ctrl + P
              </kbd>{" "}
              เพื่อพิมพ์ใบเสร็จ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
            <p className="text-neutral-400">กำลังโหลด...</p>
          </div>
        </div>
      }
    >
      <SummaryPageContent />
    </Suspense>
  );
}
