/**
 * Barra de progreso al volver al inicio tras publicar (se activa al pulsar OK, no al montar Home).
 */

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { TopLoadingBar } from '../components/TopLoadingBar';

type Ctx = {
  startPostPublishLoading: () => void;
};

const PostPublishLoadingContext = createContext<Ctx | null>(null);

export function PostPublishLoadingProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);

  const startPostPublishLoading = useCallback(() => {
    setActive(true);
  }, []);

  const onDone = useCallback(() => {
    setActive(false);
  }, []);

  return (
    <PostPublishLoadingContext.Provider value={{ startPostPublishLoading }}>
      {children}
      <TopLoadingBar active={active} onDone={onDone} />
    </PostPublishLoadingContext.Provider>
  );
}

export function usePostPublishLoading(): Ctx {
  const ctx = useContext(PostPublishLoadingContext);
  if (!ctx) {
    return { startPostPublishLoading: () => {} };
  }
  return ctx;
}
