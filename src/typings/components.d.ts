/**
 * Type definitions for component props
 */

import { Media } from './media';
import { Location } from './location';

export interface SortPickerProps {
  i18n: (key: string) => string;
  sort: 'asc' | 'desc' | 'random';
  paginationBase: string;
  type: string;
  isRandom: boolean;
  newShuffle: number | null;
  useCache: boolean;
}

export interface City {
  slug: string;
  name: string;
  name_pt?: string;
}

export interface CityTabsProps {
  countrySlug: string;
  cities: City[];
  currentCity: string | null;
  expandGalleries: boolean;
  sort: 'asc' | 'desc' | 'random';
  i18n: (key: string) => string;
  isBR: boolean;
}

export interface MainLocationsProps {
  locations: Location[];
  i18n: (key: string) => string;
  isBR: boolean;
  host: (path: string) => string;
}

export interface MediaSectionProps {
  title: string;
  medias: Media[];
  isBR: boolean;
  expandGalleries: boolean;
  editMode: boolean;
  isRandom: boolean;
  page: number;
  paginationBase: string;
  pageNumber: number;
  total: number;
  i18n: (key: string) => string;
  country: string;
  city: string | null;
  sort: 'asc' | 'desc' | 'random';
  newShuffle: number | null;
  useCache: boolean;
  label?: string | null;
  showExpandLink?: boolean;
}
