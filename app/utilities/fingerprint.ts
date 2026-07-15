/**
 * Utilitários para controle de fingerprint e sessões de leads
 */

// Gera um UUID simples v4 para identificar a sessão de lead parcial
export function generateSessionId(): string {
  if (typeof window === "undefined") return "session-server";
  let sid = sessionStorage.getItem("kalidash_session_id");
  if (!sid) {
    sid = "sid_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem("kalidash_session_id", sid);
  }
  return sid;
}

// Gera um hash sha256 simples no client-side para normalizar o fingerprint de leads completos
export async function generateLeadFingerprint(email: string, phone: string): Promise<string> {
  const normalized = `${email.trim().toLowerCase()}:${phone.trim().replace(/\D/g, "")}`;
  
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(normalized);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      return `hash_${hashHex}`;
    } catch {
      // Fallback simples se falhar
      return `hash_${btoa(normalized).replace(/=/g, "")}`;
    }
  }
  
  return `hash_${btoa(normalized).replace(/=/g, "")}`;
}
