/**
 * Contexto para el menú dropdown de usuario – Accesible desde cualquier pantalla autenticada.
 */

import * as React from 'react';

type UserMenuContextType = {
  openMenu: () => void;
  closeMenu: () => void;
  isOpen: boolean;
};

const UserMenuContext = React.createContext<UserMenuContextType | null>(null);

export function UserMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const openMenu = React.useCallback(() => setIsOpen(true), []);
  const closeMenu = React.useCallback(() => setIsOpen(false), []);

  const value = React.useMemo(
    () => ({ openMenu, closeMenu, isOpen }),
    [openMenu, closeMenu, isOpen]
  );

  return (
    <UserMenuContext.Provider value={value}>
      {children}
    </UserMenuContext.Provider>
  );
}

export function useUserMenu() {
  const ctx = React.useContext(UserMenuContext);
  if (!ctx) throw new Error('useUserMenu must be used within UserMenuProvider');
  return ctx;
}
