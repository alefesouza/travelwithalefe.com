const allHashtags = hashtags.flatMap((hashtag) => [
  hashtag.name,
  hashtag.name_pt,
]);
let unkownHashtags = medias
  .flatMap((media) => media.hashtags)
  .filter((hashtag) => !allHashtags.includes(hashtag))
  .filter((hashtag) => hashtag);

unkownHashtags = [...new Set([...unkownHashtags])];

const countrySlugs = countries.map((country) =>
  country.slug.replaceAll('-', '')
);
const citySlugs = countries
  .flatMap((country) => country.cities)
  .map((city) => city.slug.replaceAll('-', ''));
const locationSlugs = locations.map((location) =>
  location.slug.replaceAll('-', '')
);

console.log(countrySlugs, citySlugs, locationSlugs);

console.log(unkownHashtags);

unkownHashtags.forEach((hashtag) => {
  const newHashtag = {
    name: hashtag,
    total: 0,
    totals: {},
    is_place:
      citySlugs.includes(hashtag) ||
      countrySlugs.includes(hashtag) ||
      locationSlugs.includes(hashtag),
    is_city: citySlugs.includes(hashtag),
    is_country: countrySlugs.includes(hashtag),
    is_location: locationSlugs.includes(hashtag),
    hide_on_cloud: false,
  };

  const newHashtagRef = doc(db, 'hashtags/' + hashtag);

  theBatch.set(newHashtagRef, newHashtag);
});

theBatch.commit();
