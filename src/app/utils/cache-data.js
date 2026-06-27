import countries from './countries';

const cachedCountries = countries.map((country) => country.slug);
const cachedCities = countries.flatMap((country) =>
  country.cities ? country.cities.map((city) => city.slug) : [],
);
const cachedCoupons = [
  'airalo',
  'aliexpress',
  'binance',
  'bounce',
  'daki',
  'holafly',
  'insider',
  'inter-duo-gourmet',
  'keeta',
  'letyshops',
  'meliuz',
  'nomad',
  'tudoazul',
  'turbi',
  'uber',
  'vivo-easy',
];

export { cachedCountries, cachedCities, cachedCoupons };
