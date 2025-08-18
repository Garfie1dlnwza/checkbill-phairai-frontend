import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import InputItem from "@/components/Form/InputItem";
import { X, Plus, Check } from "lucide-react";
import { getColor } from "@/constants/color";
import CheckBox from "@/components/Custom/CheckBox";

const DIVIDER_KEY = process.env.NEXT_PUBLIC_DIVIDER_KEY;

interface CardCreateItemProps {
  onSave: (item: {
    name: string;
    qty: number;
    price: number;
    shareWith: string[];
    includeVat?: boolean;
  }) => void;
  onClose: () => void;
  initialData?: {
    name: string;
    qty: number;
    price: number;
    shareWith: string[];
    includeVat?: boolean;
  };
}

export default function CardCreateItem({
  onSave,
  onClose,
  initialData,
}: CardCreateItemProps) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState<string>("1");
  const [price, setPrice] = useState<string>("");
  const [shareWith, setShareWith] = useState<string[]>([]);
  const [dividerPersons, setDividerPersons] = useState<string[]>([]);
  const [inputDivider, setInputDivider] = useState<string>("");
  const [dividerError, setDividerError] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [includeVat, setIncludeVat] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!DIVIDER_KEY) return;
    const saved = localStorage.getItem(DIVIDER_KEY);
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        setDividerPersons(Array.isArray(arr) ? arr : []);
      } catch {
        setDividerPersons([]);
      }
    }
  }, []);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setQty(initialData.qty.toString());
      setPrice(initialData.price.toString());
      setShareWith(initialData.shareWith);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "กรุณาใส่ชื่อเมนู";
    }

    const qtyNum = Number(qty);
    if (!qty.trim() || isNaN(qtyNum) || qtyNum <= 0) {
      newErrors.qty = "จำนวนต้องเป็นตัวเลขที่มากกว่า 0";
    }

    const priceNum = Number(price);
    if (!price.trim() || isNaN(priceNum) || priceNum < 0) {
      newErrors.price = "ราคาต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    onSave({
      name: name.trim(),
      qty: Number(qty),
      price: Number(price),
      shareWith,
      includeVat,
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && e.ctrlKey) handleSave();
  };

  const isFormValid =
    name.trim() &&
    qty.trim() &&
    price.trim() &&
    !isNaN(Number(qty)) &&
    Number(qty) > 0 &&
    !isNaN(Number(price)) &&
    Number(price) >= 0;

  const VAT_RATE = 0.07;
  const totalAmount = (Number(qty) || 0) * (Number(price) || 0);
  const vatAmount = includeVat ? totalAmount * VAT_RATE : 0;
  const totalWithVat = totalAmount + vatAmount;
  const perPersonWithVat =
    shareWith.length > 0 ? totalWithVat / shareWith.length : 0;

  const handleAddDividerPerson = () => {
    if (!DIVIDER_KEY) return;
    const personName = inputDivider.trim();
    if (!personName) {
      setDividerError("กรุณาใส่ชื่อ");
      return;
    }
    if (dividerPersons.includes(personName)) {
      setDividerError("มีชื่อนี้อยู่แล้ว");
      return;
    }
    const updated = [...dividerPersons, personName];
    setDividerPersons(updated);
    setInputDivider("");
    setDividerError("");
    if (typeof window !== "undefined") {
      localStorage.setItem(DIVIDER_KEY, JSON.stringify(updated));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setShareWith(checked ? [...dividerPersons] : []);
  };

  const handlePersonToggle = (person: string) => {
    setShareWith((prev) =>
      prev.includes(person)
        ? prev.filter((p) => p !== person)
        : [...prev, person]
    );
  };

  const modalContent = (
    <div
      className="fixed top-0  w-screen h-screen z-[99999] flex items-center justify-center bg-black/70  animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 w-full sm:max-w-3xl mx-4 border-0 sm:border sm:border-neutral-800 rounded-xl  shadow-xl overflow-hidden animate-slide-up flex flex-col"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-800 flex-shrink-0 ">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            {initialData ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Input fields - Stack on mobile, row on larger screens */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <InputItem
                  label={
                    <>
                      ชื่อเมนู
                      <span className="text-red-400 ml-1 text-xs">*</span>
                    </>
                  }
                  placeholder="เช่น ข้าวผัด, ส้มตำ"
                  type="Text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  className={`text-white bg-transparent border-none outline-none focus:ring-1 ${
                    errors.name
                      ? "ring-red-500"
                      : "ring-neutral-700 focus:ring-white"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 px-4">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="w-full sm:w-24">
                <InputItem
                  label={
                    <>
                      จำนวน
                      <span className="text-red-400 ml-1 text-xs">*</span>
                    </>
                  }
                  placeholder="1"
                  type="Text"
                  value={qty}
                  onChange={(e) => {
                    setQty(e.target.value);
                    if (errors.qty) setErrors({ ...errors, qty: "" });
                  }}
                  className={`text-white bg-transparent border-none outline-none focus:ring-1 ${
                    errors.qty
                      ? "ring-red-500"
                      : "ring-neutral-700 focus:ring-white"
                  }`}
                />
                {errors.qty && (
                  <p className="text-red-500 text-xs mt-1 px-4">{errors.qty}</p>
                )}
              </div>
              <div className="w-full sm:w-32">
                <InputItem
                  label={
                    <>
                      ราคา (บาท)
                      <span className="text-red-400 ml-1 text-xs">*</span>
                    </>
                  }
                  placeholder="0"
                  type="Number"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price) setErrors({ ...errors, price: "" });
                  }}
                  className={`text-white bg-transparent border-none outline-none focus:ring-1 ${
                    errors.price
                      ? "ring-red-500"
                      : "ring-neutral-700 focus:ring-white"
                  }`}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1 px-4">
                    {errors.price}
                  </p>
                )}
              </div>
            </div>

            {/* VAT Option */}
            <div className="flex gap-2">
              <CheckBox
                checked={includeVat}
                onChange={setIncludeVat}
                id="includeVat"
                label="คิด VAT 7% สำหรับเมนูนี้"
              />
            </div>

            {/* Share With Section */}
            {dividerPersons.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <label className="text-sm font-medium text-neutral-400">
                    หารกับ ({dividerPersons.length} คน)
                  </label>
                  <button
                    onClick={() =>
                      handleSelectAll(
                        shareWith.length !== dividerPersons.length
                      )
                    }
                    className="text-xs px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors self-start sm:self-auto"
                  >
                    {shareWith.length === dividerPersons.length
                      ? "ยกเลิกทั้งหมด"
                      : "เลือกทั้งหมด"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-40 sm:max-h-60 overflow-y-auto p-2 -m-2">
                  {dividerPersons.map((person) => {
                    const isSelected = shareWith.includes(person);
                    return (
                      <button
                        key={person}
                        onClick={() => handlePersonToggle(person)}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all text-sm border-2 ${
                          isSelected
                            ? "bg-emerald-950 border-emerald-500 text-white"
                            : "bg-neutral-800 border-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:border-neutral-600 hover:text-white"
                        }`}
                      >
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-medium text-xs ${getColor(
                            person
                          )}`}
                        >
                          {person}
                        </span>
                        {isSelected && (
                          <Check size={16} className="text-emerald-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="flex items-center text-xs text-neutral-500 px-1">
                  <span>เลือกแล้ว: {shareWith.length} คน</span>
                </div>
              </div>
            )}

            {/* Add Person */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-neutral-400">
                เพิ่มคนหาร
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="ชื่อ"
                  className="flex-1 px-4 py-3 border-b border-neutral-700 text-white placeholder-neutral-500 focus:outline-none transition-all bg-transparent"
                  value={inputDivider}
                  onChange={(e) => {
                    setInputDivider(e.target.value);
                    if (dividerError) setDividerError("");
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleAddDividerPerson()
                  }
                />
                <button
                  onClick={handleAddDividerPerson}
                  disabled={
                    !inputDivider.trim() ||
                    dividerPersons.includes(inputDivider.trim())
                  }
                  className="px-4 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
                >
                  <Plus size={20} className="mx-auto sm:mx-0" />
                </button>
              </div>
              {dividerError && (
                <p className="text-red-500 text-xs mt-1 text-center">
                  {dividerError}
                </p>
              )}
            </div>

            {/* Total Amount */}
            {totalAmount > 0 && (
              <div className="flex flex-col gap-1 py-3 px-4 bg-neutral-800 rounded-lg border border-neutral-700">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-sm">ยอดรวม</span>
                  <span className="text-white font-semibold">
                    ฿{totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-neutral-400 text-xs">VAT 7%</span>
                  <span className="text-yellow-400 font-semibold text-sm">
                    ฿
                    {vatAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-neutral-400 text-xs">รวมทั้งหมด</span>
                  <span className="text-green-400 font-semibold text-sm">
                    ฿
                    {totalWithVat.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {shareWith.length > 0 && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-neutral-400 text-xs">
                      ตกคนละ (รวม VAT)
                    </span>
                    <span className="text-emerald-400 font-semibold text-sm">
                      ฿
                      {perPersonWithVat.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t border-neutral-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 text-neutral-300 border border-neutral-700 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors order-2 sm:order-1"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid}
            className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors order-1 sm:order-2 ${
              isFormValid
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
            }`}
          >
            {initialData ? "บันทึกการแก้ไข" : "บันทึก"}
          </button>
        </div>

        {/* Keyboard Shortcuts - Hide on mobile */}
        <div className="hidden sm:block px-6 pb-4 text-xs text-neutral-600 text-center">
          ESC เพื่อปิด • CTRL+ENTER เพื่อบันทึก
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
