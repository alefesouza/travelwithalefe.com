const cities = countries.find((c) => c.slug === 'united-states').cities;
const lastCity = cities[cities.length - 1];

const newCities = [
  {
    name: 'Los Angeles',
    slug: 'los-angeles',
    start: '2025-05-25',
    end: '2025-05-31',
    location_id: 9,
    latitude: 43.12618001137168,
    order: 9,
    totals: {
      stories: 30,
      posts: 1,
      photos360: 0,
      videos: 0,
      shorts: 0,
      maps: 0,
    },
    total: 31,
    mapZoom: 12,
    longitude: -72.39704516887943,
  },
  {
    name: 'Road Trip Los Angeles - Salt Lake City',
    slug: 'road-trip-lax-slc',
    start: '2025-05-31',
    end: '2025-06-05',
    location_id: 10,
    latitude: 43.12618001137168,
    order: 10,
    totals: {
      stories: 30,
      posts: 1,
      photos360: 0,
      videos: 0,
      shorts: 0,
      maps: 0,
    },
    total: 31,
    mapZoom: 12,
    longitude: -72.39704516887943,
  },
  {
    name: 'Grand Canyon',
    slug: 'grand-canyon',
    start: '2025-06-01',
    end: '2025-06-03',
    location_id: 11,
    latitude: 43.12618001137168,
    order: 12,
    totals: {
      stories: 30,
      posts: 1,
      photos360: 0,
      videos: 0,
      shorts: 0,
      maps: 0,
    },
    total: 31,
    mapZoom: 12,
    longitude: -72.39704516887943,
  },
  {
    name: 'Salt Lake City',
    slug: 'salt-lake-city',
    start: '2025-06-05',
    end: '2025-06-07',
    location_id: 12,
    latitude: 43.12618001137168,
    order: 12,
    totals: {
      stories: 30,
      posts: 1,
      photos360: 0,
      videos: 0,
      shorts: 0,
      maps: 0,
    },
    total: 31,
    mapZoom: 12,
    longitude: -72.39704516887943,
  },
];

const allCities = [...cities, ...newCities];

theBatch.update(doc(db, 'countries', 'united-states'), {
  cities: allCities,
});

theBatch.commit();
