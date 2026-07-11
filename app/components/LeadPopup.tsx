"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { CHECKOUT_URL, LEAD_ENDPOINT, LOTE_ONE_PRICE } from "@/app/utilities/constants";
import { track, type CtaLocation } from "@/app/utilities/track";

// Nome do CustomEvent que abre o pop-up. Os CTAs (LeadCaptureCta) disparam este
// evento em vez de navegar direto ao checkout — o pop-up captura o lead
// (referência: pop-up de inscrição da Xperiun) e só então redireciona ao Sympla.
const OPEN_EVENT = "kalidash:lead-popup";

export function openLeadPopup(location: CtaLocation) {
  window.dispatchEvent(new CustomEvent<{ location: CtaLocation }>(OPEN_EVENT, { detail: { location } }));
}

type Fields = { name: string; email: string; phone: string };
type FieldErrors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Máscara (31) 99999-9999 — aceita fixo (10 dígitos) e celular (11). */
function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function validate({ name, email, phone }: Fields): FieldErrors {
  const errors: FieldErrors = {};
  if (name.trim().length < 2) errors.name = "Informe seu nome.";
  if (!EMAIL_RE.test(email.trim())) errors.email = "Insira um email válido.";
  if (phone.replace(/\D/g, "").length < 10) errors.phone = "Informe um WhatsApp válido com DDD.";
  return errors;
}

/**
 * Pop-up de captura de lead — abre em qualquer CTA "Garantir vaga".
 * Fluxo: preencher nome/email/whatsapp → `lead_submit` no dataLayer (segurando
 * o redirect via eventCallback, mesma mecânica do TrackedLink) → checkout Sympla.
 * O POST do lead (LEAD_ENDPOINT) é fire-and-forget: falha no CRM nunca impede
 * o usuário de chegar ao checkout.
 *
 * Estética: segue a linguagem das seções da LP — eyebrow uppercase à esquerda,
 * headline extrabold com tracking negativo, card #0f0b1c com borda sutil e
 * glow roxo difuso, CTA dourado com pulse-gold (mesmo botão do investimento).
 */
export function LeadPopup() {
  const [location, setLocation] = useState<CtaLocation | null>(null);
  const [fields, setFields] = useState<Fields>({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [redirecting, setRedirecting] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);

  const close = useCallback(() => {
    if (redirecting) return; // não deixa fechar no meio do redirect
    setLocation(null);
    setErrors({});
  }, [redirecting]);

  // Abre via CustomEvent disparado pelos CTAs (LeadCaptureCta).
  useEffect(() => {
    const onOpen = (e: Event) => {
      setLocation((e as CustomEvent<{ location: CtaLocation }>).detail.location);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  // Aberto: trava o scroll do body, foca o primeiro campo e fecha com Esc.
  useEffect(() => {
    if (!location) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    nameRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [location, close]);

  if (!location) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(fields);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setRedirecting(true);

    // Lead para o CRM (quando configurado) — nunca bloqueia o checkout.
    if (LEAD_ENDPOINT) {
      const body = new URLSearchParams({
        fullname: fields.name.trim(),
        email: fields.email.trim(),
        phone: `+55 ${fields.phone}`,
        location,
      });
      fetch(LEAD_ENDPOINT, { method: "POST", body, mode: "no-cors", keepalive: true }).catch(() => {});
    }

    // Mesma mecânica do TrackedLink: segura o redirect até o GTM confirmar o
    // disparo (com fallback de timeout), para a conversão não se perder.
    track({ event: "lead_submit", location }, () => {
      window.location.href = CHECKOUT_URL;
    });
  };

  const setField = (key: keyof Fields) => (value: string) => {
    setFields((f) => ({ ...f, [key]: key === "phone" ? formatPhone(value) : value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="lead-popup-title">
      {/* Backdrop — funde com o fundo profundo da página */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(13,9,17,0.82)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        onClick={close}
        aria-hidden="true"
      />

      {/* Card — mesmo vocabulário dos cards de lote (rounded-[28px], borda sutil) */}
      <div
        className="relative w-full max-w-[440px] rounded-[28px] p-8 sm:p-9"
        style={{
          background: "#0f0b1c",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 90px rgba(0,0,0,0.65)",
          animation: "fade-in-mount 0.45s cubic-bezier(0.22,1,0.36,1) both",
          ["--from-y" as string]: "18px",
          ["--from-scale" as string]: "0.97",
        }}
      >
        {/* Glow roxo difuso no topo do card — eco do beam das seções */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[28px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 45% at 50% 0%, rgba(124,58,237,0.14) 0%, transparent 70%)" }}
        />

        {/* Fechar */}
        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150 hover:bg-[rgba(255,255,255,0.08)] cursor-pointer"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="relative">
          {redirecting ? (
            <div className="py-8" aria-live="polite">
              <p className="text-[11px] font-medium tracking-[0.18em] uppercase mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
                Vaga reservada
              </p>
              <p
                className="text-[24px] font-extrabold text-white mb-2"
                style={{ letterSpacing: "-0.02em", lineHeight: 1.15 }}
              >
                Tudo certo.
              </p>
              <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                Você será redirecionado para finalizar sua inscrição no Sympla...
              </p>
            </div>
          ) : (
            <>
              {/* Eyebrow + headline — mesma hierarquia das seções */}
              <div className="mb-7 pr-8">
                <p className="text-[11px] font-medium tracking-[0.18em] uppercase mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Imersão Claude · BH, 01 de Agosto
                </p>
                <h2
                  id="lead-popup-title"
                  className="text-[clamp(24px,3vw,30px)] font-extrabold text-white"
                  style={{ letterSpacing: "-0.025em", lineHeight: 1.1 }}
                >
                  Garanta sua vaga.
                </h2>
                <p className="mt-2.5 text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Preencha seus dados e siga direto para o checkout.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <Field label="Nome" error={errors.name}>
                  <input
                    ref={nameRef}
                    name="fullname"
                    autoComplete="name"
                    placeholder="Seu nome completo"
                    value={fields.name}
                    onChange={(e) => setField("name")(e.target.value)}
                    className={inputClass(!!errors.name)}
                    required
                  />
                </Field>

                <Field label="Email" error={errors.email}>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@dominio.com"
                    value={fields.email}
                    onChange={(e) => setField("email")(e.target.value)}
                    className={inputClass(!!errors.email)}
                    required
                  />
                </Field>

                <Field label="WhatsApp" error={errors.phone}>
                  <div className="flex gap-2">
                    <span
                      className="inline-flex items-center px-3 rounded-lg text-[14px] select-none shrink-0"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)" }}
                    >
                      +55
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="(31) 99999-9999"
                      maxLength={15}
                      value={fields.phone}
                      onChange={(e) => setField("phone")(e.target.value)}
                      className={`${inputClass(!!errors.phone)} flex-1`}
                      required
                    />
                  </div>
                </Field>

                {/* CTA — idêntico ao botão do card de investimento */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-bold text-[14px] text-[#f3edf8] transition-colors duration-150 hover:bg-gold-vivid cursor-pointer mt-2"
                  style={{
                    background: "rgb(245, 158, 11)",
                    animation: "pulse-gold 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
                  }}
                >
                  Garantir minha vaga
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>

              {/* Rodapé — micro-informação no tom muted da página */}
              <p className="mt-5 text-center text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                Lote 01 · {LOTE_ONE_PRICE} · checkout seguro via{" "}
                <span className="font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Sympla</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium tracking-[0.14em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
        {label}
      </span>
      {children}
      {error && (
        <span className="text-[12px]" style={{ color: "#f87171" }} role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

function inputClass(hasError: boolean): string {
  return [
    "w-full px-3.5 py-3 rounded-lg text-[14px] text-white placeholder:text-[rgba(255,255,255,0.22)]",
    "bg-[rgba(255,255,255,0.04)] outline-none transition-colors duration-150",
    hasError
      ? "border border-[rgba(248,113,113,0.6)]"
      : "border border-[rgba(255,255,255,0.07)] focus:border-[rgba(168,85,247,0.55)]",
  ].join(" ");
}
