/**
 * Botón Publicar con relleno de progreso y mensaje de etapa.
 */

type Props = {
  label: string;
  progressLabel?: string;
  progress: number;
  loading: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
};

export function PublishProgressButton({
  label,
  progressLabel,
  progress,
  loading,
  disabled,
  type = 'submit',
  onClick,
}: Props) {
  const pct = Math.max(0, Math.min(100, progress));
  return (
    <button
      type={type}
      className="publish-progress-btn"
      disabled={disabled || loading}
      onClick={onClick}
      style={{ ['--publish-progress' as string]: `${pct}%` }}
    >
      <span className="publish-progress-btn__fill" aria-hidden />
      <span className="publish-progress-btn__content">
        <span className="publish-progress-btn__label">
          {loading && progressLabel ? progressLabel : label}
        </span>
        {loading ? <span className="publish-progress-btn__pct">{pct}%</span> : null}
      </span>
    </button>
  );
}
