"use client";
import { useState, useEffect } from "react";
import InputItem from "@/components/Form/InputItem";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ListItemController, Item } from "@/controllers/ListItem.controller";

const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || "CHECKBILL_ITEMS";
const DIVIDER_KEY = process.env.NEXT_PUBLIC_DIVIDER_KEY || "DIVIDER_PERSONS";

export default function ListItemPage() {
  const [rows, setRows] = useState<Item[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [personCount, setPersonCount] = useState(0);

  useEffect(() => {
    if (!STORAGE_KEY) return;
    setRows(ListItemController.getAll(STORAGE_KEY));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!STORAGE_KEY) return;
    if (!isLoaded) return; 
    ListItemController.saveAll(STORAGE_KEY, rows);
  }, [rows, isLoaded]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(DIVIDER_KEY);
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        setPersonCount(Array.isArray(arr) ? arr.length : 0);
      } catch {
        setPersonCount(0);
      }
    } else {
      setPersonCount(0);
    }
  }, []);

  const handleChange = (id: number, field: string, value: string | number) => {
    setRows(
      rows.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                field === "name"
                  ? value
                  : value === "" || isNaN(Number(value))
                  ? 0
                  : Number(value),
            }
          : row
      )
    );
  };

  const handleDelete = (id: number) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleAdd = () => {
    setRows([...rows, { id: Date.now(), name: "", price: 0, qty: 1 }]);
  };

  if (!STORAGE_KEY) {
    return;
  }

  const total = rows.reduce(
    (sum, r) => sum + Number(r.price) * Number(r.qty),
    0
  );

  return (
    <div className="min-h-screen flex justify-center items-start py-16 px-4">
      <div className="relative border border-white/20 rounded-2xl max-w-4xl w-full mx-auto p-8 bg-black/70 shadow-2xl backdrop-blur-lg z-20">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-4xl font-bold text-white">รายการอาหาร</h1>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-end gap-2 mb-6">
          <span className="text-xl text-white/80 ml-4">
            จำนวนคนหาร: {personCount}
          </span>
          <span className="text-xl text-orange-300 font-bold">
            รวม: {total.toLocaleString()} บาท
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 mb-6">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="text-white/30 mb-4" size={48} />
              <div className="text-white/60 text-lg">ยังไม่มีรายการ</div>
            </div>
          ) : (
            <table className="w-full text-white table-fixed">
              <thead>
                <tr className="border-b border-white/20 bg-white/10">
                  <th className="py-3 px-4 text-lg font-semibold text-center w-1/5">
                    เมนู
                  </th>
                  <th className="py-3 px-4 text-lg font-semibold text-center w-1/5">
                    จำนวน
                  </th>
                  <th className="py-3 px-4 text-lg font-semibold text-center w-1/5">
                    ราคา
                  </th>
                  <th className="py-3 px-4 text-lg font-semibold text-center w-1/5">
                    รวม
                  </th>
                  <th className="py-3 px-4 text-lg font-semibold text-center w-1/5">
                    ลบ
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {rows.map((row) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        x: -50,
                        transition: { duration: 0.2 },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 24,
                      }}
                      className="hover:bg-white/5 transition-colors border-b border-white/10"
                    >
                      <td className="py-3 px-4 items-center justify-center">
                        <InputItem
                          label=""
                          placeholder="ชื่อเมนู"
                          type="Text"
                          value={row.name}
                          onChange={(e) =>
                            handleChange(row.id, "name", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-3 px-4 items-center justify-center">
                        <InputItem
                          label=""
                          placeholder="จำนวน"
                          type="Text"
                          value={row.qty}
                          onChange={(e) =>
                            handleChange(row.id, "qty", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-3 px-4 items-center justify-center">
                        <InputItem
                          label=""
                          placeholder="ราคา"
                          type="Number"
                          value={row.price}
                          onChange={(e) =>
                            handleChange(row.id, "price", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-3 px-4 text-center font-semibold">
                        {(Number(row.price) * Number(row.qty)).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="p-2 rounded-full hover:bg-red-500/20 transition-colors"
                          aria-label="ลบ"
                        >
                          <Trash2 className="text-red-400" size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {/* Add Button */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold shadow-lg hover:scale-105 transition-transform"
          >
            <Plus size={20} color="#000000" />
            เพิ่มรายการ
          </button>
        </div>
      </div>
    </div>
  );
}
