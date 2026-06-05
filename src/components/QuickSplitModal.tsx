"use client";
import { useState } from "react";
import { X, Users, Equal } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/components/LanguageProvider";

interface QuickSplitModalProps {
  persons: string[];
  onAdd: (item: {
    name: string;
    qty: number;
    price: number;
    shareWith: string[];
    includeVat: boolean;
  }) => void;
  onClose: () => void;
}

const VAT_RATE = 0.07;

export default function QuickSplitModal({
  persons,
  onAdd,
  onClose,
}: QuickSplitModalProps) {
  const { t } = useLang();
  const [total, setTotal] = useState("");
  const [name, setName] = useState("");
  const [includeVat, setIncludeVat] = useState(false);
  const [selected, setSelected] = useState<string[]>([...persons]);

  const totalNum = parseFloat(total) || 0;
  const vatAmount = includeVat ? totalNum * VAT_RATE : 0;
  const totalWithVat = totalNum + vatAmount;
  const perPerson = selected.length > 0 ? totalWithVat / selected.length : 0;
  const canAdd = totalNum > 0 && selected.length > 0;

  const toggleAll = () =>
    setSelected(selected.length === persons.length ? [] : [...persons]);

  const togglePerson = (person: string) =>
    setSelected((prev) =>
      prev.includes(person) ? prev.filter((p) => p !== person) : [...prev, person]
    );

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd({
      name: name.trim() || t("split.defaultName"),
      qty: 1,
      price: totalNum,
      shareWith: selected,
      includeVat,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-[var(--surface-raised)] border border-[var(--surface-border)] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md sm:mx-4 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--accent)]/15 rounded-lg">
              <Equal size={18} className="text-[var(--accent)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {t("split.title")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-overlay)] transition-colors"
            aria-label="ปิด"
          >
            <X size={18} className="text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name (optional) */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              {t("split.nameLabel")}
            </label>
            <input
              type="text"
              placeholder={t("split.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--surface-overlay)] border border-[var(--surface-border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition-all text-sm"
            />
          </div>

          {/* Total amount */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              {t("split.totalLabel")}
            </label>
            <input
              type="number"
              placeholder="0"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              autoFocus
              className="w-full px-3 py-2.5 bg-[var(--surface-overlay)] border border-[var(--surface-border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition-all text-base text-center font-semibold"
            />
          </div>

          {/* VAT toggle */}
          <label className="flex items-center gap-3 cursor-pointer py-0.5 select-none">
            <input
              type="checkbox"
              checked={includeVat}
              onChange={(e) => setIncludeVat(e.target.checked)}
            />
            <span className="text-sm text-[var(--text-secondary)]">{t("split.vatToggle")}</span>
            {includeVat && totalNum > 0 && (
              <span className="text-xs text-yellow-400 ml-auto">
                +฿
                {vatAmount.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            )}
          </label>

          {/* Person selector */}
          {persons.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[var(--text-muted)]">
                  {t("split.selectPeople")} ({selected.length}/{persons.length})
                </label>
                <button
                  onClick={toggleAll}
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  {selected.length === persons.length
                    ? t("split.deselectAll")
                    : t("split.selectAll")}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {persons.map((person) => (
                  <button
                    key={person}
                    onClick={() => togglePerson(person)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selected.includes(person)
                        ? "bg-[var(--accent)] text-[var(--on-accent)]"
                        : "bg-[var(--surface-overlay)] text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
                    }`}
                  >
                    {person}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 py-2.5 px-3 bg-[var(--surface-subtle)] rounded-xl">
              <Users size={15} className="text-[var(--text-muted)] flex-shrink-0" />
              <span className="text-sm text-[var(--text-muted)]">
                {t("split.noPeople")}
              </span>
            </div>
          )}

          {/* Per-person result */}
          {canAdd && (
            <div className="bg-[var(--surface-overlay)] rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">{t("split.perPersonLabel")}</span>
              <span className="text-xl font-bold text-emerald-400">
                ฿
                {perPerson.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-[var(--text-secondary)] border border-[var(--surface-border)] rounded-xl hover:bg-[var(--surface-overlay)] transition-colors text-sm"
          >
            {t("split.cancel")}
          </button>
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="flex-1 py-2.5 bg-[var(--accent)] text-[var(--on-accent)] rounded-xl font-semibold hover:bg-[var(--accent-hover)] transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("split.addItem")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
