"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

function formatBRL(cents: number): string {
  if (cents === 0) return "";
  const abs = Math.abs(cents);
  const reais = Math.floor(abs / 100);
  const centavos = abs % 100;
  const formatted = reais.toLocaleString("pt-BR");
  const decimal = String(centavos).padStart(2, "0");
  return `${formatted},${decimal}`;
}

function parseToCents(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return 0;
  return Number(digits);
}

export function CurrencyInput({
  value,
  onChange,
  className,
  placeholder = "0,00",
  disabled,
}: {
  value: number;
  onChange: (cents: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [display, setDisplay] = useState(() => formatBRL(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setDisplay(formatBRL(value));
    }
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const cents = parseToCents(raw);
      setDisplay(formatBRL(cents));
      onChange(cents);
    },
    [onChange],
  );

  const handleFocus = useCallback(() => {
    isFocused.current = true;
    requestAnimationFrame(() => {
      inputRef.current?.select();
    });
  }, []);

  const handleBlur = useCallback(() => {
    isFocused.current = false;
    setDisplay(formatBRL(value));
  }, [value]);

  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        R$
      </span>
      <input
        ref={inputRef}
        inputMode="decimal"
        className="h-8 w-full min-w-0 rounded-lg border border-input bg-white py-1 pl-10 pr-2.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80"
        value={display}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
