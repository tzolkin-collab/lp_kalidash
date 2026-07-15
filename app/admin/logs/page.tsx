"use client";

import { Fragment, useCallback, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

interface Lead {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string;
  status: "partial" | "complete" | "checkout";
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  contacted: boolean;
  contactedAt: string | null;
  createdAt: string;
}

interface LeadsResponse {
  leads: Lead[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  distinctSources: string[];
}

interface StatsResponse {
  total: number;
  partial: number;
  complete: number;
  checkout: number;
  topSources: { source: string; count: number }[];
}

// ---------------------------------------------------------------------------
// Admin Logs Page (Expanded Dashboard)
// ---------------------------------------------------------------------------

export default function AdminLogsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // -------- Leads list state --------
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // -------- Stats state --------
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // -------- Filters & UI --------
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [contactedFilter, setContactedFilter] = useState<"all" | "pending" | "done">("all");
  const [expandedLeads, setExpandedLeads] = useState<Set<number>>(new Set());

  // -------- Selection --------
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // -------- Notifications --------
  const [notifying, setNotifying] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "ok" | "error" } | null>(null);

  // ---------- Login ----------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setLoginError("Senha incorreta.");
        return;
      }
      const { token: t } = await res.json();
      setToken(t);
    } catch {
      setLoginError("Erro de conexão.");
    }
  };

  // ---------- Fetch Stats (Funnel & Sources) ----------
  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/leads/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json: StatsResponse = await res.json();
        setStats(json);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingStats(false);
    }
  }, [token]);

  // ---------- Fetch Leads ----------
  const fetchLeads = useCallback(
    async (p: number) => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/leads?page=${p}&perPage=25&status=${statusFilter}&source=${sourceFilter}&contacted=${contactedFilter}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const json: LeadsResponse = await res.json();
          setData(json);
          setPage(p);
          setSelected(new Set());
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    },
    [token, statusFilter, sourceFilter, contactedFilter],
  );

  useEffect(() => {
    if (token) {
      fetchLeads(1);
      fetchStats();
    }
  }, [token, fetchLeads, fetchStats]);

  // ---------- CSV Export ----------
  const handleExportCsv = async () => {
    if (!token) return;
    const res = await fetch(
      `/api/admin/leads?format=csv&status=${statusFilter}&source=${sourceFilter}&contacted=${contactedFilter}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_kalidash_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- WhatsApp notify ----------
  const handleNotify = async () => {
    if (!token || selected.size === 0) return;
    setNotifying(true);
    try {
      const res = await fetch("/api/admin/leads/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leadIds: [...selected] }),
      });
      if (res.ok) {
        showToast(`${selected.size} lead(s) enviados via WhatsApp!`, "ok");
      } else {
        const body = await res.json().catch(() => ({}));
        showToast(body.error ?? "Falha ao enviar.", "error");
      }
    } catch {
      showToast("Erro de conexão.", "error");
    } finally {
      setNotifying(false);
    }
  };

  const showToast = (message: string, type: "ok" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ---------- Toggle "Contato feito?" (persistente, update otimista) ----------
  const patchContacted = (id: number, contacted: boolean, contactedAt: string | null) =>
    setData((prev) =>
      prev
        ? { ...prev, leads: prev.leads.map((l) => (l.id === id ? { ...l, contacted, contactedAt } : l)) }
        : prev,
    );

  const handleToggleContacted = async (id: number, contacted: boolean) => {
    if (!token) return;
    // Otimista
    patchContacted(id, contacted, contacted ? new Date().toISOString() : null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, contacted }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Reverte
      patchContacted(id, !contacted, !contacted ? new Date().toISOString() : null);
      showToast("Falha ao salvar contato.", "error");
    }
  };

  // ---------- Selection & Expand Helpers ----------
  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () => {
    if (!data) return;
    if (selected.size === data.leads.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.leads.map((l) => l.id)));
    }
  };

  const toggleExpand = (id: number) =>
    setExpandedLeads((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // Cálculo de conversões do funil
  const getFunnelConversion = (step: "complete" | "checkout") => {
    if (!stats || stats.total === 0) return "0%";
    if (step === "complete") {
      const totalCompletos = stats.complete + stats.checkout;
      const rate = (totalCompletos / stats.total) * 100;
      return `${rate.toFixed(0)}%`;
    }
    if (step === "checkout") {
      const rate = (stats.checkout / stats.total) * 100;
      return `${rate.toFixed(0)}%`;
    }
    return "0%";
  };

  // Badge de status do Lead
  const renderStatusBadge = (status: "partial" | "complete" | "checkout") => {
    switch (status) {
      case "partial":
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
            🟡 Parcial
          </span>
        );
      case "complete":
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            🟢 Completo
          </span>
        );
      case "checkout":
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-sky-500/10 text-sky-500 border border-sky-500/20">
            🔵 Checkout (Sympla)
          </span>
        );
    }
  };

  // ----- Login Screen -----
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl p-8 relative"
          style={{
            background: "#0f0b1c",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)",
            }}
          />

          <p
            className="text-[11px] font-medium tracking-[0.18em] uppercase mb-3"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Kalidash · Admin
          </p>
          <h1
            className="text-2xl font-extrabold text-white mb-6"
            style={{ letterSpacing: "-0.02em" }}
          >
            Acesso ao painel
          </h1>

          <label className="flex flex-col gap-1.5 mb-5">
            <span
              className="text-[11px] font-medium tracking-[0.14em] uppercase"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Senha
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-3 rounded-lg text-sm text-white placeholder:text-[rgba(255,255,255,0.22)] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] focus:border-[rgba(168,85,247,0.55)] outline-none transition-colors duration-150"
              placeholder="••••••••"
              autoFocus
            />
          </label>

          {loginError && (
            <p className="text-sm mb-4" style={{ color: "#f87171" }}>
              {loginError}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-bold text-sm text-[#f3edf8] transition-colors duration-150 cursor-pointer"
            style={{ background: "rgb(124,58,237)" }}
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  // ----- Dashboard -----
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      
      {/* HEADER E CONTROLES */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p
            className="text-[11px] font-medium tracking-[0.18em] uppercase mb-1"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Kalidash · Admin OMS
          </p>
          <h1
            className="text-3xl font-extrabold text-white"
            style={{ letterSpacing: "-0.025em" }}
          >
            Leads & Performance
          </h1>
          {data && (
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Abaixo os contatos e métricas do funil capturados em tempo real
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer flex items-center gap-2"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar CSV
          </button>

          <button
            onClick={handleNotify}
            disabled={selected.size === 0 || notifying}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: selected.size > 0 ? "#25D366" : "rgba(37,211,102,0.3)",
              color: "#fff",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.29-1.244l-.307-.184-2.87.852.852-2.87-.184-.307A8 8 0 1112 20z" />
            </svg>
            {notifying
              ? "Enviando..."
              : selected.size > 0
                ? `Enviar ${selected.size} via WhatsApp`
                : "Selecione leads"}
          </button>
        </div>
      </div>

      {/* FUNIL VISUAL DE METRICAS */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl border" style={{ background: "#0f0b1c", borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Total Cliques CTA</p>
            <p className="text-3xl font-extrabold text-white">{stats.total}</p>
            <p className="text-xs text-white/30 mt-1">Interação inicial na LP</p>
          </div>
          
          <div className="p-5 rounded-2xl border" style={{ background: "#0f0b1c", borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-xs uppercase tracking-wider text-amber-500 mb-1">Leads Parciais</p>
            <p className="text-3xl font-extrabold text-white">{stats.partial}</p>
            <p className="text-xs text-amber-500/60 mt-1">Digitaram mas não enviaram</p>
          </div>

          <div className="p-5 rounded-2xl border animate-pulse-light" style={{ background: "#0f0b1c", borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-xs uppercase tracking-wider text-emerald-500 mb-1">Formulários Completos</p>
            <p className="text-3xl font-extrabold text-white">{stats.complete + stats.checkout}</p>
            <p className="text-xs text-emerald-500/60 mt-1">Taxa de envio: <span className="font-bold text-white">{getFunnelConversion("complete")}</span></p>
          </div>

          <div className="p-5 rounded-2xl border" style={{ background: "#0f0b1c", borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-xs uppercase tracking-wider text-sky-500 mb-1">Checkout Iniciado</p>
            <p className="text-3xl font-extrabold text-white">{stats.checkout}</p>
            <p className="text-xs text-sky-500/60 mt-1">Taxa de Checkout: <span className="font-bold text-white">{getFunnelConversion("checkout")}</span></p>
          </div>
        </div>
      )}

      {/* FILTROS E PESQUISA */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        {/* Filtro Status (Tabs) */}
        <div className="flex rounded-lg overflow-hidden border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
          {["all", "partial", "complete", "checkout"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
              style={{
                background: statusFilter === st ? "rgba(124,58,237,0.2)" : "transparent",
                color: statusFilter === st ? "#fff" : "rgba(255,255,255,0.5)",
                borderRight: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {st === "all" ? "Todos" : st === "partial" ? "Parciais" : st === "complete" ? "Completos" : "Checkout"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* Filtro Contato feito (Todos / Pendentes / Contatados) */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 uppercase tracking-wider">Contato:</span>
            <div className="flex rounded-lg overflow-hidden border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
              {([
                { key: "all", label: "Todos" },
                { key: "pending", label: "Pendentes" },
                { key: "done", label: "Contatados" },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setContactedFilter(opt.key)}
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
                  style={{
                    background: contactedFilter === opt.key ? "rgba(124,58,237,0.2)" : "transparent",
                    color: contactedFilter === opt.key ? "#fff" : "rgba(255,255,255,0.5)",
                    borderRight: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro UTM Source */}
          {data && data.distinctSources && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 uppercase tracking-wider">Origem:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-[#0f0b1c] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-500 transition-colors"
              >
                <option value="all">Todas as origens</option>
                {data.distinctSources.map((src) => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all"
          style={{
            background: toast.type === "ok" ? "#25D366" : "#ef4444",
            color: "#fff",
            animation: "fade-in-mount 0.3s ease both",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* TABELA DE LEADS */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#0f0b1c",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {loading && !data ? (
          <div className="py-20 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
            Carregando contatos...
          </div>
        ) : data && data.leads.length === 0 ? (
          <div className="py-20 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
            Nenhum lead encontrado com estes filtros.
          </div>
        ) : data ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }} className="bg-white/5">
                  <th className="px-4 py-3.5 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === data.leads.length && data.leads.length > 0}
                      onChange={toggleAll}
                      className="accent-purple-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-[11px] tracking-[0.12em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Nome
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-[11px] tracking-[0.12em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Email
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-[11px] tracking-[0.12em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
                    WhatsApp
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-[11px] tracking-[0.12em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Origem / UTM
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-[11px] tracking-[0.12em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-[11px] tracking-[0.12em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Data
                  </th>
                  <th className="px-4 py-3.5 text-center font-semibold text-[11px] tracking-[0.12em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Contato feito?
                  </th>
                  <th className="px-4 py-3.5 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {data.leads.map((lead) => {
                  const isExpanded = expandedLeads.has(lead.id);
                  return (
                    <Fragment key={lead.id}>
                      <tr
                        className="transition-colors duration-100 hover:bg-white/5 cursor-pointer"
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          background: selected.has(lead.id)
                            ? "rgba(124,58,237,0.08)"
                            : "transparent",
                        }}
                        onClick={() => toggleSelect(lead.id)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(lead.id)}
                            onChange={() => toggleSelect(lead.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="accent-purple-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-white max-w-[150px] truncate">
                          {lead.name || <span className="text-white/20 italic">Sem nome</span>}
                        </td>
                        <td className="px-4 py-3 max-w-[200px] truncate" style={{ color: "rgba(255,255,255,0.6)" }}>
                          {lead.email || <span className="text-white/20 italic">Sem email</span>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: "rgba(255,255,255,0.6)" }}>
                          {lead.phone || <span className="text-white/20 italic">Sem telefone</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide bg-white/5"
                            style={{ color: "rgba(255,255,255,0.6)" }}
                          >
                            {lead.utmSource || "Direto / Orgânico"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {renderStatusBadge(lead.status)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {new Date(lead.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <label className="inline-flex flex-col items-center gap-0.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={lead.contacted}
                              onChange={(e) => handleToggleContacted(lead.id, e.target.checked)}
                              className="accent-emerald-500 cursor-pointer w-4 h-4"
                            />
                            {lead.contacted && lead.contactedAt && (
                              <span className="text-[10px] text-emerald-500/70 whitespace-nowrap">
                                {new Date(lead.contactedAt).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                })}
                              </span>
                            )}
                          </label>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(lead.id);
                            }}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-white/50"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                        </td>
                      </tr>

                      {/* Informações estendidas do UTM e extras */}
                      {isExpanded && (
                        <tr className="bg-white/[0.02]" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td colSpan={9} className="px-8 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                              <div>
                                <span className="block text-white/30 font-semibold mb-0.5 uppercase tracking-wider text-[10px]">utm_source</span>
                                <span className="text-white/80">{lead.utmSource || "-"}</span>
                              </div>
                              <div>
                                <span className="block text-white/30 font-semibold mb-0.5 uppercase tracking-wider text-[10px]">utm_medium</span>
                                <span className="text-white/80">{lead.utmMedium || "-"}</span>
                              </div>
                              <div>
                                <span className="block text-white/30 font-semibold mb-0.5 uppercase tracking-wider text-[10px]">utm_campaign</span>
                                <span className="text-white/80">{lead.utmCampaign || "-"}</span>
                              </div>
                              <div>
                                <span className="block text-white/30 font-semibold mb-0.5 uppercase tracking-wider text-[10px]">utm_term</span>
                                <span className="text-white/80">{lead.utmTerm || "-"}</span>
                              </div>
                              <div>
                                <span className="block text-white/30 font-semibold mb-0.5 uppercase tracking-wider text-[10px]">utm_content</span>
                                <span className="text-white/80">{lead.utmContent || "-"}</span>
                              </div>
                              <div className="col-span-2 md:col-span-5 pt-2 border-t border-white/5 flex gap-6 text-white/40">
                                <span>Origem do CTA: <strong className="text-white/70">{lead.location}</strong></span>
                                <span>Última atualização: <strong className="text-white/70">{new Date(lead.createdAt).toLocaleString("pt-BR")}</strong></span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {/* Paginação */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => fetchLeads(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            ← Anterior
          </button>
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            {page} / {data.totalPages}
          </span>
          <button
            onClick={() => fetchLeads(page + 1)}
            disabled={page >= data.totalPages}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Próxima →
          </button>
        </div>
      )}

      {/* Footer */}
      <p className="text-center mt-10 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
        Kalidash Admin OMS — dados integrados, acesso restrito.
      </p>
    </div>
  );
}
