"use client";

import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getFirebaseAuth, getFirebaseDb } from "../lib/firebase";
import type { Profile } from "../lib/access";

type State = { user: User; profile: Profile } | "loading" | "denied";

export function AccessGate({ children }: { children: (props: { user: User; profile: Profile; logout: () => Promise<void> }) => React.ReactNode }) {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    const auth = getFirebaseAuth();
    let stopProfile: () => void = () => undefined;
    const stopAuth = onAuthStateChanged(auth, (user) => {
      stopProfile();
      if (!user) { setState("denied"); return; }
      const db = getFirebaseDb();
      const returnToLogin = () => {
        void signOut(auth).finally(() => window.location.replace("/login?reason=access"));
      };
      stopProfile = onSnapshot(
        doc(db, "users", user.uid),
        (snapshot) => {
          const profile = snapshot.data() as Profile | undefined;
          if (profile) setState({ user, profile });
          else returnToLogin();
        },
        (error) => {
          console.error("Could not load the user profile from Firestore.", error);
          returnToLogin();
        },
      );
    });
    return () => { stopAuth(); stopProfile(); };
  }, []);

  if (state === "loading") return <main className="accessLoading">Загружаем доступ…</main>;
  if (state === "denied") {
    return <main className="accessLoading"><div><a href="/login">Ко входу</a></div></main>;
  }
  return <>{children({ ...state, logout: () => signOut(getFirebaseAuth()) })}</>;
}
