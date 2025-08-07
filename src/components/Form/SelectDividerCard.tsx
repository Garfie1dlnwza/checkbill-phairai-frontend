import { useEffect, useState } from "react";

const DIVIDER_KEY = process.env.NEXT_PUBLIC_DIVIDER_KEY ;

interface SelectDividerCardProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  exclude?: string[]; 
}

export default function SelectDividerCard({
  selected,
  onChange,
  exclude = [],
}: SelectDividerCardProps) {
  const [dividers, setDividers] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!DIVIDER_KEY) return;
    const saved = localStorage.getItem(DIVIDER_KEY);
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        setDividers(Array.isArray(arr) ? arr : []);
      } catch {
        setDividers([]);
      }
    }
  }, []);

  // filter รายชื่อที่ถูก exclude
  const available = dividers.filter(
    (name) => !exclude.includes(name)
  );

  const handleToggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((n) => n !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 min-w-[180px]">
      <div className="font-bold mb-2 text-gray-700">เลือกคนหาร</div>
      <div className="flex flex-col gap-2">
        {available.length === 0 && (
          <div className="text-gray-400 text-sm">ไม่มีชื่อให้เลือก</div>
        )}
        {available.map((name) => (
          <label
            key={name}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
          >
            <input
              type="checkbox"
              checked={selected.includes(name)}
              onChange={() => handleToggle(name)}
              className="accent-violet-500"
            />
            <span className="font-medium">{name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}