import { validateCountryCity } from '@/app/utils/validation-helpers';
import MediaPage, {
  generateMetadata as generateMediaMetadata,
} from '../../posts/[...media]/page';

export async function generateMetadata({ params: paramsPromise }) {
  const { country, city, photo } = await paramsPromise;

  validateCountryCity(country, city);

  return generateMediaMetadata({
    params: {
      country,
      city,
      media: [city + '-360photo-' + [photo]],
    },
  });
}

export default async function Video({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}) {
  const { country, city, photo } = await paramsPromise;
  const searchParams = await searchParamsPromise;

  validateCountryCity(country, city);

  return MediaPage({
    params: {
      country,
      city,
      media: [city + '-360photo-' + [photo]],
    },
    searchParams,
  });
}
