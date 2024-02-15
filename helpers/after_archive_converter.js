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

items.forEach((item) => {
  if (item.locations) {
    item.location_data = locations.filter((l) =>
      item.locations.includes(l.slug)
    );
  }

  const country = countries.find((c) => c.slug === item.country);
  const city = country.cities.find((c) => c.slug === item.city);

  const date = new Date(item.date);
  item.date = date.toISOString().replace('T', ' ').substring(0, 19);

  item.countryData = {
    iso: country.iso,
    name: country.name,
    name_pt: country.name_pt || null,
    slug: country.slug,
  };

  item.cityData = {
    end: city.end,
    name: city.name,
    name_pt: city.name_pt || null,
    slug: city.slug,
  };

  if (item.type === 'post') {
    item.date = city.end + ' 12:00:00';
  }

  let itemHashtags = item.hashtags
    ? typeof item.hashtags === 'string'
      ? item.hashtags.split(' ')
      : item.hashtags
    : [];

  itemHashtags = itemHashtags
    .filter(
      (h) => h !== 'viagem' && h !== 'viagens' && h !== 'travel' && h !== 'trip'
    )
    .map((h) => string_to_slug(h));

  item.hashtags = [
    ...itemHashtags,
    item.city.replaceAll('-', ''),
    item.country.replaceAll('-', ''),
  ];
  item.hashtags_pt = [
    ...itemHashtags,
    item.city.replaceAll('-', ''),
    item.country.replaceAll('-', ''),
  ];
  item.city_location_id = city.location_id;

  const enTags = [];
  const ptTags = [];

  item.hashtags.forEach((h) => {
    const hashtag = hashtags.find(
      (hash) =>
        hash.name == h ||
        (hash.alternate_tags && hash.alternate_tags.includes(h))
    );

    if (!hashtag) {
      // console.log(hashtag)
      return;
    }

    if (hashtag.name_pt) {
      enTags.push(hashtag.name);
      ptTags.push(hashtag.name_pt);
    }

    if (hashtag.alternate_tags && hashtag.alternate_tags.includes(h)) {
      item.hashtags = [
        ...item.hashtags.filter((c) => !hashtag.alternate_tags.includes(c)),
        hashtag.name,
      ];

      if (hashtag.name_pt) {
        enTags.push(hashtag.name);
        ptTags.push(hashtag.name_pt);
      }
    }
  });

  item.hashtags = item.hashtags.filter((h) => !ptTags.includes(h));
  item.hashtags_pt = [
    ...item.hashtags.filter((h) => !enTags.includes(h)),
    ...ptTags,
  ];

  item.hashtags = [...new Set(item.hashtags)].filter((h) => h);

  if (item.hashtags_pt) {
    item.hashtags_pt = [...new Set(item.hashtags_pt)].filter((h) => h);
  }

  delete item.newHashtags;

  theBatch.set(
    doc(
      db,
      '/countries/' +
        item.country +
        '/cities/' +
        item.city +
        '/medias/' +
        item.id
    ),
    item,
    { merge: true }
  );
});

console.log(items);

theBatch.commit();
