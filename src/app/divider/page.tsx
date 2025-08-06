"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Users } from "lucide-react";
import { getColor } from "@/constants/color";
import { Item } from "@/controllers/ListItem.controller";
import BadgeDivider from "@/components/BadgeDivider";

const DIVIDER_KEY = process.env.NEXT_PUBLIC_DIVIDER_KEY || "DIVIDER_PERSONS";
const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || "CHECKBILL_ITEMS";
const VAT_RATE = 0.07; // 7%

export default function DividerPage() {
  const [persons, setPersons] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [personAmounts, setPersonAmounts] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(DIVIDER_KEY);
    if (saved) setPersons(JSON.parse(saved));
    setIsLoaded(true);
  }, []); // <--- รันครั้งเดียวตอน mount

  useEffect(() => {
    // ดึงรายการอาหารทั้งหมดและคำนวณยอดจ่ายแต่ละคน (รวม VAT)
    if (typeof window === "undefined") return;
    const itemsRaw = localStorage.getItem(STORAGE_KEY);
    if (itemsRaw) {
      try {
        const items = JSON.parse(itemsRaw);
        const amounts: Record<string, number> = {};
        if (Array.isArray(items)) {
          persons.forEach((person) => {
            amounts[person] = 0;
          });
          items.forEach((item: Item) => {
            if (Array.isArray(item.shareWith) && item.shareWith.length > 0) {
              const sum = Number(item.price || 0) * Number(item.qty || 0);
              const perPerson = sum / item.shareWith.length;
              const perPersonWithVat = perPerson + perPerson * VAT_RATE;
              item.shareWith.forEach((person: string) => {
                if (amounts[person] !== undefined) {
                  amounts[person] += perPersonWithVat;
                }
              });
            }
          });
        }
        setPersonAmounts(amounts);
      } catch {
        setPersonAmounts({});
      }
    }
  }, [persons]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isLoaded) return;
    localStorage.setItem(DIVIDER_KEY, JSON.stringify(persons));
  }, [persons, isLoaded]);

  const handleAdd = () => {
    const name = input.trim();
    if (!name) {
      setError("Name cannot be empty.");
      return;
    }
    if (persons.includes(name)) {
      setError("This person has already been added.");
      return;
    }
    setPersons([...persons, name]);
    setInput("");
    setError(null);
  };

  const handleRemove = (nameToRemove: string) => {
    setPersons(persons.filter((name) => name !== nameToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen flex justify-center items-start py-12 sm:py-16 px-4">
      <div className="relative border border-white/20 rounded-2xl max-w-2xl w-full mx-auto p-6 sm:p-8 bg-black/70 shadow-2xl backdrop-blur-xl">
        <h1 className="text-4xl text-center font-bold text-white mb-4">
          คนหาร
        </h1>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter a name..."
              className="flex-grow p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white-500 transition-all"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
            />
            <button
              className="flex-shrink-0 p-3 bg-white rounded-lg hover:bg-white-500 transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed"
              onClick={handleAdd}
              aria-label="Add person"
              disabled={!input.trim()}
            >
              <Plus size={24} color="#000000" />
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white/80 mb-4">
            สมาชิก ({persons.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {persons.length > 0 ? (
                persons.map((name) => (
                  <motion.div
                    key={name}
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                  >
                    <BadgeDivider
                      name={name}
                      handleDelete={() => handleRemove(name)}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.2 } }}
                  className="text-center py-10 px-4 border-2 border-dashed border-white/20 rounded-lg w-full"
                >
                  <Users className="mx-auto text-white/30" size={40} />
                  <p className="text-white/60 mt-4">
                    The group is currently empty.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* แสดงจำนวนเงินที่แต่ละคนต้องจ่าย */}
        {persons.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white/80 mb-2">
              สรุปยอดจ่ายแต่ละคน
            </h2>
            <div className="flex flex-col gap-2">
              {persons.map((name) => (
                <div
                  key={name}
                  className="flex justify-between items-center px-4 py-2 rounded-lg font-medium text-sm bg-white/5"
                >
                  <BadgeDivider name={name} handleDelete={() => handleRemove(name)} />
                  <span className="text-emerald-400 font-semibold">
                    ฿
                    {personAmounts[name]
                      ? personAmounts[name].toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : "0"}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/50 mt-2 text-center">
              *หมายเหตุ: ระบบจะบันทึกข้อมูลชื่อสมาชิกไว้ในเครื่องของคุณเท่านั้น
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
