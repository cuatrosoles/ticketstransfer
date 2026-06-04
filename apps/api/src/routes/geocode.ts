/**
 * Geocodificación pública (registro / formularios).
 */

import { Router } from 'express';
import { reverseGeocodeCoordinates } from '../lib/geocoding.js';

const router = Router();

/** Convierte lat/lng en dirección aproximada (Nominatim). */
router.get('/reverse', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400).json({ error: 'lat y lng válidos requeridos' });
    return;
  }
  const result = await reverseGeocodeCoordinates(lat, lng);
  if (!result) {
    res.status(404).json({ error: 'No se pudo resolver la dirección para esas coordenadas' });
    return;
  }
  res.json(result);
});

export const geocodeRouter = router;
