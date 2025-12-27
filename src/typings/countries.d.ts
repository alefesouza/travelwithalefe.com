/**
 * Type definitions for countries objects
 */

export interface CityTotals {
  stories: number;
  posts: number;
  photos360: number;
  videos: number;
  shorts: number;
  maps: number;
}

export interface City {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  mapZoom: number;
  order: number;
  total: number;
  totals: CityTotals;
  location_id: number;
  start: string;
  end: string;
}

export interface CountryTotals {
  stories: number;
  posts: number;
  photos360: number;
  videos: number;
  shorts: number;
  maps: number;
}

export interface Country {
  slug: string;
  name: string;
  name_pt?: string;
  flag: string;
  iso: string;
  latitude: number;
  longitude: number;
  mapZoom: number;
  order: number;
  total: number;
  totals: CountryTotals;
  is_compilation: boolean;
  cities?: City[];
}

declare const countries: Country[];

export default countries;
