"use client";

import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { useInView } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

type Parsed = {
  displayValue: number;     // the number we animate (scaled if K/M/B)
  prefix: string;           // e.g. "$"
  suffix: string;           // e.g. "%", "+", "K+"
  decimals: number;         // decimals to keep (max 2)
};

export function StatNumber({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true });
  const [n, setN] = useState(0);

  const parsed: Parsed | null = useMemo(() => {
    const raw = (value ?? "").trim();
    if (!raw) return null;

    // Matches: $2,000 | 5,000+ | 98% | 100K+ | 2.5M | 1600
    const m = raw.match(/^(\$)?\s*([\d,.]+)\s*([KMB])?\s*(\+|%)?\s*$/i);
    if (!m) return null;

    const prefix = m[1] ?? "";
    const numStr = (m[2] ?? "").replace(/,/g, "");
    const unit = (m[3] ?? "").toUpperCase();   // K/M/B or ""
    const tail = m[4] ?? "";                   // "+" or "%" or ""

    const base = Number(numStr);
    if (!Number.isFinite(base)) return null;

    const rawDecimals = numStr.split(".")[1]?.length ?? 0;
    let decimals = Math.min(rawDecimals, 2);

    // If unit exists, we animate the scaled number (base) and append unit+tail
    // Example: "120K+" => animate 120, suffix "K+"
    // If no unit, animate full number and append tail (like "%" or "+")
    let displayValue = base;
    let suffix = "";

    if (unit) {
      // trim useless decimals like 120.0 -> 120
      const rounded = Number(displayValue.toFixed(decimals));
      if (Number.isInteger(rounded)) decimals = 0;
      displayValue = rounded;

      suffix = unit + tail; // "K+", "M", etc.
    } else {
      // plain number (possibly with + or %)
      displayValue = decimals ? Number(displayValue.toFixed(decimals)) : Math.round(displayValue);
      suffix = tail; // "+", "%", or ""
    }

    return { displayValue, prefix, suffix, decimals };
  }, [value]);

  useEffect(() => {
    if (!parsed) return;
    if (isInView) setN(parsed.displayValue);
  }, [isInView, parsed]);

  // fallback for weird strings like "4.9/5"
  if (!parsed) {
    return (
      <div ref={ref} className="text-4xl lg:text-5xl font-bold text-primary mb-2">
        {value}
      </div>
    );
  }

  return (
    <div ref={ref} className="text-4xl lg:text-5xl font-bold text-primary mb-2 tabular-nums">
      {parsed.prefix && <span>{parsed.prefix}</span>}
      <AnimatedNumber
        value={n}
        springOptions={{ bounce: 0, duration: 1800 }}
        className="inline-flex"
      />
      {parsed.suffix && <span>{parsed.suffix}</span>}
    </div>
  );
}
