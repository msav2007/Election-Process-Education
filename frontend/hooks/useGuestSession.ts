"use client";

import { useEffect, useState } from "react";
import { fetchGuestSession } from "@/lib/api";
import { AUTH_STORAGE_KEY } from "@/lib/constants";
import type { AuthSession, Profile } from "@/lib/types";


function isSessionValid(session: AuthSession | null) {
  if (!session) return false;
  const expiresAt = Date.parse(session.expires_at);
  if (Number.isNaN(expiresAt)) return false;
  return expiresAt - Date.now() > 60_000;
}

export function useGuestSession(profile: Profile | null) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as AuthSession;
      if (isSessionValid(parsed)) {
        setSession(parsed);
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready || !profile || isSessionValid(session)) return;

    let cancelled = false;
    fetchGuestSession(profile)
      .then((nextSession) => {
        if (cancelled) return;
        setSession(nextSession);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
      })
      .catch(() => {
        if (!cancelled) setSession(null);
      });

    return () => {
      cancelled = true;
    };
  }, [profile, ready, session]);

  function clearSession() {
    setSession(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  return {
    session,
    authToken: session?.access_token ?? null,
    ready,
    clearSession,
    setSession
  };
}
