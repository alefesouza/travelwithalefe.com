import Country, {
  generateMetadata as generateMediaMetadata,
} from '../../posts/[...media]/page';

export async function generateMetadata({ params: { country, city, video } }) {
  return generateMediaMetadata({
    params: {
      country,
      city,
      media: [city + '-youtube-' + [video]],
    },
  });
}

export default async function Video({
  params: { country, city, video },
  searchParams,
}) {
  return Country({
    params: {
      country,
      city,
      media: [city + '-youtube-' + [video]],
    },
    searchParams,
  });
}
