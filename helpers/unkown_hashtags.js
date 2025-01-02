function string_to_slug(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = 'àáäâãèéëêìíïîòóöôõùúüûñç·/_,:;';
  var to = 'aaaaaeeeeiiiiooooõuuuunc------';
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}

const allHashtags = [
  ...new Set(
    hashtags.flatMap((hashtag) => [
      string_to_slug(hashtag.name),
      hashtag.name_pt ? string_to_slug(hashtag.name_pt) : '',
    ])
  ),
].filter((hashtag) => hashtag);
let unkownHashtags = result
  .flatMap((media) => media.hashtags)
  .filter((hashtag) => !allHashtags.includes(hashtag))
  .filter((hashtag) => hashtag)
  .map((hashtag) => string_to_slug(hashtag));

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
  if (['floresta', 'osenhordosaneis'].includes(hashtag)) {
    return;
  }

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

  if (newHashtag.name === 'forest') {
    newHashtag.name_pt = 'floresta';
  }

  if (newHashtag.name === 'thelordoftherings') {
    newHashtag.name_pt = 'osenhordosaneis';
  }

  const newHashtagRef = doc(db, 'hashtags/' + hashtag);

  theBatch.set(newHashtagRef, newHashtag);
});

theBatch.commit();
