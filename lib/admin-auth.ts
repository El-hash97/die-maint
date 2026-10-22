import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";
const TTL = 8 * 3600; // detik

// ADMIN_PIN_HASH = SHA-256 hex dari PIN; sekaligus kunci HMAC cookie sesi.
const secret = () => {
  const s = process.env.ADMIN_PIN_HASH?.trim().toLowerCase();
  if (!s) throw new Error("ADMIN_PIN_HASH belum diisi di .env.local (lihat .env.example).");
  if (!/^[0-9a-f]{64}$/.test(s)) throw new Error("ADMIN_PIN_HASH harus SHA-256 hex (64 karakter), bukan PIN mentah (lihat .env.example).");
  return s;
};
const sign = (exp: string) => createHmac("sha256", secret()).update(exp).digest("hex");
const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Cek PIN; kalau benar pasang cookie sesi. Melempar Error bila konfigurasi env salah. */
export async function loginAdmin(pin: string) {
  if (!same(createHash("sha256").update(pin).digest("hex"), secret())) {
    // ponytail: jeda tetap per percobaan; rate limit per-IP bila diakses publik luas
    await new Promise((r) => setTimeout(r, 1000));
    return false;
  }
  const exp = String(Math.floor(Date.now() / 1000) + TTL);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TTL,
    path: "/admin",
  });
  return true;
}

export async function isAdmin() {
  try {
    const [exp, sig] = ((await cookies()).get(COOKIE)?.value ?? "").split(".");
    return !!sig && Number(exp) > Date.now() / 1000 && same(sig, sign(exp));
  } catch {
    return false;
  }
}

export async function logoutAdmin() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}
