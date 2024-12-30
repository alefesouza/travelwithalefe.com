import Country, {
  generateMetadata as generateMediaMetadata,
} from '../../posts/[...media]/page';

export async function generateMetadata({ params: { country, city, photo } }) {
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
  return Country({
    params: {
      country,
      city,
      media: [city + '-360photo-' + [photo]],
    },
    searchParams,
  });
}
