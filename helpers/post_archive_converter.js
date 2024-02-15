// fixedLat = [...$0.children].map((item) => ({
//   files: [...item.querySelectorAll('img,video')].map((f) => f.src),
//   date: item.querySelector('._3-94').textContent,
//   latitude: [...item.querySelectorAll('div')].find(
//     (el) => el.textContent == 'Latitude'
//   )?.nextElementSibling?.textContent,
//   longitude: [...item.querySelectorAll('div')].find(
//     (el) => el.textContent == 'Longitude'
//   )?.nextElementSibling?.textContent,
//   description:
//     item.querySelector('._2pim') && item.querySelector('._2pim').textContent,
// }));

const items = require('./fixedLat.json');
const fs = require('fs');
const { getVideoDurationInSeconds } = require('get-video-duration');
const sizeOf = require('image-size');
const sharp = require('sharp');
const { translate } = require('bing-translate-api');
const mt = require('media-thumbnail');
const getDimensions = require('get-video-dimensions');

const posts = [
  {
    link: 'https://www.instagram.com/p/C3Vqf67uz-2/',
    city: 'london',
    country: 'united-kingdom',
  },
  {
    link: 'https://www.instagram.com/p/C3S5tPCu0Xb/',
    city: 'brussels',
    country: 'belgium',
  },
  {
    link: 'https://www.instagram.com/p/C3QRv3AumD8/',
    city: 'luxembourg',
    country: 'luxembourg',
  },
  {
    link: 'https://www.instagram.com/p/C3N568XuV6G/',
    city: 'paris',
    country: 'france',
  },
  {
    link: 'https://www.instagram.com/p/C3N5DL1Onmh/',
    city: 'paris',
    country: 'france',
  },
  {
    link: 'https://www.instagram.com/p/C2-ZseqOQAb/',
    city: 'ushuaia',
    country: 'argentina',
  },
  {
    link: 'https://www.instagram.com/p/C2-YZz_OAfJ/',
    city: 'ushuaia',
    country: 'argentina',
  },
  {
    link: 'https://www.instagram.com/p/C27nbnjuob1/',
    city: 'buenos-aires',
    country: 'argentina',
  },
  {
    link: 'https://www.instagram.com/p/C27loGpuO-c/',
    city: 'salta',
    country: 'argentina',
  },
  {
    link: 'https://www.instagram.com/p/C25MJUruqrg/',
    city: 'foz-do-iguacu',
    country: 'brazil',
  },
  {
    link: 'https://www.instagram.com/p/C25KtUOuqqD/',
    city: 'puerto-iguazu',
    country: 'argentina',
  },
  {
    link: 'https://www.instagram.com/p/C25KAdQuXwi/',
    city: 'foz-do-iguacu',
    country: 'brazil',
  },
  {
    link: 'https://www.instagram.com/p/C25JNAluYGd/',
    city: 'puerto-iguazu',
    country: 'argentina',
  },
];

items.reverse();
posts.reverse();

const storiesLocations = {};

const main = async () => {
  let i = 0;

  for (const item of items) {
    item.files = item.files.map((f) => {
      const split = f.split('/');
      const file = split[split.length - 1];

      return file;
    });

    const city = posts[i].city;
    const country = posts[i].country;

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
    item.city_index = order;
    item.country_index = order;
    item.link = posts[i].link;
    item.type = 'post';

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

    const photosFolder = './posts';
    const destFolder = `./to_send/${country}/${city}`;

    const fileName = `${item.id}.jpg`;
    item.file = `/medias/${country}/${city}/${fileName}`;

    if (!isVideo) {
      const fileToSend = destFolder + '/' + fileName;
      fs.copyFileSync(photosFolder + '/' + item.original_file, fileToSend);

      const dimensions = sizeOf(fileToSend);

      item.width = dimensions.width;
      item.height = dimensions.height;

      sharp(fileToSend)
        .rotate()
        .resize(500)
        .jpeg({ mozjpeg: true })
        .toFile(destFolder + '/500/' + fileName, (err, info) => {
          // console.log(err);
        });
    } else {
      console.log('Video: ' + item.id);
    }

    if (item.files.length > 1) {
      const promises = item.files
        .slice(isVideo ? 0 : 1, item.files.length)
        .map(async (file, i) => {
          const isVideo = !file.includes('.jpg');
          const fileName = `${item.id}-${i + 2}${isVideo ? '.mp4' : '.jpg'}`;
          const fileToSend = destFolder + '/' + fileName;
          fs.copyFileSync(photosFolder + '/' + file, fileToSend);

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
              destFolder + '/500/' + fileName.replace('.mp4', '-thumb.png'),
              (err, info) => {
                // console.log(err);
              }
            );

          return data;
        });

      item.gallery = await Promise.all(promises);
    }

    const [theDescription, hashtags] = item.description.split('\n.\n.\n.\n');
    item.description = theDescription;
    item.hashtags = hashtags.split(' #');

    // const description = await translate(item.description_pt, 'en', 'pt');

    // item.description_pt = description.translation;
    // console.log(item.description);

    delete item.files;

    i++;
  }

  fs.writeFileSync('medias.json', JSON.stringify(items, null, 4));
};

main();
