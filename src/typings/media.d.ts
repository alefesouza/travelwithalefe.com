/**
 * Type definitions for media objects
 */

export interface MediaTotals {
  stories: number;
  posts: number;
  photos360: number;
  videos: number;
  shorts: number;
  maps: number;
}

export interface MediaLocationData {
  slug: string;
  name: string;
  country: string;
  city: string;
  latitude: string;
  longitude: string;
  total: number;
  totals: MediaTotals;
}

export interface GalleryItem {
  file: string;
  file_type: string;
  duration?: number;
  item_hashtags?: string[];
}

export interface CountryData {
  slug: string;
  name: string;
  name_pt: string | null;
  iso: string;
}

export interface CityData {
  slug: string;
  name: string;
  name_pt: string | null;
  start?: string;
  end?: string;
}

export interface CreatedAt {
  seconds: number;
  nanoseconds: number;
}

export interface Media {
  id: string;
  type: string;
  file: string;
  original_file: string;
  date: string;
  link: string;
  path: string;
  width: number;
  height: number;
  order: number;
  country: string;
  country_index: number;
  city: string;
  city_index: number;
  city_location_id: number;
  hashtags: string[];
  hashtags_pt: string[];
  locations: string[];
  location_data: MediaLocationData[];
  description: string;
  description_pt: string;
  gallery: GalleryItem[];
  countryData: CountryData;
  cityData: CityData;
  createdAt: CreatedAt;
  is_compilation: boolean;
  previous: string | null;
  next: string | null;
  pixelfed_id?: string;
  pixelfed_id_pt?: string;
  mastodon_id?: string;
  mastodon_id_pt?: string;
  twitter_id?: string;
  twitter_id_pt?: string;
  bluesky_id?: string;
  bluesky_id_pt?: string;
}
