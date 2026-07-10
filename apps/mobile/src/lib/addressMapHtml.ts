/**
 * Mapa interactivo (Leaflet + OSM) embebido en WebView para confirmar ubicación con pin.
 */
export function getAddressMapHtml(latitude: number, longitude: number): string {
  const lat = Number(latitude.toFixed(6));
  const lng = Number(longitude.toFixed(6));
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="">
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; height: 100%; width: 100%; background: #0f172a; }
    #map { height: 100%; width: 100%; }
    .leaflet-control-attribution { font-size: 9px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function() {
      var INITIAL_LAT = ${lat};
      var INITIAL_LNG = ${lng};

      function postCoords(lat, lng) {
        if (!window.ReactNativeWebView) return;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'coords',
          latitude: lat,
          longitude: lng
        }));
      }

      var map = L.map('map', { zoomControl: true }).setView([INITIAL_LAT, INITIAL_LNG], 17);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      var marker = L.marker([INITIAL_LAT, INITIAL_LNG], { draggable: true }).addTo(map);

      marker.on('dragend', function() {
        var pos = marker.getLatLng();
        postCoords(pos.lat, pos.lng);
      });

      map.on('click', function(e) {
        marker.setLatLng(e.latlng);
        postCoords(e.latlng.lat, e.latlng.lng);
      });

      setTimeout(function() { map.invalidateSize(); }, 250);
      postCoords(INITIAL_LAT, INITIAL_LNG);
    })();
  </script>
</body>
</html>`;
}
