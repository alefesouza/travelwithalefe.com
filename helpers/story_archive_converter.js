lastCountry = null;
lastCity = null;

cityCount = {};

countriesData = [
  {
    flag: '🇨🇴',
    name: 'Colombia',
    name_pt: 'Colômbia',
    cities: [
      {
        latitude: 6.238969970531699,
        longitude: -75.57147494926758,
        order: 1,
        name: 'Medellín',
        totals: {
          stories: 1,
          posts: 0,
          photos360: 0,
          videos: 0,
          shorts: 0,
          maps: 0,
        },
        mapZoom: 11,
        total: 1,
        slug: 'medellin',
        start: '2026-06-08',
        end: '2026-06-17',
        location_id: 1,
      },
      {
        latitude: 6.239494759519507,
        longitude: -75.19540032154745,
        order: 2,
        name: 'Guatapé',
        totals: {
          stories: 1,
          posts: 0,
          photos360: 0,
          videos: 0,
          shorts: 0,
          maps: 0,
        },
        mapZoom: 11,
        total: 1,
        slug: 'guatape',
        start: '2026-06-15',
        end: '2026-06-15',
        location_id: 2,
      },
      {
        latitude: 6.557737809426697,
        longitude: -75.82951255020984,
        order: 3,
        name: 'Santa Fe de Antioquia',
        totals: {
          stories: 1,
          posts: 0,
          photos360: 0,
          videos: 0,
          shorts: 0,
          maps: 0,
        },
        mapZoom: 11,
        total: 1,
        slug: 'santa-fe-de-antioquia',
        start: '2026-06-16',
        end: '2026-06-16',
        location_id: 3,
      },
    ],
    is_compilation: true,
    mapZoom: 11,
    slug: 'colombia',
    latitude: -10.414087014470486,
    total: 5,
    order: 28,
    totals: {
      stories: 5,
      posts: 0,
      photos360: 0,
      videos: 0,
      shorts: 0,
      maps: 0,
    },
    longitude: -75.41090585580099,
    iso: 'CO',
  },
];

citiesData = countriesData.flatMap((country) => country.cities);

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

[...document.querySelector('[role=main]').children]
  .reverse()
  .map((item) => {
    const { country, city } = item.dataset;

    if (country) {
      lastCountry = country;
    }

    if (city) {
      lastCity = city;
    }

    const file = (item.querySelector('img') || item.querySelector('video')).src;
    const filePathSplit = file.split('/');

    const description =
      item.querySelector('._2pim') && item.querySelector('._2pim').textContent;

    const cityData = { ...citiesData.find((data) => data.slug === lastCity) };
    const { city_location_id } = cityData;
    delete cityData.city_location_id;

    const countryData = {
      ...countriesData.find((data) => data.slug === lastCountry),
    };

    const cityPtHashtag = cityData.name_pt
      ? string_to_slug(cityData.name_pt).replaceAll('-', '')
      : lastCity;
    const countryPtHashtag = countryData.name_pt
      ? string_to_slug(countryData.name_pt).replaceAll('-', '')
      : lastCountry;

    return {
      file_location: file.replace('file://', ''),
      city: lastCity,
      country: lastCountry,
      original_file: filePathSplit[filePathSplit.length - 1],
      date: item.querySelector('._3-94').textContent,
      latitude: [...item.querySelectorAll('div')].find(
        (el) => el.textContent == 'Latitude',
      )?.nextElementSibling?.textContent,
      longitude: [...item.querySelectorAll('div')].find(
        (el) => el.textContent == 'Longitude',
      )?.nextElementSibling?.textContent,
      description,
      locations: [],
      hashtags: [
        string_to_slug(lastCity).replace('-2', ''),
        string_to_slug(lastCountry),
      ],
      hashtags_pt: [cityPtHashtag.replace('-2', ''), countryPtHashtag],
      city_location_id,
      cityData: {
        name: cityData.name,
        name_pt: cityData.name_pt || null,
        slug: cityData.slug,
        start: cityData.start,
        end: cityData.end,
        city_location_id: cityData.city_location_id,
      },
      countryData: {
        name: countryData.name,
        name_pt: countryData.name_pt || null,
        iso: countryData.iso,
        slug: countryData.slug,
      },
    };
  })
  .map((item) => {
    if (!cityCount[item.city]) {
      cityCount[item.city] = 1;
    }

    item.order = cityCount[item.city];

    cityCount[item.city]++;

    return item;
  });
