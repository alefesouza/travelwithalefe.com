/**
 * Type definitions for component props
 */

import { Media } from './media';
import { Location } from './location';

export interface SortPickerProps {
  i18n: (key: string) => string;
  sort: 'asc' | 'desc';
  paginationBase: string;
  type: string;
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
  sort: 'asc' | 'desc';
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
  page: number;
  paginationBase: string;
  pageNumber: number;
  total: number;
  i18n: (key: string) => string;
  country: string;
  city: string | null;
  sort: 'asc' | 'desc';
  newShuffle: number | null;
  useCache: boolean;
  label?: string | null;
  showExpandLink?: boolean;
}
