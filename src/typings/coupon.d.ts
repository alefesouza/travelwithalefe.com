/**
 * Type definitions for coupon objects
 */

export interface Coupon {
  id: string;
  slug: string;
  name: string;
  title: string;
  title_pt: string;
  description: string;
  description_pt: string;
  order: number;
  link?: string;
  code?: string;
  value?: number | string;
  type?: string;
  currency?: string;
  how_i_use?: string;
  how_i_use_pt?: string;
  categories?: string[];
  name_pt?: string;
  regulation?: string;
  isBR?: boolean;
}
