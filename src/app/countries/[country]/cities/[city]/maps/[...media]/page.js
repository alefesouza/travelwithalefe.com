import { validateCountryCity } from '@/app/utils/validation-helpers';
import MediaPage, {
  generateMetadata as generateMediaMetadata,
} from '../../posts/[...media]/page';

export async function generateMetadata({ params: paramsPromise }) {
  const { country, city, media } = await paramsPromise;

  validateCountryCity(country, city);

  return generateMediaMetadata({
    params: {
      country,
      city,
      media: [city + '-maps-' + [media]],
    },
  });
}

export default async function Video({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}) {
  const { country, city, media } = await paramsPromise;
  const searchParams = await searchParamsPromise;

  return MediaPage({
    params: {
      country,
      city,
      media: [city + '-maps-' + [media]],
    },
    searchParams,
  });
}
