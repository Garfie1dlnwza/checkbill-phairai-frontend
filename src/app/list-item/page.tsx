"use client";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash2, ShoppingCart, Edit2, RotateCcw, Equal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ListItemController, Item } from "@/controllers/ListItem.controller";
import CardCreateItem from "@/components/CardCreateItem";
import BadgeDivider from "@/components/BadgeDivider";
import QuickSplitModal from "@/components/QuickSplitModal";
import { useLang } from "@/components/LanguageProvider";
const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY;
const DIVIDER_KEY = process.env.NEXT_PUBLIC_DIVIDER_KEY;

const VAT_RATE = 0.07;

export default function ListItemPage() {
  const { t } = useLang();
  const [rows, setRows] = useState<Item[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [personCount, setPersonCount] = useState(0);
  const [dividerPersons, setDividerPersons] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showQuickSplit, setShowQuickSplit] = useState(false);
  const [editRow, setEditRow] = useState<Item | null>(null);

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

  // ฟังก์ชันล้างบิลทั้งหมด
  const handleClearBill = () => {
    const confirmed = window.confirm(t("list.confirmClear"));
    
    if (confirmed) {
      // ล้าง localStorage ทั้งหมดที่เกี่ยวข้อง
      if (STORAGE_KEY) localStorage.removeItem(STORAGE_KEY);
      if (DIVIDER_KEY) localStorage.removeItem(DIVIDER_KEY);
      
      // ล้างข้อมูลอื่นๆ ที่อาจเกี่ยวข้อง (เช่น payment info)
      localStorage.removeItem('paymentInfo');
      
      // Reset state
      setRows([]);
      setPersonCount(0);
      setDividerPersons([]);
      setShowCreate(false);
      setEditRow(null);
      
      alert(t("list.clearSuccess"));
    }
  };

  if (!STORAGE_KEY) {
    return null;
  }

  const total = rows.reduce(
    (sum, r) => sum + Number(r.price) * Number(r.qty),
    0
  );

  return (
    <div className="min-h-screen flex justify-center items-start py-8 md:py-16 px-2 sm:px-4">
      <div className="relative border border-[var(--surface-border)] rounded-2xl max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 bg-[var(--surface-raised)] shadow-2xl z-10">
        <div className="flex items-center justify-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center">{t("list.title")}</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-2 mb-4 md:mb-6">
          <span className="text-base sm:text-lg lg:text-xl text-[var(--text-secondary)] text-center sm:text-left">
            {t("list.dividerCount")}: {personCount}
          </span>
          <span className="text-lg sm:text-xl text-[var(--accent)] font-bold text-center sm:text-right">
            {t("list.total")}: {total.toLocaleString()} {t("list.baht")}
          </span>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden mb-6">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border border-[var(--surface-border)] bg-[var(--surface-subtle)] rounded-xl">
              <ShoppingCart className="text-[var(--text-muted)] mb-4" size={48} />
              <div className="text-[var(--text-secondary)] text-lg">{t("list.empty")}</div>
            </div>
          ) : (
            <div className="space-y-4">
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
                    <motion.div
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
                      className="border border-[var(--surface-border)] bg-[var(--surface-subtle)] rounded-xl p-4 space-y-3"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{row.name}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditRow(row)}
                            className="p-2 rounded-full hover:bg-blue-500/20 transition-colors"
                            aria-label={t("list.editLabel")}
                          >
                            <Edit2 className="text-blue-400" size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="p-2 rounded-full hover:bg-red-500/20 transition-colors"
                            aria-label={t("list.deleteLabel")}
                          >
                            <Trash2 className="text-red-400" size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-[var(--text-secondary)]">{t("list.labelQty")}</span>
                          <span className="text-[var(--text-primary)] font-semibold ml-2">{row.qty}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">{t("list.labelPrice")}</span>
                          <span className="text-[var(--text-primary)] font-semibold ml-2">{row.price}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">{t("list.labelSum")}</span>
                          <span className="text-[var(--text-primary)] font-semibold ml-2">{sum.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">{t("list.labelVat")}</span>
                          <span className="text-yellow-400 font-semibold ml-2">
                            {row.shareWith.length > 0
                              ? vatPerPerson.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })
                              : "—"}
                          </span>
                        </div>
                      </div>

                      {/* Per Person */}
                      <div className="border-t border-[var(--surface-border)] pt-3">
                        <div className="text-center">
                          <span className="text-[var(--text-secondary)] text-sm">{t("list.labelPerPerson")}</span>
                          <span className="text-green-400 font-bold text-lg ml-2">
                            {row.shareWith.length > 0
                              ? perPersonWithVat.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })
                              : "—"}
                            {row.shareWith.length > 0 && ` ${t("list.baht")}`}
                          </span>
                        </div>
                      </div>

                      {/* Share With */}
                      <div>
                        <div className="text-[var(--text-secondary)] text-sm mb-2">{t("list.labelDividers")}</div>
                        <div className="flex flex-wrap gap-2">
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
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-[var(--surface-border)] bg-[var(--surface-subtle)] mb-6">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="text-[var(--text-muted)] mb-4" size={48} />
              <div className="text-[var(--text-secondary)] text-lg">{t("list.empty")}</div>
            </div>
          ) : (
            <table className="w-full text-[var(--text-primary)]">
              <thead>
                <tr className="border-b border-[var(--surface-border)] bg-[var(--surface-overlay)]">
                  <th className="py-3 px-2 lg:px-4 text-sm lg:text-lg font-semibold text-center min-w-[100px]">
                    {t("list.colMenu")}
                  </th>
                  <th className="py-3 px-2 lg:px-4 text-sm lg:text-lg font-semibold text-center min-w-[60px]">
                    {t("list.colQty")}
                  </th>
                  <th className="py-3 px-2 lg:px-4 text-sm lg:text-lg font-semibold text-center min-w-[60px]">
                    {t("list.colPrice")}
                  </th>
                  <th className="py-3 px-2 lg:px-4 text-sm lg:text-lg font-semibold text-center min-w-[60px]">
                    {t("list.colSum")}
                  </th>
                  <th className="py-3 px-2 lg:px-4 text-sm lg:text-lg font-semibold text-center min-w-[80px]">
                    {t("list.colVat")}
                  </th>
                  <th className="py-3 px-2 lg:px-4 text-sm lg:text-lg font-semibold text-center min-w-[80px]">
                    {t("list.colPerPerson")}
                  </th>
                  <th className="py-3 px-2 lg:px-4 text-sm lg:text-lg font-semibold text-center min-w-[120px]">
                    {t("list.colDividers")}
                  </th>
                  <th className="py-3 px-2 lg:px-4 text-sm lg:text-lg font-semibold text-center min-w-[80px]">
                    {t("list.colManage")}
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
                        className="hover:bg-[var(--surface-overlay)] transition-colors border-b border-[var(--surface-border)]"
                      >
                        <td className="py-3 px-2 lg:px-4 text-center font-semibold text-sm lg:text-base">
                          <div className="truncate max-w-[100px] lg:max-w-none" title={row.name}>
                            {row.name}
                          </div>
                        </td>
                        <td className="py-3 px-2 lg:px-4 text-center font-semibold text-sm lg:text-base">
                          {row.qty}
                        </td>
                        <td className="py-3 px-2 lg:px-4 text-center font-semibold text-sm lg:text-base">
                          {row.price}
                        </td>
                        <td className="py-3 px-2 lg:px-4 text-center font-semibold text-sm lg:text-base">
                          {sum.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 lg:px-4 text-center text-yellow-400 font-semibold text-sm lg:text-base">
                          {row.shareWith.length > 0
                            ? vatPerPerson.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })
                            : "—"}
                        </td>
                        <td className="py-3 px-2 lg:px-4 text-center text-green-400 font-semibold text-sm lg:text-base">
                          {row.shareWith.length > 0
                            ? perPersonWithVat.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })
                            : "—"}
                        </td>

                        <td className="py-3 px-2 lg:px-4 text-center relative">
                          <div className="flex flex-wrap gap-1 lg:gap-2 justify-center">
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
                              <span className="text-[var(--text-muted)]">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 lg:px-4 text-center">
                          <div className="flex gap-1 lg:gap-2 justify-center">
                            <button
                              onClick={() => setEditRow(row)}
                              className="p-1 lg:p-2 rounded-full hover:bg-blue-500/20 transition-colors"
                              aria-label={t("list.editLabel")}
                            >
                              <Edit2 className="text-blue-400" size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(row.id)}
                              className="p-1 lg:p-2 rounded-full hover:bg-red-500/20 transition-colors"
                              aria-label={t("list.deleteLabel")}
                            >
                              <Trash2 className="text-red-400" size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] font-semibold shadow-lg hover:bg-[var(--accent-hover)] transition-colors text-sm sm:text-base"
          >
            <Plus size={20} />
            {t("list.addItem")}
          </button>
          <button
            onClick={() => setShowQuickSplit(true)}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-primary)] font-semibold hover:border-[var(--accent)]/50 hover:bg-[var(--surface-subtle)] transition-colors text-sm sm:text-base"
          >
            <Equal size={20} />
            {t("list.quickSplit")}
          </button>

          {(rows.length > 0 || personCount > 0) && (
            <button
              onClick={handleClearBill}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-red-600 text-white font-semibold shadow-lg hover:scale-105 hover:bg-red-700 transition-all text-sm sm:text-base"
            >
              <RotateCcw size={20} />
              {t("list.clearBill")}
            </button>
          )}
        </div>
        
        {showCreate && (
          <CardCreateItem
            onSave={handleAddItem}
            onClose={() => setShowCreate(false)}
          />
        )}
        {showQuickSplit && (
          <QuickSplitModal
            persons={dividerPersons}
            onAdd={handleAddItem}
            onClose={() => setShowQuickSplit(false)}
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
              includeVat: editRow.includeVat, 
            }}
          />
        )}
      </div>
    </div>
  );
}