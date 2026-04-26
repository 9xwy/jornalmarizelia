import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";
import {
  hasTemporaryAdminSession,
  setTemporaryAdminSession,
  tempAdminEnabled,
  tempAdminPassword,
  tempAdminUsername,
} from "@/lib/temp-admin";

export function useAdminAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [temporaryAccess, setTemporaryAccess] = useState<boolean>(hasTemporaryAdminSession());
  const [loading, setLoading] = useState<boolean>(hasSupabaseEnv);

  useEffect(() => {
    setTemporaryAccess(hasTemporaryAdminSession());

    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }

      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signInWithPassword(email: string, password: string) {
    const identifier = email.trim();

    if (tempAdminEnabled && identifier === tempAdminUsername && password === tempAdminPassword) {
      setTemporaryAdminSession(true);
      setTemporaryAccess(true);
      setSession(null);
      setLoading(false);
      return;
    }

    if (!supabase) {
      throw new Error("Supabase nao configurado.");
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  }

  async function sendMagicLink(email: string) {
    if (!supabase) {
      throw new Error("Supabase nao configurado.");
    }

    const redirectTo = `${window.location.origin}/admin`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      throw error;
    }
  }

  async function signOut() {
    setTemporaryAdminSession(false);
    setTemporaryAccess(false);

    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }

  const authMode = session?.user ? "supabase" : temporaryAccess ? "temporary" : "none";

  return {
    session,
    user: session?.user ?? null,
    userEmail: session?.user?.email ?? (temporaryAccess ? tempAdminUsername : null),
    loading,
    authMode,
    isAuthenticated: Boolean(session?.user || temporaryAccess),
    isTemporaryAccess: temporaryAccess,
    temporaryLoginEnabled: tempAdminEnabled,
    temporaryUsername: tempAdminEnabled ? tempAdminUsername : null,
    temporaryPassword: tempAdminEnabled ? tempAdminPassword : null,
    signInWithPassword,
    sendMagicLink,
    signOut,
  };
}
