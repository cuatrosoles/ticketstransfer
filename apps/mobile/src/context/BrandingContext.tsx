/**
 * Marca y tema remoto (Firestore → GET /api/settings/branding).
 */

import * as React from 'react';
import { primaryToGradientTriplet, primaryLightHex } from '../lib/brandColors';
import { getBranding, type BrandingPayload } from '../lib/api';

export type BrandingContextValue = {
  loading: boolean;
  error: string | null;
  data: BrandingPayload | null;
  reload: () => Promise<void>;
  appName: string;
  tagline: string | null;
  logoUrl: string | null;
  primaryHex: string;
  accentHex: string;
  primaryGradient: [string, string, string];
  primaryLight: string;
  supportEmail: string | null;
  helpCenterUrl: string | null;
  registrationDisclaimer: string | null;
};

const defaultGradient: [string, string, string] = ['#2563eb', '#3b82f6', '#60a5fa'];

const Ctx = React.createContext<BrandingContextValue>({
  loading: true,
  error: null,
  data: null,
  reload: async () => {},
  appName: 'Tickets Transfer',
  tagline: null,
  logoUrl: null,
  primaryHex: '#3b82f6',
  accentHex: '#22c55e',
  primaryGradient: defaultGradient,
  primaryLight: '#60a5fa',
  supportEmail: null,
  helpCenterUrl: null,
  registrationDisclaimer: null,
});

function pickStr(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<BrandingPayload | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const b = await getBranding();
      setData(b);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de marca');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  const visual = (data?.visual && typeof data.visual === 'object' ? data.visual : {}) as Record<string, unknown>;
  const primaryHex = pickStr(visual.primaryColor) || '#3b82f6';
  const accentHex = pickStr(visual.accentColor) || '#22c55e';
  const appName = pickStr(visual.appName) || 'Tickets Transfer';
  const tagline = pickStr(visual.tagline);
  const logoUrl = pickStr(visual.logoUrl);

  const value = React.useMemo<BrandingContextValue>(
    () => ({
      loading,
      error,
      data,
      reload: load,
      appName,
      tagline,
      logoUrl,
      primaryHex,
      accentHex,
      primaryGradient: primaryToGradientTriplet(primaryHex),
      primaryLight: primaryLightHex(primaryHex),
      supportEmail: pickStr(data?.users?.supportEmail),
      helpCenterUrl: pickStr(data?.users?.helpCenterUrl),
      registrationDisclaimer: pickStr(data?.users?.registrationDisclaimer),
    }),
    [loading, error, data, load, appName, tagline, logoUrl, primaryHex, accentHex]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBranding() {
  return React.useContext(Ctx);
}
