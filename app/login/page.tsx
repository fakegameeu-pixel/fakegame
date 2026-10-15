"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getFirebaseAuth } from "../lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setLoading(true);
    const data = new FormData(event.currentTarget);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), String(data.get("email")), String(data.get("password")));
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
    <label>E-pasts<input name="email" type="email" autoComplete="email" required /></label>
    <label>Parole<span className="passwordField"><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Slēpt paroli" : "Rādīt paroli"} title={showPassword ? "Slēpt paroli" : "Rādīt paroli"}>{showPassword ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.1A10.8 10.8 0 0 1 12 4.9c5.4 0 9.1 5.1 9.1 7.1a10 10 0 0 1-3 3.8M6.2 6.2C3.9 8 2.9 10.5 2.9 12c0 2 3.7 7.1 9.1 7.1 1.5 0 2.8-.4 4-1" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.9 12s3.7-7.1 9.1-7.1 9.1 5.1 9.1 7.1-3.7 7.1-9.1 7.1S2.9 14 2.9 12Z" /><circle cx="12" cy="12" r="2.8" /></svg>}</button></span></label>
    {error && <p className="portalError">{error}</p>}
    <button className="portalButton" disabled={loading}>{loading ? "Notiek pieslēgšanās…" : "Ienākt"}</button>
  </form></main>;
}
