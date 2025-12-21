import { validateCountryCity } from '@/app/utils/validation-helpers';
import Country, {
  generateMetadata as generateMediaMetadata,
} from '../../posts/[...media]/page';

export async function generateMetadata({ params: { country, city, video } }) {
  validateCountryCity(country, city);

  return generateMediaMetadata({
    params: {
      country,
      city,
      media: [city + '-short-video-' + [video]],
    },
  });
}

export default async function Video({
  params: { country, city, video },
  searchParams,
}) {
  validateCountryCity(country, city);

  return MediaPage({
    params: {
      country,
      city,
      media: [city + '-short-video-' + [video]],
    },
    searchParams,
  });
}
