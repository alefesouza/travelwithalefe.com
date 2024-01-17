const cities = countries.flatMap((c) => c.cities);

const stringToSlug = (str) => {
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

const cityIndexes = {};
const countryIndexes = {};

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
    stringToSlug(item.location).replaceAll('-', ''),
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
    stringToSlug(item.location).replaceAll('-', ''),
  ];

  if (item.location.toLowerCase().includes('praia')) {
    item.hashtags.push('beach');
    item.hashtags_pt.push('praia');
  }

  item.type = 'maps';

  if (item.location.includes(' ')) {
    const location = {
      name: item.location,
      slug: stringToSlug(item.location),
      city: item.city,
      country: item.country,
      latitude: item.latitude,
      longitude: item.longitude,
      altitude: item.altitude,
    };
    locationsToCreate.push(location);

    item.location_data = [
      {
        name: location.name,
        name_pt: location.name_pt || null,
        slug: stringToSlug(item.location),
        alternative_names: location.alternative_names || [],
        latitude: item.latitude || location.latitude || null,
        longitude: item.longitude || location.longitude || null,
        altitude: item.altitude || null,
      },
    ];
    item.locations = [item.location];
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

medias.forEach((item) => {
  if (!cityIndexes[item.city]) {
    cityIndexes[item.city] = 0;
  }

  if (!countryIndexes[item.country]) {
    countryIndexes[item.country] = 0;
  }

  item.city_index = cityIndexes[item.city];
  item.country_index = countryIndexes[item.country];
  item.order = countryIndexes[item.country];

  cityIndexes[item.city]++;
  countryIndexes[item.country]++;

  console.log(item);
  // theBatch.set(
  //   doc(
  //     db,
  //     '/countries/' +
  //       item.country +
  //       '/cities/' +
  //       item.city +
  //       '/medias/' +
  //       item.id
  //   ),
  //   item,
  //   { merge: true }
  // );
});

locationsToCreate.forEach((l) => {
  console.log(l);
  // theBatch.set(
  //   doc(
  //     db,
  //     '/countries/' +
  //       l.country +
  //       '/cities/' +
  //       l.city +
  //       '/locations/' +
  //       l.slug
  //   ),
  //   l,
  //   { merge: true }
  // );

  // theBatch.set(
  //   doc(db, '/hashtags/' + l.slug.replaceAll('-', '')),
  //   {
  //     name: l.slug.replaceAll('-', ''),
  //     hide_on_clouse: false,
  //     is_place: true,
  //     is_location: true,
  //     is_city: false,
  //     is_country: false,
  //   },
  //   { merge: true }
  // );
});

theBatch.commit();
