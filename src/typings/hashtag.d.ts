/**
 * Type definitions for hashtag objects
 */

export interface HashtagTotals {
  stories: number;
  posts: number;
  photos360: number;
  videos: number;
  shorts: number;
  maps: number;
}

export interface Hashtag {
  name: string;
  name_pt: string;
  alternate_tags: string[];
  total: number;
  totals: HashtagTotals;
  is_place: boolean;
  is_city: boolean;
  is_location: boolean;
  is_country: boolean;
  hide_on_cloud: boolean;
  index: number;
}
