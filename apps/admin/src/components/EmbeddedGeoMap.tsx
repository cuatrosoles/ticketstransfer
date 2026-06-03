/**
 * Mapa embebido OpenStreetMap (sin dependencias extra).
 */

type Props = {
  latitude: number;
  longitude: number;
  /** Altura del iframe en px */
  height?: number;
  title?: string;
};

function bboxForPoint(lat: number, lon: number, delta = 0.02): string {
  const west = lon - delta;
  const east = lon + delta;
  const south = lat - delta;
  const north = lat + delta;
  return `${west},${south},${east},${north}`;
}

export function EmbeddedGeoMap({ latitude, longitude, height = 280, title = 'Ubicación en mapa' }: Props) {
  const bbox = bboxForPoint(latitude, longitude);
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  const externalUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong style={{ fontSize: '0.875rem' }}>{title}</strong>
        <a href={externalUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8125rem' }}>
          Abrir en OpenStreetMap
        </a>
      </div>
      <iframe
        title={title}
        src={embedUrl}
        style={{
          width: '100%',
          height,
          border: '1px solid var(--border, #334155)',
          borderRadius: 8,
          display: 'block',
        }}
        loading="lazy"
      />
    </div>
  );
}
