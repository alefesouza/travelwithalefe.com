lastCountry = null;
lastCity = null;

cityCount = {};

cityDatas = {
  'rome': {
    name: 'Rome',
    name_pt: 'Roma',
    slug: 'rome',
    start: '2025-02-08',
    end: '2025-02-11',
    city_location_id: 1,
  },
  ['vatican-city']: {
    name: 'Vatican City',
    name_pt: 'Cidade do Vaticano',
    slug: 'vatican-city',
    start: '2025-02-11',
    end: '2025-02-11',
    city_location_id: 2,
  },
  florence: {
    name: 'Florence',
    name_pt: 'Florença',
    slug: 'florence',
    start: '2025-02-13',
    end: '2025-02-13',
    city_location_id: 2,
  },
  ['san-marino']: {
    name: 'San Marino',
    slug: 'san-marino',
    start: '2025-02-14',
    end: '2025-02-14',
    city_location_id: 1,
  },
  siena: {
    name: 'Siena',
    slug: 'siena',
    start: '2025-02-15',
    end: '2025-02-15',
    city_location_id: 3,
  },
  'cinque-terre': {
    name: 'Cinque Terre',
    name_pt: 'Cinque Terre',
    slug: 'cinque-terre',
    start: '2025-02-16',
    end: '2025-02-16',
    city_location_id: 4,
  },
  'pisa': {
    name: 'Pisa',
    slug: 'pisa',
    start: '2025-02-16',
    end: '2025-02-16',
    city_location_id: 5,
  },
  'venice': {
    name: 'Venice',
    name_pt: 'Veneza',
    slug: 'venice',
    start: '2025-02-17',
    end: '2025-02-19',
    city_location_id: 6,
  },
  'lisbon-2': {
    name: 'Lisbon',
    name_pt: 'Lisboa',
    slug: 'lisbon-2',
    start: '2025-02-19',
    end: '2025-02-20',
    city_location_id: 1,
  },
};

// countryDatas = {
//   italy: {
//     name: 'Italy',
//     name_pt: 'Itália',
//     iso: 'IT',
//     slug: 'italy',
//   },
//   vatican: {
//     name: 'Vatican',
//     name_pt: 'Vaticano',
//     iso: 'VA',
//     slug: 'vatican',
//   },
//   ['san-marino']: {
//     name: 'San Marino',
//     iso: 'SM',
//     slug: 'san-marino',
//   },
//   portugal: {
//     name: 'Portugal',
//     iso: 'PT',
//     slug: 'portugal',
//   },
// };

// function string_to_slug(str) {
//   str = str.replace(/^\s+|\s+$/g, ''); // trim
//   str = str.toLowerCase();

//   // remove accents, swap ñ for n, etc
//   var from = 'àáäâãèéëêìíïîòóöôõùúüûñç·/_,:;';
//   var to = 'aaaaaeeeeiiiiooooõuuuunc------';
//   for (var i = 0, l = from.length; i < l; i++) {
//     str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
//   }

//   str = str
//     .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
//     .replace(/\s+/g, '-') // collapse whitespace and replace by -
//     .replace(/-+/g, '-'); // collapse dashes

//   return str;
// }

// [...document.querySelector('[role=main]').children].reverse()
//   .map((item) => {
//     const { country, city } = item.dataset;

//     if (country) {
//       lastCountry = country;
//     }

//     if (city) {
//       lastCity = city;
//     }

//     const file = (item.querySelector('img') || item.querySelector('video')).src;
//     const filePathSplit = file.split('/');

//     const description =
//       item.querySelector('._2pim') && item.querySelector('._2pim').textContent;

//     const cityData = { ...cityDatas[lastCity] };
//     const { city_location_id } = cityData;
//     delete cityData.city_location_id;

//     const countryData = { ...countryDatas[lastCountry] };

//     const cityPtHashtag = cityData.name_pt
//       ? string_to_slug(cityData.name_pt).replaceAll('-', '')
//       : lastCity;
//     const countryPtHashtag = countryData.name_pt
//       ? string_to_slug(countryData.name_pt).replaceAll('-', '')
//       : lastCountry;

//     return {
//       file_location: file.replace('file://', ''),
//       city: lastCity,
//       country: lastCountry,
//       original_file: filePathSplit[filePathSplit.length - 1],
//       date: item.querySelector('._3-94').textContent,
//       latitude: [...item.querySelectorAll('div')].find(
//         (el) => el.textContent == 'Latitude'
//       )?.nextElementSibling?.textContent,
//       longitude: [...item.querySelectorAll('div')].find(
//         (el) => el.textContent == 'Longitude'
//       )?.nextElementSibling?.textContent,
//       description,
//       description_pt: description,
//       locations: [],
//       hashtags: [string_to_slug(lastCity).replace('-2', ''), string_to_slug(lastCountry)],
//       hashtags_pt: [cityPtHashtag.replace('-2', ''), countryPtHashtag],
//       city_location_id,
//       cityData: cityData,
//       countryData: countryDatas[lastCountry],
//     };
//   })
//   .map((item) => {
//     if (!cityCount[item.city]) {
//       cityCount[item.city] = 1;
//     }

//     item.order = cityCount[item.city];

//     cityCount[item.city]++;

//     return item;
//   });

const fs = require('fs');
const items = require('./the-stories.json');
const sizeOf = require('image-size');
const sharp = require('sharp');
const mt = require('media-thumbnail');
const gm = require('gm');
const { getVideoDurationInSeconds } = require('get-video-duration');

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};

const imageMagick = gm.subClass({ imageMagick: true });

const storiesLocations = {};

const main = async () => {
  for (const item of items) {
    if (!fs.existsSync('./to_send/' + item.country + '/' + item.city)) {
      fs.mkdirSync('./to_send/' + item.country + '/' + item.city, {
        recursive: true,
      });
    }

    if (!fs.existsSync('./to_send/500/' + item.country + '/' + item.city)) {
      fs.mkdirSync('./to_send/500/' + item.country + '/' + item.city, {
        recursive: true,
      });
    }

    if (
      !fs.existsSync('./to_send/portrait/' + item.country + '/' + item.city)
    ) {
      fs.mkdirSync('./to_send/portrait/' + item.country + '/' + item.city, {
        recursive: true,
      });
    }

    if (
      !fs.existsSync('./to_send/landscape/' + item.country + '/' + item.city)
    ) {
      fs.mkdirSync('./to_send/landscape/' + item.country + '/' + item.city, {
        recursive: true,
      });
    }

    if (!fs.existsSync('./to_send/square/' + item.country + '/' + item.city)) {
      fs.mkdirSync('./to_send/square/' + item.country + '/' + item.city, {
        recursive: true,
      });
    }

    if (!storiesLocations[item.city]) {
      storiesLocations[item.city] = 0;
    }

    storiesLocations[item.city]++;

    item.id = item.city + '-story-' + storiesLocations[item.city];
    item.order = parseInt(storiesLocations[item.city]);
    item.mode = 'portrait';

    const date = new Date(item.date);
    item.date = date.toISOString().replace('T', ' ').substring(0, 19);

    item.file = item.file_location;

    if (item.file.includes('.mp4') || !item.file.substring(2).includes('.')) {
      item.width = 720;
      item.height = 1280;
    } else {
      const dimensions = sizeOf(item.file);

      item.width = dimensions.width;
      item.height = dimensions.height;
    }
    item.mode = 'portrait';
    item.type = 'story';

    const fileToSend =
      './to_send/' +
      item.country +
      '/' +
      item.city +
      '/' +
      item.id +
      (item.file.includes('.mp4') || !item.file.substring(2).includes('.')
        ? '.mp4'
        : '.jpg');

    fs.copyFileSync(item.file, fileToSend);

    if (item.file.includes('.mp4') || !item.file.substring(2).includes('.')) {
      console.log(fileToSend);
      await mt.forVideo(fileToSend, fileToSend.replace('.mp4', '-thumb.png'), {
        width: 720,
      });

      const duration = await getVideoDurationInSeconds(item.file);
      item.duration = duration;
    }

    sharp(fileToSend.replace('.mp4', '-thumb.png'))
      .rotate()
      .resize(500)
      .jpeg({ mozjpeg: true })
      .toFile(
        fileToSend
          .replace('.mp4', '-thumb.png')
          .replace('/to_send/', '/to_send/500/'),
        (err, info) => {
          console.log(err);
        }
      );

    imageMagick(fileToSend.replace('.mp4', '-thumb.png'))
      .crop(
        item.width,
        item.width * 0.75,
        0,
        item.height / 2 - (item.width * 0.75) / 2
      )
      .write(
        fileToSend
          .replace('.mp4', '-thumb.png')
          .replace('/to_send/', '/to_send/landscape/'),
        function (err) {
          if (err) {
            console.log(err);
            return;
          }
        }
      );

    imageMagick(fileToSend.replace('.mp4', '-thumb.png'))
      .crop(
        item.width,
        item.width * 1.25,
        0,
        item.height / 2 - (item.width * 1.25) / 2
      )
      .write(
        fileToSend
          .replace('.mp4', '-thumb.png')
          .replace('/to_send/', '/to_send/portrait/'),
        function (err) {
          if (err) {
            console.log(err);
            return;
          }
        }
      );

    imageMagick(fileToSend.replace('.mp4', '-thumb.png'))
      .crop(item.width, item.width, 0, (item.height - item.width) / 2)
      .write(
        fileToSend
          .replace('.mp4', '-thumb.png')
          .replace('/to_send/', '/to_send/square/'),
        function (err) {
          if (err) {
            console.log(err);
            return;
          }
        }
      );

    item.file =
      '/stories/' +
      item.country +
      '/' +
      item.city +
      '/' +
      item.id +
      (item.file.includes('.mp4') || !item.file.substring(2).includes('.')
        ? '.mp4'
        : '.jpg');

    delete item.file_location;

    console.log(item.file);
  }

  fs.writeFileSync('./the-result.json', JSON.stringify(items, null, 4));
};

main();
