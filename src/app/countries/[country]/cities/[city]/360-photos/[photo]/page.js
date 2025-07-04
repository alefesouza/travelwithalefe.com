import { cachedCities, cachedCountries } from '@/app/utils/cache-data';
import Country, {
  generateMetadata as generateMediaMetadata,
} from '../../posts/[...media]/page';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params: { country, city, photo } }) {
  if (
    !cachedCountries.includes(country) ||
    (city && !cachedCities.includes(city))
  ) {
    return notFound();
  }

  return generateMediaMetadata({
    params: {
      country,
      city,
      media: [city + '-360photo-' + [photo]],
    },
  });
}

export default async function Video({
  params: { country, city, photo },
  searchParams,
}) {
  if (
    !cachedCountries.includes(country) ||
    (city && !cachedCities.includes(city))
  ) {
    return notFound();
  }

  return Country({
    params: {
      country,
      city,
      media: [city + '-360photo-' + [photo]],
    },
    searchParams,
  });
}
