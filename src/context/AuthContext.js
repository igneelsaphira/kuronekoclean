import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext();
const OPTIONAL_AUTH_WINDOW_MS = 5 * 60 * 1000;

function parseResultUrl(url) {
  try {
    const parsed = new URL(url);
    const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''));

    return {
      code: parsed.searchParams.get('code'),
      accessToken: hashParams.get('access_token'),
      refreshToken: hashParams.get('refresh_token'),
    };
  } catch (error) {
    return { code: null, accessToken: null, refreshToken: null };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [graceStartedAt] = useState(Date.now());

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setAuthError(error.message);
      }
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setAuthError(null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [session]);

  const graceEndsAt = graceStartedAt + OPTIONAL_AUTH_WINDOW_MS;
  const remainingGraceMs = Math.max(0, graceEndsAt - now);
  const isAuthenticated = Boolean(session?.user);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      const message = 'Faltan EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.';
      setAuthError(message);
      return { ok: false, reason: 'missing_config', message };
    }

    setAuthBusy(true);
    setAuthError(null);

    try {
      const redirectTo = AuthSession.makeRedirectUri({
        scheme: 'kuroclean',
        path: 'auth/callback',
      });

      if (Platform.OS === 'web') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        });

        if (error) throw error;
        return { ok: true };
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No pude iniciar el flujo de Google.');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type !== 'success' || !result.url) {
        return { ok: false, reason: 'cancelled' };
      }

      const { code, accessToken, refreshToken } = parseResultUrl(result.url);

      if (code) {
        const exchange = await supabase.auth.exchangeCodeForSession(code);
        if (exchange.error) throw exchange.error;
        return { ok: true };
      }

      if (accessToken && refreshToken) {
        const restored = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (restored.error) throw restored.error;
        return { ok: true };
      }

      throw new Error('No pude recuperar la sesion de Google.');
    } catch (error) {
      const message = error?.message || 'No pude iniciar sesion con Google.';
      setAuthError(message);
      return { ok: false, reason: 'unknown', message };
    } finally {
      setAuthBusy(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return { ok: false, reason: 'missing_config' };

    setAuthBusy(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { ok: true };
    } catch (error) {
      const message = error?.message || 'No pude cerrar la sesion.';
      setAuthError(message);
      return { ok: false, reason: 'unknown', message };
    } finally {
      setAuthBusy(false);
    }
  };

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    loading,
    authBusy,
    authError,
    isAuthenticated,
    remainingGraceMs,
    graceEndsAt,
    configured: isSupabaseConfigured,
    signInWithGoogle,
    signOut,
  }), [authBusy, authError, graceEndsAt, isAuthenticated, loading, remainingGraceMs, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
