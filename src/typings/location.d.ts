/**
 * Type definitions for location objects
 */

export interface LocationTotals {
  stories: number;
  posts: number;
  photos360: number;
  videos: number;
  shorts: number;
  maps: number;
}

export interface Location {
  slug: string;
  name: string;
  name_pt: string;
  country: string;
  city: string;
  latitude: string;
  longitude: string;
  total: number;
  totals: LocationTotals;
}
