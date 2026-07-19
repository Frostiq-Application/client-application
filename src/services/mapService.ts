export interface MapLocation {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  email?: string;
  hours?: string;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export class MapService {
  private static readonly GOOGLE_MAPS_API_BASE = 'https://maps.googleapis.com/maps/api';

  static generateEmbedUrl(location: MapLocation): string {
    const params = new URLSearchParams({
      pb: `!1m18!1m12!1m3!1d3506.749!2d${location.longitude}!3d${location.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s!2s${encodeURIComponent(location.address)}!5e0!3m2!1sen!2sin!4v1234567890123`,
    });

    return `https://www.google.com/maps/embed?${params.toString()}`;
  }

  static generateMapsUrl(location: MapLocation): string {
    return `https://www.google.com/maps/search/${encodeURIComponent(location.address)}/@${location.latitude},${location.longitude},15z`;
  }

  static generateStaticMapUrl(
    location: MapLocation,
    options?: { width?: number; height?: number; zoom?: number }
  ): string {
    const width = options?.width || 400;
    const height = options?.height || 300;
    const zoom = options?.zoom || 15;

    const params = new URLSearchParams({
      center: `${location.latitude},${location.longitude}`,
      zoom: zoom.toString(),
      size: `${width}x${height}`,
      markers: `color:red|${location.latitude},${location.longitude}`,
      key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    });

    return `${this.GOOGLE_MAPS_API_BASE}/staticmap?${params.toString()}`;
  }

  static isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
