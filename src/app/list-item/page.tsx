"use client";
import { useState, useEffect } from "react";
import InputItem from "@/components/Form/InputItem";
import { Plus, Trash2 } from "lucide-react";
import { ListItemController, Item } from "@/controllers/ListItem.controller";

const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY;

export default function ListItemPage() {
  const [rows, setRows] = useState<Item[]>([]);

  useEffect(() => {
    if (!STORAGE_KEY) return;
    setRows(ListItemController.getAll(STORAGE_KEY));
  }, []);

  useEffect(() => {
    if (!STORAGE_KEY) return;
    ListItemController.saveAll(STORAGE_KEY, rows);
  }, [rows]);

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
    return (
      <div className="text-red-500 text-center mt-10">
        ไม่พบ NEXT_PUBLIC_STORAGE_KEY ใน .env กรุณาตั้งค่าให้ถูกต้อง
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start py-16 px-4">
      <div className="relative border border-white/20 rounded-2xl max-w-4xl w-full mx-auto p-8 bg-black/70 shadow-2xl backdrop-blur-lg">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-4xl font-bold text-white">รายการอาหาร</h1>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 mb-6">
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
                  ลบ
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
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
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="p-2 rounded-full hover:bg-red-500/20 transition-colors"
                      aria-label="ลบ"
                    >
                      <Trash2 className="text-red-400" size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end mb-6">
          <span className="text-xl text-orange-300 font-bold">
            รวม:{" "}
            {rows.reduce((sum, r) => sum + Number(r.price) * Number(r.qty), 0)}{" "}
            บาท
          </span>
        </div>

        {/* Add Button & Save Button */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform"
          >
            <Plus size={20} /> เพิ่มรายการ
          </button>
        </div>
      </div>
    </div>
  );
}
