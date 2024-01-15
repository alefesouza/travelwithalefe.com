const locationsToCreate = [];

const cityIndexes = {};
const countryIndexes = {};

items.sort((a, b) => {
  return a.id.localeCompare(b.id, 'en', { numeric: true });
});

items.forEach(function (item, i) {
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

  if (item.location.toLowerCase().includes('niagara-galls')) {
    item.hashtags.push('waterfall');
    item.hashtags_pt.push('cachoeira');
    item.hashtags.push('waterfalls');
    item.hashtags_pt.push('cataratas');
    item.hashtags.push('water');
    item.hashtags_pt.push('agua');
  }

  if (item.location.toLowerCase().includes('cn-tower')) {
    item.hashtags.push('observationdeck');
    item.hashtags_pt.push('mirante');
  }

  item.type = 'maps';

  const before = items[i - 1];
  const after = items[i + 1];

  if (before && before.city == item.city && before.country == item.country) {
    item.previous = before.id;
  }

  if (after && after.city == item.city && after.country == item.country) {
    item.next = after.id;
  }
});

items.forEach((item) => {
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
