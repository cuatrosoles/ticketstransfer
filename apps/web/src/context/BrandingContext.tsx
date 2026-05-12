/**
 * Marca remota (GET /api/settings/branding) → variables CSS para toda la web.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchBranding, type BrandingPayload } from '../lib/brandingApi';

type Ctx = {
  loading: boolean;
  error: string | null;
  data: BrandingPayload | null;
  reload: () => Promise<void>;
  appName: string;
  tagline: string | null;
  logoUrl: string | null;
  supportEmail: string | null;
  helpCenterUrl: string | null;
  registrationDisclaimer: string | null;
};

const BrandingContext = createContext<Ctx>({
  loading: true,
  error: null,
  data: null,
  reload: async () => {},
  appName: 'Tickets Transfer',
  tagline: null,
  logoUrl: null,
  supportEmail: null,
  helpCenterUrl: null,
  registrationDisclaimer: null,
});

function applyCssVars(payload: BrandingPayload | null) {
  const root = document.documentElement;
  const keys = ['--primary', '--primary-light', '--accent', '--font', '--font-heading'] as const;
  if (!payload) {
    keys.forEach((k) => root.style.removeProperty(k));
    return;
  }
  const visual = (payload.visual && typeof payload.visual === 'object' ? payload.visual : {}) as Record<string, unknown>;
  const pick = (k: string) => (typeof visual[k] === 'string' ? (visual[k] as string).trim() : '');

  const primary = pick('primaryColor') || '#3b82f6';
  const primaryLight = pick('secondaryColor') || '#60a5fa';
  const accent = pick('accentColor') || '#22c55e';
  const fontBase = pick('fontFamilyBody') || "'Cooper', 'Cooper Std', 'CooperBT', 'Bookman Old Style', serif";
  const fontHeading =
    pick('fontFamilyHeading') || "'Cooper Black', 'CooperBlack', 'Cooper Std Black', 'Cooper', serif";

  root.style.setProperty('--primary', primary);
  root.style.setProperty('--primary-light', primaryLight);
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--font', fontBase);
  root.style.setProperty('--font-heading', fontHeading);
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BrandingPayload | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const b = await fetchBranding();
      setData(b);
      applyCssVars(b);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
      setData(null);
      applyCssVars(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [load]);

  const visual = (data?.visual && typeof data.visual === 'object' ? data.visual : {}) as Record<string, unknown>;
  const value = useMemo<Ctx>(
    () => ({
      loading,
      error,
      data,
      reload: load,
      appName: (typeof visual.appName === 'string' && visual.appName.trim()) || 'Tickets Transfer',
      tagline: typeof visual.tagline === 'string' && visual.tagline.trim() ? visual.tagline.trim() : null,
      logoUrl: typeof visual.logoUrl === 'string' && visual.logoUrl.trim() ? visual.logoUrl.trim() : null,
      supportEmail:
        typeof data?.users?.supportEmail === 'string' && data.users.supportEmail.trim()
          ? data.users.supportEmail.trim()
          : null,
      helpCenterUrl:
        typeof data?.users?.helpCenterUrl === 'string' && data.users.helpCenterUrl.trim()
          ? data.users.helpCenterUrl.trim()
          : null,
      registrationDisclaimer:
        typeof data?.users?.registrationDisclaimer === 'string' && data.users.registrationDisclaimer.trim()
          ? data.users.registrationDisclaimer.trim()
          : null,
    }),
    [loading, error, data, load, visual]
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
