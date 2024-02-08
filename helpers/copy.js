const museums = doc(
  db,
  '/countries/france/cities/paris/medias/paris-youtube-2'
);
const theDoc = await getDoc(museums);
const data = theDoc.data();

const theCountry = 'united-kingdom';
const theCity = 'london';
const theLocations = [
  'big-ben',
  'london-eye',
  'millennium-bridge',
  'the-shard-london',
  'tower-bridge',
];
const theItem = 3;

const country = countries.find((c) => c.slug === theCountry);
const city = country.cities.find((c) => c.slug === theCity);
const places = theLocations.map((l) =>
  locations.find((c) => c.slug === l && c.city === theCity)
);

delete data.old_hashtags;
delete data.old_hashtags2;
delete data.old_hashtags_pt2;
delete data.locationData;
delete data.createdAt;
delete data.image;

const newItem = {
  ...data,
  country: theCountry,
  city: theCity,
  cityData: {
    end: city.end,
    name: city.name,
    name_pt: city.name_pt || null,
    slug: city.slug,
  },
  countryData: {
    iso: country.iso,
    name: country.name,
    name_pt: country.name_pt || null,
    slug: country.slug,
  },
  city_location_id: city.location_id,
  date: '2023-11-28 15:00:00',
  id: theCity + '-' + data.type + '-' + theItem,
  previous:
    theItem - 1 !== 0 ? theCity + '-' + data.type + '-' + (theItem - 1) : null,
  next: theCity + '-' + data.type + '-' + (theItem + 1),
  hashtags:
    '#unitedkingdom #london #england #bigben #londoneye #millenniumbridge #theshardlondon #towerbridge #360video #insta360 #insta360x3 #cruise'
      .replaceAll('#', '')
      .split(' '),
  hashtags_pt:
    '#reinounido #londres #inglaterra #bigben #londoneye #millenniumbridge #theshardlondon #towerbridge #video360 #insta360 #insta360x3 #cruzeiro'
      .replaceAll('#', '')
      .split(' '),
  link: 'https://www.youtube.com/watch?v=NsGa-3cLdqQ',
  image: 'https://img.youtube.com/vi/NsGa-3cLdqQ/0.jpg',
  original_id: 'NsGa-3cLdqQ',
  title: 'River Thames Cruise - 360 Video',
  title_pt: 'Andando por Londres - Dia 2 - Vídeo 360',
  description:
    '360 video of the River Thames cruise in London, United Kingdom.',
  description_pt:
    'Vídeo 360 do cruzeiro do Rio Thames em Londres, Reino Unido.',
  order: theItem,
  locations: theLocations,
  location_data: places,
};

console.log(newItem);

theBatch.set(
  doc(
    db,
    '/countries/' + theCountry + '/cities/' + theCity + '/medias/' + newItem.id
  ),
  newItem
);

theBatch.commit();
