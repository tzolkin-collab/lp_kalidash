"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { CHECKOUT_URL, LEAD_ENDPOINT, LOTE_ONE_PRICE } from "@/app/utilities/constants";
import { track, type CtaLocation } from "@/app/utilities/track";
import { captureUtms } from "@/app/utilities/utms";
import { generateSessionId, generateLeadFingerprint } from "@/app/utilities/fingerprint";

const OPEN_EVENT = "kalidash:lead-popup";

export function openLeadPopup(location: CtaLocation) {
  window.dispatchEvent(new CustomEvent<{ location: CtaLocation }>(OPEN_EVENT, { detail: { location } }));
}

type Fields = { name: string; email: string; phone: string };
type FieldErrors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

export function LeadPopup() {
  const [location, setLocation] = useState<CtaLocation | null>(null);
  const [fields, setFields] = useState<Fields>({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [redirecting, setRedirecting] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);
  
  // Track timers/locks de alteração parcial
  const sessionIdRef = useRef<string>("");
  const partialTimerRef = useRef<NodeJS.Timeout | null>(null);

  const close = useCallback(() => {
    if (redirecting) return;
    setLocation(null);
    setErrors({});
  }, [redirecting]);

  useEffect(() => {
    const onOpen = (e: Event) => {
      setLocation((e as CustomEvent<{ location: CtaLocation }>).detail.location);
      sessionIdRef.current = generateSessionId();
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

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

  // Função para salvar lead parcial via API
  const savePartialLead = useCallback(async (currentFields: Fields) => {
    if (!location || !sessionIdRef.current) return;

    // Apenas envia se tiver pelo menos algum campo parcialmente preenchido
    const hasSomeData =
      currentFields.name.trim().length > 0 ||
      currentFields.email.trim().length > 0 ||
      currentFields.phone.trim().length > 0;

    if (!hasSomeData) return;

    try {
      const utms = captureUtms();
      await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fingerprint: sessionIdRef.current,
          name: currentFields.name.trim() || undefined,
          email: currentFields.email.trim() || undefined,
          phone: currentFields.phone.trim() ? `+55 ${currentFields.phone}` : undefined,
          location,
          status: "partial",
          ...utms,
        }),
        keepalive: true,
      });
    } catch (e) {
      console.error("Falha ao salvar parcial", e);
    }
  }, [location]);

  // Agenda salvamento parcial com debounce (800ms)
  const schedulePartialSave = (currentFields: Fields) => {
    if (partialTimerRef.current) clearTimeout(partialTimerRef.current);
    partialTimerRef.current = setTimeout(() => {
      savePartialLead(currentFields);
    }, 800);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!location) return;
    if (partialTimerRef.current) clearTimeout(partialTimerRef.current);

    const nextErrors = validate(fields);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setRedirecting(true);

    const utms = captureUtms();
    const finalPhone = `+55 ${fields.phone}`;
    
    // Gera o fingerprint completo determinístico
    const finalFingerprint = await generateLeadFingerprint(fields.email, fields.phone);

    // 1. Envia os dados completos ao banco consolidando com o parcial existente
    try {
      await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fingerprint: finalFingerprint,
          sessionFingerprint: sessionIdRef.current || undefined,
          name: fields.name.trim(),
          email: fields.email.trim(),
          phone: finalPhone,
          location,
          status: "complete",
          ...utms,
        }),
      });
    } catch (err) {
      console.error("Erro ao salvar lead completo", err);
    }

    // 2. Trackeia lead_submit no GTM
    track({ event: "lead_submit", location }, async () => {
      // 3. Dispara go_to_sympla no GTM
      track({ event: "go_to_sympla", location });

      // 4. Atualiza o status do lead para "checkout" no banco de dados antes do redirecionamento
      const updateToCheckout = async () => {
        const payload = {
          location,
          status: "checkout",
          name: fields.name.trim(),
          email: fields.email.trim(),
          phone: finalPhone,
          ...utms,
        };
        await fetch(LEAD_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fingerprint: finalFingerprint,
            sessionFingerprint: sessionIdRef.current || undefined,
            ...payload
          }),
        }).catch(() => {});
      };

      await updateToCheckout();

      // Redireciona de fato
      window.location.href = CHECKOUT_URL;
    });
  };

  const setField = (key: keyof Fields) => (value: string) => {
    const updated = { ...fields, [key]: key === "phone" ? formatPhone(value) : value };
    setFields(updated);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    
    // Salva lead parcial ao digitar (debounced)
    schedulePartialSave(updated);
  };

  const handleBlur = () => {
    // Ao perder o foco, salva imediatamente sem esperar o timer do debounce
    if (partialTimerRef.current) clearTimeout(partialTimerRef.current);
    savePartialLead(fields);
  };

  if (!location) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="lead-popup-title">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(13,9,17,0.82)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        onClick={close}
        aria-hidden="true"
      />

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
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[28px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 45% at 50% 0%, rgba(124,58,237,0.14) 0%, transparent 70%)" }}
        />

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
                    onBlur={handleBlur}
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
                    onBlur={handleBlur}
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
                      onBlur={handleBlur}
                      className={`${inputClass(!!errors.phone)} flex-1`}
                      required
                    />
                  </div>
                </Field>

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
