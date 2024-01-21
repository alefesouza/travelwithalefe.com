const cities = countries.flatMap((c) => c.cities);

const stringToSlug = (initialStr) => {
  let str = initialStr;
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

  if (str === '-') {
    return initialStr
      .replaceAll(' ', '-')
      .replaceAll('(', '')
      .replaceAll(')', '');
  }

  return str;
};

function titleCase(str) {
  var splitStr = str.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(' ');
}

const locationsToCreate = [];

medias.forEach(function (item, i) {
  const country = countries.find((c) => c.slug == item.country);
  const city = cities.find((c) => c.slug == item.city);

  item.cityData = {
    end: city.end,
    slug: city.slug,
    name: city.name,
    name_pt: city.name_pt || null,
  };

  item.countryData = {
    iso: country.iso,
    slug: country.slug,
    name: country.name,
    name_pt: country.name_pt || null,
  };

  item.city_location_id = city.location_id;

  item.hashtags = [
    item.city.replaceAll('-', ''),
    item.country.replaceAll('-', ''),
    stringToSlug(item.location.split(' $ ')[0]).replaceAll('-', ''),
  ];
  item.hashtags_pt = [
    (city.name_pt
      ? stringToSlug(city.name_pt).replaceAll('-', '')
      : item.city
    ).replaceAll('-', ''),
    (country.name_pt
      ? stringToSlug(country.name_pt).replaceAll('-', '')
      : item.city
    ).replaceAll('-', ''),
    stringToSlug(item.location.split(' $ ')[0]).replaceAll('-', ''),
  ];

  if (
    item.location.toLowerCase().includes('cafe') ||
    item.location.toLowerCase().includes('terarosa')
  ) {
    item.hashtags.push('cafe');
    item.hashtags_pt.push('cafeteria');
  }

  if (
    item.location.toLowerCase().includes('egg-drop') ||
    item.location.toLowerCase().includes('Doma도마 ') ||
    item.location.toLowerCase().includes('bibimbap')
  ) {
    item.hashtags.push('food');
    item.hashtags_pt.push('comida');
  }

  if (item.location.toLowerCase().includes('gangnam-style-statue')) {
    item.hashtags.push('monuments');
    item.hashtags_pt.push('monumentos');
  }

  if (item.location.toLowerCase().includes('palace')) {
    item.hashtags.push('palaces');
    item.hashtags_pt.push('palacios');
  }

  if (
    item.location.toLowerCase().includes('bibimbap') ||
    item.location.toLowerCase().includes('오비낙원호프')
  ) {
    item.hashtags.push('bibimbap');
    item.hashtags_pt.push('bibimbap');
    item.hashtags.push('koreanfood');
    item.hashtags_pt.push('comidacoreana');
    item.hashtags.push('typicalfood');
    item.hashtags_pt.push('comidastipicas');
  }

  if (item.location.toLowerCase().includes('콩뼈숯뼈-감자탕')) {
    item.hashtags.push('koreanfood');
    item.hashtags_pt.push('comidacoreana');
  }

  if (item.location.toLowerCase().includes('shrine')) {
    item.hashtags.push('shrine');
    item.hashtags_pt.push('santuario');
  }

  if (
    item.location.toLowerCase().includes('makercity sewoon') ||
    item.location.toLowerCase().includes('n-seoul-tower') ||
    item.location.toLowerCase().includes('seoul-sky-lotte-world-tower') ||
    item.location.toLowerCase().includes('namsan-cable-car')
  ) {
    item.hashtags.push('observationdeck');
    item.hashtags_pt.push('mirante');
  }

  if (
    item.location.toLowerCase().includes('namsan') ||
    item.location.toLowerCase().includes('park')
  ) {
    item.hashtags.push('parks');
    item.hashtags_pt.push('parques');
  }

  if (item.location.toLowerCase().includes('museum')) {
    item.hashtags.push('museums');
    item.hashtags_pt.push('museus');
  }

  if (
    item.location.toLowerCase().includes('statue') ||
    item.location.toLowerCase().includes('전태일다리 (버들다리)')
  ) {
    item.hashtags.push('statue');
    item.hashtags_pt.push('estatua');
  }

  if (item.location.toLowerCase().includes('ghibli')) {
    item.hashtags.push('ghibli');
    item.hashtags_pt.push('ghibli');
    item.hashtags.push('studioghibli');
    item.hashtags_pt.push('estudioghibli');
  }

  item.type = 'maps';

  if (item.location.includes(' ')) {
    const [name, alternative] = item.location.split(' $ ');

    const location = {
      name,
      slug: stringToSlug(name),
      city: item.city,
      country: item.country,
      latitude: item.latitude || null,
      longitude: item.longitude || null,
      altitude: item.altitude || null,
    };

    if (alternative) {
      location.alternative_names = [alternative];
    }

    const existingIndex = locationsToCreate.findIndex(
      (l) => l.slug === location.slug
    );
    if (existingIndex === -1) {
      locationsToCreate.push(location);
    } else if (
      !locationsToCreate[existingIndex].latitude &&
      location.latitude
    ) {
      locationsToCreate[existingIndex] = location;
    }

    item.location_data = [
      {
        name: location.name,
        name_pt: location.name_pt || null,
        slug: stringToSlug(name),
        alternative_names: location.alternative_names || [],
        latitude: item.latitude || location.latitude || null,
        longitude: item.longitude || location.longitude || null,
        altitude: item.altitude || null,
      },
    ];

    item.locations = [stringToSlug(name)];
  } else {
    const location = locations.find((c) => c.slug === item.location);

    if (location) {
      item.location_data = [
        {
          name: location.name,
          name_pt: location.name_pt || null,
          slug: item.location,
          alternative_names: location.alternative_names || [],
          latitude: item.latitude || location.latitude || null,
          longitude: item.longitude || location.longitude || null,
          altitude: item.altitude || null,
        },
      ];
      item.locations = [item.location];

      if (item.latitude && item.longitude) {
        theBatch.update(
          doc(
            db,
            `/countries/${item.country}/cities/${item.city}/locations/${location.slug}`
          ),
          {
            latitude: item.latitude,
            longitude: item.longitude,
            altitude: item.altitude,
          }
        );

        console.log({
          latitude: item.latitude,
          longitude: item.longitude,
          altitude: item.altitude,
        });
      }
    } else {
      const name = titleCase(item.location.replaceAll('-', ' '));

      if (item.latitude) {
        const location = {
          name: name,
          slug: item.location,
          city: item.city,
          country: item.country,
          latitude: item.latitude,
          longitude: item.longitude,
          altitude: item.altitude,
        };
        locationsToCreate.push(location);

        item.location_data = [
          {
            name: name,
            slug: item.location,
            latitude: item.latitude || location.latitude || null,
            longitude: item.longitude || location.longitude || null,
            altitude: item.altitude || null,
          },
        ];
        item.locations = [item.location];
      }
    }
  }

  const before = medias[i - 1];
  const after = medias[i + 1];

  if (before && before.city == item.city && before.country == item.country) {
    item.previous = before.id;

    if (!item.date) {
      item.date = before.date;
    }
  }

  if (after && after.city == item.city && after.country == item.country) {
    item.next = after.id;

    if (!item.date) {
      item.date = after.date;
    }
  }

  if (!item.date) {
    item.date = city.end + ' 12:00:00';
  }

  delete item.latitude_span;
  delete item.longitude_span;
});

medias.sort((a, b) => {
  return a.original_file.localeCompare(b.original_file);
});

const cityIndexes = {};
const countryIndexes = {
  'south-korea': 33,
};

medias.forEach((item) => {
  const split = item.id.split('-');
  const cityIndex = split[split.length - 1];

  if (!countryIndexes[item.country]) {
    countryIndexes[item.country] = 0;
  }

  item.city_index = cityIndex;
  item.country_index = countryIndexes[item.country];
  item.order = cityIndex;

  cityIndexes[item.city]++;
  countryIndexes[item.country]++;

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

console.log(medias);

locationsToCreate.forEach((l) => {
  console.log(l);
  theBatch.set(
    doc(
      db,
      '/countries/' + l.country + '/cities/' + l.city + '/locations/' + l.slug
    ),
    l,
    { merge: true }
  );
  theBatch.set(
    doc(db, '/hashtags/' + l.slug.replaceAll('-', '')),
    {
      name: l.slug.replaceAll('-', ''),
      hide_on_clouse: false,
      is_place: true,
      is_location: true,
      is_city: false,
      is_country: false,
    },
    { merge: true }
  );
});

theBatch.commit();
