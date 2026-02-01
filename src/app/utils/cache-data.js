import countries from './countries';

const cachedCountries = countries.map((country) => country.slug);
const cachedCities = countries.flatMap((country) =>
  country.cities ? country.cities.map((city) => city.slug) : [],
);
const cachedCoupons = [
  '99food',
  'airalo',
  'aliexpress',
  'binance',
  'bounce',
  'daki',
  'holafly',
  'insider',
  'kwai',
  'letyshops',
  'meliuz',
  'nomad',
  'tiktok',
  'tudoazul',
  'turbi',
  'uber',
  'vivo-easy',
];

export { cachedCountries, cachedCities, cachedCoupons };
