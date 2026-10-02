"use client";

import Link from "next/link";
import { useFile } from "@/lib/store";

export function useT() {
  const lang = useFile((s) => s.lang);
  return (en: string, ar: string) => (lang === "ar" ? ar : en);
}

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "lg" | "xs";
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  label?: string;
  children: React.ReactNode;
};

export function Button({ variant = "secondary", size, href, type = "button", onClick, disabled, label, children }: ButtonProps) {
  const className = `hal-btn hal-btn--${variant}${size ? ` hal-btn--${size}` : ""}`;
  if (href) {
    return (
      <Link href={href} className={className} aria-label={label}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className} aria-label={label}>
      {children}
    </button>
  );
}

export function Check({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="hal-check">
      <input type="checkbox" className="hal-check__input" checked={checked} onChange={onChange} />
      {children}
    </label>
  );
}

export function Tabs<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="hal-tabs" role="tablist" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className="hal-tab"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
