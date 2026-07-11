"use client";

import { LOTE_ONE_DEADLINE } from "@/app/utilities/constants";
import { LeadCaptureCta } from "@/app/components/LeadCaptureCta";
import { useCountdown } from "@/app/utilities/use-countdown";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function StickyHeader() {
  const { days, hours, minutes, seconds, expired } =
    useCountdown(LOTE_ONE_DEADLINE);

  if (expired) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-2 backdrop-blur-md bg-[rgba(10,6,18,0.85)] border-b border-[rgba(255,255,255,0.06)]">
      <p className="text-xs sm:text-sm text-[rgba(255,255,255,0.75)] text-center leading-tight">
        <span className="text-[rgba(245,158,11,0.9)] font-medium">
          Atenção:
        </span>{" "}
        O Lote 1 de{" "}
        <span className="font-semibold text-white">R$ 497</span> encerra em{" "}
        <span className="font-mono font-semibold text-white tabular-nums">
          {days > 0 ? `${pad(days)}d ` : ""}
          {pad(hours)}h {pad(minutes)}m {pad(seconds)}s
        </span>{" "}
        —{" "}
        <LeadCaptureCta
          location="sticky"
          className="underline underline-offset-2 text-gold-vivid hover:text-gold-primary transition-colors duration-200 cursor-pointer"
        >
          garantir vaga
        </LeadCaptureCta>
      </p>
    </header>
  );
}
