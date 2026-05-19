/**
 * Barra de progreso al volver al inicio tras publicar (se activa al pulsar OK, no al montar Home).
 */

import * as React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TopLoadingBar } from '../components/TopLoadingBar';

type Ctx = {
  startPostPublishLoading: () => void;
};

const PostPublishLoadingContext = createContext<Ctx | null>(null);

export function PostPublishLoadingProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  const startPostPublishLoading = useCallback(() => {
    setVisible(true);
  }, []);

  const onFinish = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <PostPublishLoadingContext.Provider value={{ startPostPublishLoading }}>
      <View style={styles.root}>
        {children}
        <TopLoadingBar visible={visible} onFinish={onFinish} />
      </View>
    </PostPublishLoadingContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export function usePostPublishLoading(): Ctx {
  const ctx = useContext(PostPublishLoadingContext);
  if (!ctx) {
    return { startPostPublishLoading: () => {} };
  }
  return ctx;
}
