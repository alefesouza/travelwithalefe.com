// lastCountry = null;
// lastCity = null;

// cityCount = {};

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

// [...document.querySelector('[role=main]').children]
//   .map((item) => {
//     const file = (item.querySelector('img') || item.querySelector('video')).src;
//     const filePathSplit = file.split('/');

//     const description =
//       item.querySelector('._2pim') && item.querySelector('._2pim').textContent;

//     const gallery = [...item.querySelectorAll('img, video')];
//     gallery.shift();

//     return {
//       file_location: file.replace('file://', ''),
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
//       hashtags: item,
//       hashtags_pt: [],
//       countryData: countryDatas[lastCountry],
//       cityData: cityDatas[lastCity],
//       gallery: gallery.map((media) => ({
//         file_location: media.src.replace('file://', ''),
//         file_type: media.tagName === 'IMG' ? 'image' : 'video',
//       })),
//     };
//   });
// lastCountry = null;
// lastCity = null;

// cityCount = {};

// cityDatas = {
//   'rio-de-janeiro': {
//     name: 'Rio de Janeiro',
//     slug: 'rio-de-janeiro',
//     end: '2024-08-19',
//     city_location_id: 14,
//   },
//   tulum: {
//     name: 'Tulum',
//     slug: 'tulum',
//     end: '2024-10-13',
//     city_location_id: 2,
//   },
//   havana: {
//     name: 'Havana',
//     slug: 'havana',
//     end: '2024-10-18',
//     city_location_id: 1,
//   },
//   'san-salvador': {
//     name: 'San Salvador',
//     slug: 'san-salvador',
//     end: '2024-10-30',
//     city_location_id: 1,
//   },
//   'antigua-guatemala': {
//     name: 'Antigua Guatemala',
//     slug: 'antigua-guatemala',
//     end: '2024-10-24',
//     city_location_id: 1,
//   },
//   panajachel: {
//     name: 'Panajachel',
//     slug: 'panajachel',
//     end: '2024-10-22',
//     city_location_id: 2,
//   },
//   'guatemala-city': {
//     name: 'Guatemala City',
//     slug: 'guatemala-city',
//     end: '2024-10-26',
//     city_location_id: 3,
//   },
// };

// countryDatas = {
//   mexico: {
//     name: 'Mexico',
//     name_pt: 'México',
//     iso: 'MX',
//     slug: 'mexico',
//   },
//   brazil: {
//     name: 'Brazil',
//     name_pt: 'Brasil',
//     iso: 'BR',
//     slug: 'brazil',
//   },
//   cuba: {
//     name: 'Cuba',
//     iso: 'CU',
//     slug: 'cuba',
//   },
//   'el-salvador': {
//     name: 'El Salvador',
//     iso: 'SV',
//     slug: 'el-salvador',
//   },
//   guatemala: {
//     name: 'Guatemala',
//     iso: 'GT',
//     slug: 'guatemala',
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

// [...document.querySelector('[role=main]').children]
//   .map((item) => {
//     const file = (item.querySelector('img') || item.querySelector('video')).src;
//     const filePathSplit = file.split('/');

//     const descriptionElement =
//       item.querySelector('._2pim') && item.querySelector('._2pim').textContent;

//       if (!descriptionElement) {
//         return;
//       }

//     const [description, hashtags] = descriptionElement.split('\n.\n.\n.\n');

//     return {
//       file_location: file.replace('file://', ''),
//       original_file: filePathSplit[filePathSplit.length - 1],
//       date: item.querySelector('._3-94').textContent,
//       latitude: [...item.querySelectorAll('div')].find(
//         (el) => el.textContent == 'Latitude'
//       )?.nextElementSibling?.textContent,
//       longitude: [...item.querySelectorAll('div')].find(
//         (el) => el.textContent == 'Longitude'
//       )?.nextElementSibling?.textContent,
//       description,
//       locations: [],
//       hashtags: hashtags.split('#').map((h) => h.trim()).filter(h => h),
//       hashtags_pt: [],
//       countryData: countryDatas[lastCountry],
//       cityData: cityDatas[lastCity],
//       files: [...item.querySelectorAll('img, video')].map(m => m.src.replace('file://', '')),
//     };
//   }).filter(h => h);

// [...$0.querySelectorAll('[role="link"]')].map(item => ({link: item.href}))

cityDatas = {
  'rio-de-janeiro': {
    name: 'Rio de Janeiro',
    slug: 'rio-de-janeiro',
    end: '2024-08-19',
    city_location_id: 14,
  },
  kingston: {
    name: 'Kingston',
    slug: 'kingston',
    end: '2024-05-17',
    city_location_id: 1,
  },
  'san-juan': {
    name: 'San Juan',
    slug: 'san-juan',
    end: '2024-05-11',
    city_location_id: 1,
  },
  'santo-domingo': {
    name: 'Santo Domingo',
    slug: 'santo-domingo',
    end: '2024-05-22',
    city_location_id: 1,
  },
  'punta-cana': {
    name: 'Punta Cana',
    slug: 'punta-cana',
    end: '2024-05-25',
    city_location_id: 2,
  },
  alstead: {
    name: 'Alstead',
    slug: 'alstead',
    end: '2024-05-08',
    city_location_id: 8,
  },
  montreal: {
    name: 'Montreal',
    slug: 'montreal',
    end: '2024-05-05',
    city_location_id: 2,
  },
  tulum: {
    name: 'Tulum',
    slug: 'tulum',
    end: '2024-10-13',
    city_location_id: 2,
  },
  havana: {
    name: 'Havana',
    slug: 'havana',
    end: '2024-10-18',
    city_location_id: 1,
  },
  'san-salvador': {
    name: 'San Salvador',
    slug: 'san-salvador',
    end: '2024-10-30',
    city_location_id: 1,
  },
  'antigua-guatemala': {
    name: 'Antigua Guatemala',
    slug: 'antigua-guatemala',
    end: '2024-10-24',
    city_location_id: 1,
  },
  panajachel: {
    name: 'Panajachel',
    slug: 'panajachel',
    end: '2024-10-22',
    city_location_id: 2,
  },
  'guatemala-city': {
    name: 'Guatemala City',
    slug: 'guatemala-city',
    end: '2024-10-26',
    city_location_id: 3,
  },
};

countryDatas = {
  mexico: {
    name: 'Mexico',
    name_pt: 'México',
    iso: 'MX',
    slug: 'mexico',
  },
  brazil: {
    name: 'Brazil',
    name_pt: 'Brasil',
    iso: 'BR',
    slug: 'brazil',
  },
  'united-states': {
    name: 'United States',
    name_pt: 'Estados Unidos',
    iso: 'US',
    slug: 'united-states',
  },
  canada: {
    name: 'Canada',
    name_pt: 'Canadá',
    iso: 'CA',
    slug: 'canada',
  },
  'puerto-rico': {
    name: 'Puerto Rico',
    iso: 'PR',
    slug: 'united-states',
  },
  cuba: {
    name: 'Cuba',
    iso: 'CU',
    slug: 'cuba',
  },
  jamaica: {
    name: 'Jamaica',
    iso: 'JM',
    slug: 'jamaica',
  },
  'el-salvador': {
    name: 'El Salvador',
    iso: 'SV',
    slug: 'el-salvador',
  },
  guatemala: {
    name: 'Guatemala',
    iso: 'GT',
    slug: 'guatemala',
  },
};

let items = require('./the-posts.json');
const links = require('./the-links.json');
const fs = require('fs');
const { getVideoDurationInSeconds } = require('get-video-duration');
const sizeOf = require('image-size');
const sharp = require('sharp');
const mt = require('media-thumbnail');
const getDimensions = require('get-video-dimensions');

items.reverse();
links.reverse();

const storiesLocations = {};

const main = async () => {
  let i = 0;

  for (const item of items) {
    const city = links[i].city;
    const country = links[i].country;

    if (!storiesLocations[city]) {
      storiesLocations[city] = 0;
    }

    storiesLocations[city]++;

    const order = storiesLocations[city];

    const id = city + '-post-' + order;

    item.original_file = item.files[0];
    item.id = id;
    item.order = order;
    item.city = city;
    item.country = country;
    item.city_index = order - 1;
    item.country_index = order - 1;
    item.link = links[i].link;
    item.type = 'post';

    item.cityData = cityDatas[city];
    item.countryData = countryDatas[country];

    const postLink = links[i].link.split('/');
    postLink.pop();
    const originalId = postLink[postLink.length - 1];
    item.original_id = originalId;

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

    const isVideo = !item.original_file.includes('.jpg');

    const destFolder = `./to_send/${country}/${city}`;

    const fileName = `${item.id}.jpg`;
    item.file = `/medias/${country}/${city}/${fileName}`;

    if (!isVideo) {
      const fileToSend = destFolder + '/' + fileName;
      fs.copyFileSync(item.files[0], fileToSend);

      const dimensions = sizeOf(fileToSend);

      item.width = dimensions.width;
      item.height = dimensions.height;

      sharp(fileToSend)
        .rotate()
        .resize(500)
        .jpeg({ mozjpeg: true })
        .toFile(`./to_send/500/${country}/${city}/` + fileName, (err, info) => {
          console.log(err);
        });
    } else {
      console.log('Video: ' + item.id, item);
    }

    if (item.files.length > 1) {
      const promises = item.files
        .slice(isVideo ? 0 : 1, item.files.length)
        .map(async (file, i) => {
          const isVideo = !file.includes('.jpg');
          const fileName = `${item.id}-${i + 2}${isVideo ? '.mp4' : '.jpg'}`;
          const fileToSend = destFolder + '/' + fileName;
          fs.copyFileSync(file, fileToSend);

          const data = {
            file: `/medias/${country}/${city}/${fileName}`,
            file_type: isVideo ? 'video' : 'image',
          };

          if (isVideo) {
            const duration = await getVideoDurationInSeconds(fileToSend);
            data.duration = duration;

            const dimensions = await getDimensions(fileToSend);
            await mt.forVideo(
              fileToSend,
              fileToSend.replace('.mp4', '-thumb.png'),
              {
                width: dimensions.width,
              }
            );
          }

          sharp(fileToSend.replace('.mp4', '-thumb.png'))
            .rotate()
            .resize(500)
            .jpeg({ mozjpeg: true })
            .toFile(
              `./to_send/500/${country}/${city}/` +
                fileName.replace('.mp4', '-thumb.png'),
              (err, info) => {
                console.log(err);
              }
            );

          return data;
        });

      item.gallery = await Promise.all(promises);
    }

    // const description = await translate(item.description_pt, 'en', 'pt');

    // item.description_pt = description.translation;
    // console.log(item.description);

    delete item.files;

    i++;
  }

  fs.writeFileSync('the-result.json', JSON.stringify(items, null, 4));
};

main();
