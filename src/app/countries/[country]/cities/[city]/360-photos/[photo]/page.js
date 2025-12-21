import { validateCountryCity } from '@/app/utils/validation-helpers';
import Country, {
  generateMetadata as generateMediaMetadata,
} from '../../posts/[...media]/page';

export async function generateMetadata({ params: { country, city, photo } }) {
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
  params: { country, city, photo },
  searchParams,
}) {
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
