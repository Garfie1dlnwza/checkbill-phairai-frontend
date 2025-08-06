"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MinimalReceipt from "@/components/SummaryType/MinimalStyle";
import ColorStyle from "@/components/SummaryType/ColorStyle";

type Item = {
  id: number;
  name: string;
  price: number;
  qty: number;
  shareWith: string[];
};

const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY;
const DIVIDER_KEY = process.env.NEXT_PUBLIC_DIVIDER_KEY;

export default function SummaryPage() {
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
      if (itemsRaw) initialItems = JSON.parse(itemsRaw);
      if (dividerRaw) initialPersons = JSON.parse(dividerRaw);
    }
    setItems(initialItems);
    setPersons(initialPersons);
  }, [searchParams]);

  const receiptOptions = [
    {
      value: "minimal",
      label: "Minimal Style",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z" />
          <path d="M4.5 12.5a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zm0-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7z" />
        </svg>
      ),
    },
    {
      value: "color",
      label: "Color Style",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M12.433 10.07C14.133 10.585 16 11.15 16 8a8 8 0 1 0-15.532 2.93l-.336-.931c.214-.09.43-.185.658-.287.46-.205.93-.418 1.42-.647.49-.228.988-.464 1.482-.702.495-.24.99-.488 1.48-.74.49-.25.974-.51 1.45-.78C9.37 5.09 9.776 5 10 5c.225 0 .45.09.67.27.433.35.84.77 1.21 1.24.37.47.69.98.94 1.54.25.56.45 1.18.58 1.84.13.66.19 1.38.16 2.147l-.99.115c.03-.75-.03-1.45-.15-2.08-.12-.62-.31-1.22-.55-1.76-.24-.54-.55-1.04-.9-1.48-.35-.44-.74-.84-1.12-1.16a.5.5 0 0 0-.67-.01C9.77 6.09 9.37 6 9 6c-.375 0-.75.09-1.12.27-.434.22-.88.47-1.32.73-.44.26-.88.52-1.32.79-.43.27-.86.55-1.29.85-.43.3-.85.62-1.27.96-.42.34-.82.7-1.22 1.07l-.65-.75c.4-.37.8-.73 1.2-1.06.4-.33.82-.65 1.24-.96.42-.3.85-.6 1.28-.87.43-.27.87-.53 1.32-.78.44-.25.89-.49 1.35-.72.46-.23.92-.44 1.39-.65.46-.2.92-.38 1.38-.54l1.38-.4a6.992 6.992 0 0 1 2.94-1.88l.44.89-2.94 1.88c-.46.1-.92.24-1.38.4-.46.16-.92.33-1.38.53-.46.2-.92.42-1.39.64-.46.23-.9.48-1.35.71-.44.25-.88.5-1.32.76-.43.26-.86.53-1.28.82-.42.29-.84.6-1.24.92l-1.18 1.02.72.68c.38-.36.78-.7 1.18-.98.4-.28.8-.55 1.2-.82.4-.27.8-.52 1.2-.77.4-.25.8-.48 1.2-.7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 ">
      {/* --- Redesigned Style Selector --- */}
      <div className=" w-full max-w-sm">
        <div
          role="radiogroup"
          aria-label="Receipt Style"
          className="flex w-full p-1 space-x-1 bg-gray-200/80 backdrop-blur-sm rounded-xl shadow-inner"
        >
          {receiptOptions.map((option) => (
            <button
              key={option.value}
              role="radio"
              aria-checked={receiptType === option.value}
              onClick={() =>
                setReceiptType(option.value as "minimal" | "color")
              }
              className={`flex-1 py-2.5 px-3 text-sm font-bold rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
                receiptType === option.value
                  ? "bg-white text-black shadow-md"
                  : "bg-transparent text-black hover:bg-white/60 hover:text-black-500"
              }`}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {receiptType === "minimal" ? (
        <MinimalReceipt items={items} persons={persons} printMode={true} />
      ) : (
        <ColorStyle items={items} persons={persons} printMode={true} />
      )}
    </div>
  );
}
