/**
 * Barra de carga superior al volver al inicio tras publicar.
 */

import { useEffect, useState } from 'react';

type Props = {
  active: boolean;
  onDone?: () => void;
};

export function TopLoadingBar({ active, onDone }: Props) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return;
    setVisible(true);
    setProgress(0);
    const t1 = window.setTimeout(() => setProgress(72), 80);
    const t2 = window.setTimeout(() => setProgress(100), 1800);
    const t3 = window.setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 2400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [active, onDone]);

  if (!visible) return null;

  return (
    <div className="top-loading-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <div className="top-loading-bar__inner" style={{ width: `${progress}%` }} />
    </div>
  );
}
