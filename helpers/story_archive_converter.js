lastCountry = null;
lastCity = null;

cityCount = {};

countriesData = [
  {
    flag: '🇵🇪',
    name: 'Peru',
    cities: [
      {
        latitude: 43.94378600109645,
        order: 1,
        name: 'Cusco',
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
        slug: 'cusco',
        longitude: 12.46362395581862,
        start: '2025-11-13',
        end: '2025-11-13',
        location_id: 1,
      },
      {
        latitude: -13.16081127358846,
        order: 2,
        name: 'Machu Picchu',
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
        slug: 'machu-picchu',
        longitude: -72.53450524644396,
        start: '2025-11-14',
        end: '2025-11-14',
        location_id: 2,
      },
      {
        latitude: -12.88907261920566,
        order: 3,
        name: 'Paracas',
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
        slug: 'paracas',
        longitude: -76.51049334904432,
        start: '2025-11-16',
        end: '2025-11-16',
        location_id: 3,
      },
      {
        latitude: -13.931488954214142,
        order: 1,
        name: 'Huacachina',
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
        slug: 'huacachina',
        longitude: -75.95099489314188,
        start: '2025-11-16',
        end: '2025-11-16',
        location_id: 4,
      },
      {
        latitude: -12.077088093031504,
        order: 5,
        name: 'Lima',
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
        slug: 'lima',
        longitude: -76.99631424725956,
        start: '2025-11-15',
        end: '2025-11-22',
        location_id: 5,
      },
    ],
    is_compilation: true,
    mapZoom: 11,
    slug: 'peru',
    latitude: -10.414087014470486,
    total: 5,
    order: 27,
    totals: {
      stories: 5,
      posts: 0,
      photos360: 0,
      videos: 0,
      shorts: 0,
      maps: 0,
    },
    longitude: -75.41090585580099,
    iso: 'PE',
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
        (el) => el.textContent == 'Latitude'
      )?.nextElementSibling?.textContent,
      longitude: [...item.querySelectorAll('div')].find(
        (el) => el.textContent == 'Longitude'
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
