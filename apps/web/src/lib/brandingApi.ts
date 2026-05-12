const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export type BrandingPayload = {
  commissionPercentage: number;
  marketplaceHomePublicListingsLimit: number;
  visual: Record<string, unknown>;
  users: {
    supportEmail?: string;
    helpCenterUrl?: string;
    registrationDisclaimer?: string;
  };
  notifications: Record<string, unknown>;
};

export async function fetchBranding(): Promise<BrandingPayload> {
  const res = await fetch(`${API_BASE}/api/settings/branding`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Error al cargar marca');
  return data as BrandingPayload;
}
