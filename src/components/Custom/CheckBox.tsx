import React from "react";

interface CheckBoxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  label?: React.ReactNode;
  className?: string;
}

export default function CheckBox({
  checked,
  onChange,
  id,
  label,
  className = "",
}: CheckBoxProps) {
  return (
    <label className={`inline-flex items-center cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        id={id}
        className="sr-only peer"
      />
      <span
        className={`w-5 h-5 rounded-full border border-emerald-500 bg-neutral-900 flex items-center justify-center transition-colors peer-checked:bg-emerald-500`}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 20 20"
          >
            <polyline
              points="5 10 9 14 15 6"
              fill="none"
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {label && (
        <span className="ml-2 text-sm text-neutral-400 select-none">{label}</span>
      )}
    </label>
  );
}