import React from "react";

type InputItemProps = {
  label?: React.ReactNode;
  type: "Text" | "Number";
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
};

export default function InputItem({
  label,
  placeholder,
  value,
  onChange,
  type,
  className = "",
  disabled = false,
  required = false,
}: InputItemProps) {
  const baseInputClasses = `
    px-4 py-2 w-full
    bg-white/10 backdrop-blur-sm
    border border-white/20
    text-white placeholder-white/60
    rounded-lg
    focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40
    hover:bg-white/15 hover:border-white/30
    transition-all duration-200 ease-in-out
    disabled:opacity-50 disabled:cursor-not-allowed
    text-center
    ${className}
  `;

  const isEmpty =
    required &&
    (value === undefined || value === null || String(value).trim() === "");

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-white mb-1">
          {label}
        </label>
      )}
      {type === "Text" && (
        <input
          type="text"
          placeholder={placeholder}
          value={
            value === undefined || value === null || Number.isNaN(value)
              ? ""
              : String(value)
          }
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={baseInputClasses}
          aria-label={typeof label === "string" ? label : undefined}
        />
      )}
      {type === "Number" && (
        <div className="relative w-full">
          <input
            type="number"
            placeholder={placeholder}
            value={value ?? ""}
            onChange={onChange}
            disabled={disabled}
            required={required}
            min="0"
            step="0.01"
            className={`${baseInputClasses} pr-12`}
            aria-label={typeof label === "string" ? label : undefined}
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-white/60 text-sm font-medium">บาท</span>
          </div>
        </div>
      )}
      {isEmpty && <p className="text-red-400 text-xs mt-1">* จำเป็นต้องกรอก</p>}
    </div>
  );
}
