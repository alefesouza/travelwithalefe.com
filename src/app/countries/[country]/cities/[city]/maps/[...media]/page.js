import Country, {
  generateMetadata as generateMediaMetadata,
} from '../../posts/[...media]/page';

export async function generateMetadata({ params: { country, city, media } }) {
  return generateMediaMetadata({
    params: {
      country,
      city,
      media: [city + '-maps-' + [media]],
    },
  });
}

export default async function Video({ params: { country, city, media } }) {
  return Country({
    params: {
      country,
      city,
      media: [city + '-maps-' + [media]],
    },
  });
}
