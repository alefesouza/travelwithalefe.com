import { validateCountryCity } from '@/app/utils/validation-helpers';
import MediaPage, {
  generateMetadata as generateMediaMetadata,
} from '../../posts/[...media]/page';

export async function generateMetadata({ params: paramsPromise }) {
  const { country, city, video } = await paramsPromise;

  validateCountryCity(country, city);

  return generateMediaMetadata({
    params: {
      country,
      city,
      media: [city + '-short-video-' + [video]],
      fromOutside: true,
    },
  });
}

export default async function Video({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}) {
  const { country, city, video } = await paramsPromise;
  const searchParams = await searchParamsPromise;

  validateCountryCity(country, city);

  return MediaPage({
    params: {
      country,
      city,
      media: [city + '-short-video-' + [video]],
      fromOutside: true,
    },
    searchParams,
  });
}
