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

const allHashtags = hashtags.map((h) => h.name);

items.forEach((item, i) => {
  // if (item.locations) {
  //   item.location_data = locations.filter((l) =>
  //     item.locations.includes(l.slug)
  //   );
  // }

  if (item.location_data && item.location_data[0]) {
    let name = item.location_data[0].name;

    if (name.includes(' $ ')) {
      const split = name.split(' $ ');
      item.location_data[0].name = split[0];
      item.location_data[0].name_pt = split[1];
    }

    theBatch.set(
      doc(
        db,
        '/countries/' +
          item.country +
          '/cities/' +
          item.city +
          '/locations/' +
          item.location_data[0].slug
      ),
      {
        ...item.location_data[0],
      },
      {
        merge: true,
      }
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

  const newHashtags = item.hashtags.filter((h) => !allHashtags.includes(h));

  newHashtags.pop();
  newHashtags.pop();

  if (newHashtags.length) {
    newHashtags.forEach((hashtag) => {
      let hashtagsPt = null;

      item.hashtags_pt = item.hashtags_pt.filter((h) => h !== hashtag);

      if (hashtag === 'establishments') {
        hashtagsPt = 'estabelecimentos';
        item.hashtags_pt.push('estabelecimentos');
      }

      if (hashtag === 'filming') {
        hashtagsPt = 'filmando';
        item.hashtags_pt.push('filmando');
      }

      if (hashtag === 'lizard') {
        hashtagsPt = 'iguana';
        item.hashtags_pt.push('iguana');
      }

      if (hashtag === 'sunset') {
        hashtagsPt = 'pordosol';
        item.hashtags_pt.push('pordosol');
      }

      if (hashtag === 'breakfast') {
        hashtagsPt = 'cafedamanha';
        item.hashtags_pt.push('cafedamanha');
      }

      if (hashtag === 'naturalmonuments') {
        hashtagsPt = 'monumentosnaturais';
        item.hashtags_pt.push('monumentosnaturais');
      }

      if (hashtag === 'rooster') {
        hashtagsPt = 'galo';
        item.hashtags_pt.push('galo');
      }

      if (hashtag === 'graffiti') {
        hashtagsPt = 'grafite';
        item.hashtags_pt.push('grafite');
      }

      if (hashtag === 'funny') {
        hashtagsPt = 'divertido';
        item.hashtags_pt.push('divertido');
      }

      if (hashtag === 'eating') {
        hashtagsPt = 'comendo';
        item.hashtags_pt.push('comendo');
      }

      if (hashtag === 'roadway') {
        hashtagsPt = 'estrada';
        item.hashtags_pt.push('estrada');
      }

      if (hashtag === 'coins') {
        hashtagsPt = 'moedas';
        item.hashtags_pt.push('moedas');
      }

      if (hashtag === 'ocean') {
        hashtagsPt = 'oceano';
        item.hashtags_pt.push('oceano');
      }

      if (hashtag === 'working') {
        hashtagsPt = 'trabalhando';
        item.hashtags_pt.push('trabalhando');
      }

      theBatch.set(
        doc(db, '/hashtags/' + hashtag),
        {
          name: hashtag,
          name_pt: hashtagsPt,
          hide_on_cloud: false,
          is_city: false,
          is_country: false,
          is_location: false,
          is_place: false,
        },
        {
          merge: true,
        }
      );
    });
  }

  console.log(item);

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
