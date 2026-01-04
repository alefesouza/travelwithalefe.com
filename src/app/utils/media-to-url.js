import getTypePath from './get-type-path';

const mediaToUrl = (media) => {
  // Process the media ID
  let mediaId = media.id
    .replace(media.city + '-post-', '')
    .replace(media.city + '-story-', '')
    .replace(media.city + '-youtube-', '')
    .replace(media.city + '-short-video-', '')
    .replace(media.city + '-360photo-', '')
    .replace(media.city + '-maps-', '')
    .replace('road-trip-sea-las-story-', '')
    .replace('road-trip-sea-las-post-', '');

  // Construct the URL
  const url = `/countries/${media.country}/cities/${media.city}/${getTypePath(
    media.type
  )}/${mediaId}`;

  return url;
};

export default mediaToUrl;
