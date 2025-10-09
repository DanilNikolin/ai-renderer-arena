// src/lib/id.ts
export function genId(): string {
    // Narrow global crypto w/ optional randomUUID
    const c = (globalThis as { crypto?: Crypto & { randomUUID?: () => string } }).crypto;
  
    // 1) Preferred: Web Crypto randomUUID (modern browsers, some runtimes)
    if (c?.randomUUID) return c.randomUUID();
  
    // 2) Fallback: v4 UUID from getRandomValues (if available)
    if (c?.getRandomValues) {
      const b = new Uint8Array(16);
      c.getRandomValues(b);
      b[6] = (b[6] & 0x0f) | 0x40; // version 4
      b[8] = (b[8] & 0x3f) | 0x80; // variant
      const h = Array.from(b, (x) => x.toString(16).padStart(2, "0"));
      return `${h.slice(0, 4).join("")}-${h.slice(4, 6).join("")}-${h.slice(6, 8).join("")}-${h.slice(8, 10).join("")}-${h.slice(10).join("")}`;
    }
  
    // 3) Last resort (very rare envs): time + Math.random
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
  