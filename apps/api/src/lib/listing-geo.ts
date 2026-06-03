/**
 * Resolución de coordenadas para publicaciones de tickets.
 */

import { hasValidCoordinates, type LocationSource } from '@tickets-transfer/shared';
import { geocodeAddress } from './geocoding.js';

export type EventGeoFields = {
  eventLatitude: number | null;
  eventLongitude: number | null;
  eventLocationSource: LocationSource | null;
  eventGeocodedAt: Date | null;
};

export async function resolveEventCoordinates(input: {
  eventLatitude?: number | null;
  eventLongitude?: number | null;
  eventLocationSource?: LocationSource | null;
  eventAddress?: string | null;
  eventCity?: string | null;
  eventPlace?: string | null;
}): Promise<EventGeoFields> {
  if (hasValidCoordinates(input.eventLatitude, input.eventLongitude)) {
    return {
      eventLatitude: input.eventLatitude!,
      eventLongitude: input.eventLongitude!,
      eventLocationSource: input.eventLocationSource ?? 'manual',
      eventGeocodedAt: null,
    };
  }

  const geocoded = await geocodeAddress({
    place: input.eventPlace,
    address: input.eventAddress,
    city: input.eventCity,
  });

  if (geocoded) {
    return {
      eventLatitude: geocoded.latitude,
      eventLongitude: geocoded.longitude,
      eventLocationSource: geocoded.source,
      eventGeocodedAt: new Date(),
    };
  }

  return {
    eventLatitude: null,
    eventLongitude: null,
    eventLocationSource: null,
    eventGeocodedAt: null,
  };
}
