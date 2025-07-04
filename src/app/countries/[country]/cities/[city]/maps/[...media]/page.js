import { cachedCities, cachedCountries } from '@/app/utils/cache-data';
import Country, {
  generateMetadata as generateMediaMetadata,
} from '../../posts/[...media]/page';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params: { country, city, media } }) {
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
      media: [city + '-maps-' + [media]],
    },
  });
}

export default async function Video({
  params: { country, city, media },
  searchParams,
}) {
  return Country({
    params: {
      country,
      city,
      media: [city + '-maps-' + [media]],
    },
    searchParams,
  });
}
