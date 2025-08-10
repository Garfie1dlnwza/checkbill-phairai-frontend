"use client";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash2, ShoppingCart, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ListItemController, Item } from "@/controllers/ListItem.controller";
import CardCreateItem from "@/components/CardCreateItem";
import BadgeDivider from "@/components/BadgeDivider";
const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY;
const DIVIDER_KEY = process.env.NEXT_PUBLIC_DIVIDER_KEY;

const VAT_RATE = 0.07; // 7%

export default function ListItemPage() {
  const [rows, setRows] = useState<Item[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [personCount, setPersonCount] = useState(0);
  const [dividerPersons, setDividerPersons] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editRow, setEditRow] = useState<Item | null>(null);

  // โหลดข้อมูลรายการอาหาร
  useEffect(() => {
    if (!STORAGE_KEY) return;
    setRows(ListItemController.getAll(STORAGE_KEY));
    setIsLoaded(true);
  }, []);

  // บันทึกข้อมูลรายการอาหารเมื่อ rows เปลี่ยน
  useEffect(() => {
    if (!STORAGE_KEY) return;
    if (!isLoaded) return;
    ListItemController.saveAll(STORAGE_KEY, rows);
  }, [rows, isLoaded]);

  // โหลดข้อมูล dividerPersons
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!DIVIDER_KEY) return;
    const saved = localStorage.getItem(DIVIDER_KEY);
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        setPersonCount(Array.isArray(arr) ? arr.length : 0);
        setDividerPersons(Array.isArray(arr) ? arr : []);
      } catch {
        setPersonCount(0);
        setDividerPersons([]);
      }
    } else {
      setPersonCount(0);
      setDividerPersons([]);
    }
  }, []);

  // ฟัง event storage เพื่อ sync dividerPersons ข้ามหน้า/แท็บ
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === DIVIDER_KEY) {
        const saved = localStorage.getItem(DIVIDER_KEY);
        if (saved) {
          try {
            const arr = JSON.parse(saved);
            setPersonCount(Array.isArray(arr) ? arr.length : 0);
            setDividerPersons(Array.isArray(arr) ? arr : []);
          } catch {
            setPersonCount(0);
            setDividerPersons([]);
          }
        } else {
          setPersonCount(0);
          setDividerPersons([]);
        }
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Sync dividerPersons กับ shareWith ของทุก row ใน table
  useEffect(() => {
    if (dividerPersons.length === 0) return; // ถ้าไม่มี divider ไม่ต้องลบ shareWith
    setRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        shareWith: row.shareWith.filter((name) =>
          dividerPersons.includes(name)
        ),
      }))
    );
  }, [dividerPersons]);

  const handleDelete = (id: string) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleAddItem = (item: {
    name: string;
    qty: number;
    price: number;
    shareWith: string[];
    includeVat?: boolean;
  }) => {
    setRows([
      ...rows,
      {
        id: uuidv4(),
        name: item.name,
        price: item.price,
        qty: item.qty,
        shareWith: item.shareWith,
        includeVat: item.includeVat ?? false, // เพิ่มตรงนี้
      },
    ]);
  };

  // ลบชื่อออกจาก shareWith ของ row นั้น
  const handleRemoveDivider = (rowId: string, name: string) => {
    setRows(
      rows.map((row) =>
        row.id === rowId
          ? { ...row, shareWith: row.shareWith.filter((n) => n !== name) }
          : row
      )
    );
  };

  // สำหรับแก้ไขรายการ
  const handleEditItem = (item: {
    name: string;
    qty: number;
    price: number;
    shareWith: string[];
    includeVat?: boolean;
  }) => {
    if (!editRow) return;
    setRows(
      rows.map((row) =>
        row.id === editRow.id
          ? {
              ...row,
              name: item.name,
              qty: item.qty,
              price: item.price,
              shareWith: item.shareWith,
              includeVat: item.includeVat ?? false, // เพิ่มตรงนี้
            }
          : row
      )
    );
    setEditRow(null);
  };

  if (!STORAGE_KEY) {
    return null;
  }

  const total = rows.reduce(
    (sum, r) => sum + Number(r.price) * Number(r.qty),
    0
  );

  return (
    <div className="min-h-screen flex justify-center items-start py-16 px-4">
      <div className="relative border border-white/20 rounded-2xl max-w-7xl w-full mx-auto p-8 bg-black/70 shadow-2xl backdrop-blur-lg z-20">
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
                  <th className="py-3 px-4 text-lg font-semibold text-center w-1/12">
                    เมนู
                  </th>
                  <th className="py-3 px-4 text-lg font-semibold text-center w-1/12">
                    จำนวน
                  </th>
                  <th className="py-3 px-4 text-lg font-semibold text-center w-1/12">
                    ราคา
                  </th>
                  <th className="py-3 px-4 text-lg font-semibold text-center w-1/12">
                    รวม
                  </th>
                  <th className="py-3 px-4 text-lg font-semibold text-center w-2/12">
                    VAT ต่อคน
                  </th>
                  <th className="py-3 px-4 text-lg font-semibold text-center w-1/12">
                    ตกคนละ
                  </th>

                  <th className="py-3 px-4 text-lg font-semibold text-center w-2/6">
                    คนหาร
                  </th>
                  <th className="py-3 px-4 text-lg font-semibold text-center w-1/12">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {rows.map((row) => {
                    const sum = Number(row.price) * Number(row.qty);
                    const perPerson =
                      row.shareWith.length > 0 ? sum / row.shareWith.length : 0;
                    const vatPerPerson =
                      row.includeVat && row.shareWith.length > 0 ? perPerson * VAT_RATE : 0;
                    const perPersonWithVat =
                      row.shareWith.length > 0 ? perPerson + vatPerPerson : 0;
                    return (
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
                        <td className="py-3 px-4 text-center font-semibold">
                          {row.name}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          {row.qty}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          {row.price}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          {sum.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center text-yellow-400 font-semibold">
                          {row.shareWith.length > 0
                            ? vatPerPerson.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })
                            : "—"}
                        </td>
                        <td className="py-3 px-4 text-center text-green-400 font-semibold">
                          {row.shareWith.length > 0
                            ? perPersonWithVat.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })
                            : "—"}
                        </td>

                        <td className="py-3 px-4 text-center relative">
                          <div
                            className={`flex flex-wrap gap-2 mb-2 ${
                              row.shareWith.length === 1
                                ? "justify-center"
                                : "justify-start"
                            }`}
                          >
                            {row.shareWith.length > 0 ? (
                              row.shareWith.map((name) => (
                                <BadgeDivider
                                  key={name}
                                  name={name}
                                  handleDelete={() =>
                                    handleRemoveDivider(row.id, name)
                                  }
                                />
                              ))
                            ) : (
                              <span className="text-white/50">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center flex gap-2 justify-center">
                          <button
                            onClick={() => setEditRow(row)}
                            className="p-2 rounded-full hover:bg-blue-500/20 transition-colors"
                            aria-label="แก้ไข"
                          >
                            <Edit2 className="text-blue-400" size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="p-2 rounded-full hover:bg-red-500/20 transition-colors"
                            aria-label="ลบ"
                          >
                            <Trash2 className="text-red-400" size={20} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {/* Add Button */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold shadow-lg hover:scale-105 transition-transform"
          >
            <Plus size={20} color="#000000" />
            เพิ่มรายการ
          </button>
        </div>
        {showCreate && (
          <CardCreateItem
            onSave={handleAddItem}
            onClose={() => setShowCreate(false)}
          />
        )}
        {editRow && (
          <CardCreateItem
            onSave={handleEditItem}
            onClose={() => setEditRow(null)}
            initialData={{
              name: editRow.name,
              qty: editRow.qty,
              price: editRow.price,
              shareWith: editRow.shareWith,
              includeVat: editRow.includeVat, // เพิ่มตรงนี้
            }}
          />
        )}
      </div>
    </div>
  );
}
