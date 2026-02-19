/**
 * Contexto de imagen de perfil – Para mostrar avatar en header y otros lugares.
 * Solo hace fetch cuando el usuario está logueado.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getProfile } from '../lib/api';

type ProfileImageContextType = {
  profileImageUrl: string | null;
  refreshProfileImage: () => Promise<void>;
};

const ProfileImageContext = createContext<ProfileImageContextType | null>(null);

export function ProfileImageProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const refreshProfileImage = useCallback(async () => {
    if (!user) {
      setProfileImageUrl(null);
      return;
    }
    try {
      const profile = await getProfile();
      setProfileImageUrl(profile.profileImageUrl ?? null);
    } catch {
      setProfileImageUrl(null);
    }
  }, [user]);

  useEffect(() => {
    refreshProfileImage();
  }, [refreshProfileImage]);

  return (
    <ProfileImageContext.Provider value={{ profileImageUrl, refreshProfileImage }}>
      {children}
    </ProfileImageContext.Provider>
  );
}

export function useProfileImage() {
  const ctx = useContext(ProfileImageContext);
  if (!ctx) throw new Error('useProfileImage debe usarse dentro de ProfileImageProvider');
  return ctx;
}
