import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME } from './constants';

export default function getMetadata(media, isBR, position) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();

  const locationCity = [
    media.cityData &&
      (isBR && media.cityData.name_pt
        ? media.cityData.name_pt
        : media.cityData.name),
    media.countryData &&
      (isBR && media.countryData.name_pt
        ? media.countryData.name_pt
        : media.countryData.name),
  ].join(' - ');
  const locationTitle =
    media.location_data &&
    media.location_data
      .slice(0, 2)
      .map(
        (c) =>
          ((isBR && c.name_pt ? c.name_pt : c.name) || '') +
          (c.alternative_names && c.alternative_names.length
            ? ' (' + c.alternative_names.join(', ') + ')'
            : '')
      )
      .join(', ') + (media.location_data.length > 2 ? '...' : '');
  const locationDescription =
    media.location_data &&
    media.location_data
      .filter((c) => (isBR && c.name_pt ? c.name_pt : c.name))
      .map(
        (c) =>
          (isBR && c.name_pt ? c.name_pt : c.name) +
          (c.alternative_names && c.alternative_names.length
            ? ' (' + c.alternative_names.join(', ') + ')'
            : '')
      )
      .join(', ');

  const hashtags =
    isBR && media.hashtags_pt ? media.hashtags_pt : media.hashtags;
  const description =
    (isBR && media.description_pt ? media.description_pt : media.description) ||
    '';
  const shortDescription =
    description.split(' ').length > 10
      ? description.split(' ').slice(0, 10).join(' ') + '…'
      : description;

  const title = [
    media.type === 'youtube'
      ? isBR && media.title_pt
        ? media.title_pt
        : media.title
      : shortDescription,
    media.type === '360photo' ? i18n('360 Photo') : '',
    media.img_index || position ? 'Item ' + (media.img_index || position) : '',
    locationTitle,
    locationCity,
    i18n(SITE_NAME),
  ]
    .filter((c) => c)
    .join(' - ');

  let embedVideo = null;
  let image = null;

  if (media.type === 'youtube') {
    const url = new URL(media.link);
    const id = url.searchParams.get('v');

    embedVideo = 'https://www.youtube.com/embed/' + id;
    image = 'https://img.youtube.com/vi/' + id + '/0.jpg';
  }

  if (media.type === 'short-video') {
    const split = media.youtube_link.split('/');
    const id = split[split.length - 1];

    embedVideo = 'https://www.youtube.com/embed/' + id;
    image = 'https://img.youtube.com/vi/' + id + '/0.jpg';
  }

  const cityDescription =
    i18n('City') +
    ': ' +
    (media.cityData &&
      (isBR && media.cityData.name_pt
        ? media.cityData.name_pt
        : media.cityData.name));

  const theDescription = [
    description,
    media.img_index ? 'Item ' + media.img_index : null,
    locationDescription
      ? i18n(media.location_data.length > 1 ? 'Places' : 'Place') +
        ': ' +
        locationDescription
      : cityDescription,
  ]
    .filter((c) => c)
    .join(' - ');

  return {
    title,
    description: theDescription,
    shortDescription,
    hashtags,
    locationDescription,
    cityDescription,
    embedVideo,
    image,
  };
}
