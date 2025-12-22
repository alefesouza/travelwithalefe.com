import { validateCountryCity } from '@/app/utils/validation-helpers';
import MediaPage, {
  generateMetadata as generateMediaMetadata,
} from '../../posts/[...media]/page';

export async function generateMetadata({ params: { country, city, media } }) {
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
  params: { country, city, media },
  searchParams,
}) {
  return MediaPage({
    params: {
      country,
      city,
      media: [city + '-maps-' + [media]],
    },
    searchParams,
  });
}
