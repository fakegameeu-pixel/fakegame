"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getFirebaseAuth } from "../lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accessNotice, setAccessNotice] = useState(false);

  useEffect(() => {
    setAccessNotice(new URLSearchParams(window.location.search).get("reason") === "access");
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setAccessNotice(false);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email) return setError("Ievadiet e-pasta adresi.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Ievadiet derīgu e-pasta adresi.");
    if (!password) return setError("Ievadiet paroli.");
    if (password.length < 6) return setError("Parolei jābūt vismaz 6 rakstzīmes garai.");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      router.replace("/workspace");
    } catch (caught) {
      const code = typeof caught === "object" && caught !== null && "code" in caught && typeof caught.code === "string"
        ? caught.code
        : "unknown";
      const messages: Record<string, string> = {
        "auth/invalid-credential": "Nepareizs e-pasts vai parole.",
        "auth/invalid-api-key": "Firebase Web API atslēga nav derīga. Pārstartējiet serveri un pārbaudiet .env.",
        "auth/operation-not-allowed": "Firebase nav ieslēgta E-pasta/paroles autentifikācija.",
        "auth/network-request-failed": "Neizdevās savienoties ar Firebase. Pārbaudiet internetu.",
        "auth/too-many-requests": "Pārāk daudz mēģinājumu. Uzgaidiet dažas minūtes un mēģiniet vēlreiz.",
      };
      const detail = caught instanceof Error && code === "unknown" ? ` ${caught.message}` : "";
      setError(`${messages[code] ?? "Neizdevās pierakstīties."} (${code})${detail}`);
    } finally { setLoading(false); }
  }
  return <main className="authPage"><form className="authCard" onSubmit={login}>
    <p className="portalLabel">Fake Wedding</p><h1>Darba pieslēgšanās</h1><p>Administratoram un viesu reģistrācijas komandai.</p>
    <label>E-pasts<input name="email" type="email" autoComplete="email" inputMode="email" required aria-invalid={Boolean(error)} /></label>
    <label>Parole<span className="passwordField"><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" minLength={6} required aria-invalid={Boolean(error)} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Slēpt paroli" : "Rādīt paroli"} title={showPassword ? "Slēpt paroli" : "Rādīt paroli"}>{showPassword ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.1A10.8 10.8 0 0 1 12 4.9c5.4 0 9.1 5.1 9.1 7.1a10 10 0 0 1-3 3.8M6.2 6.2C3.9 8 2.9 10.5 2.9 12c0 2 3.7 7.1 9.1 7.1 1.5 0 2.8-.4 4-1" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.9 12s3.7-7.1 9.1-7.1 9.1 5.1 9.1 7.1-3.7 7.1-9.1 7.1S2.9 14 2.9 12Z" /><circle cx="12" cy="12" r="2.8" /></svg>}</button></span></label>
    {(error || accessNotice) && <p className="portalError">{error || "Доступ к рабочей панели не подтверждён. Войдите под учётной записью администратора."}</p>}
    <button className="portalButton" disabled={loading}>{loading ? "Notiek pieslēgšanās…" : "Ienākt"}</button>
  </form></main>;
}
