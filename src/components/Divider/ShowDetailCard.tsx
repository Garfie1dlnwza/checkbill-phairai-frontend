import React from "react";
import { Item } from "@/controllers/ListItem.controller";

interface ShowDetailCardProps {
  name: string;
  items: Item[];
}
export default function ShowDetailCard({ name, items }: ShowDetailCardProps) {
  const VAT_RATE = 0.07;
  const filteredItems = items.filter(
    (item) => Array.isArray(item.shareWith) && item.shareWith.includes(name)
  );

  return (
    <div className="bg-[var(--surface-overlay)] rounded-2xl p-5 mt-2 text-[var(--text-primary)] shadow-lg">
      <h3 className="font-semibold mb-2 text-md text-[var(--text-primary)]">รายละเอียดของ {name}</h3>
      {filteredItems.length === 0 ? (
        <p className="text-[var(--text-secondary)] text-center">ไม่มีรายการที่ต้องจ่าย</p>
      ) : (
        <ul className="space-y-3">
          {filteredItems.map((item, idx) => {
            const perPerson = (item.price * item.qty) / item.shareWith.length;
            const vat = item.includeVat ? perPerson * VAT_RATE : 0;
            return (
              <li key={idx} className="flex flex-col gap-1 bg-[var(--surface-subtle)] rounded-xl px-4 py-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[var(--text-secondary)]">
                    {item.name} <span className="text-[var(--text-muted)]">x {item.qty}</span>
                  </span>
                  <div className="text-right">
                    <span className="block text-emerald-400 font-semibold text-base">
                      ฿{(perPerson + vat).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    {item.includeVat && (
                      <span className="block text-xs text-[var(--text-muted)]">
                        ฿{vat.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="ml-1">VAT 7%</span>
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}