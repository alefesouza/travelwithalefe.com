// fixedLat = [...$0.children].map((item) => ({ file: (item.querySelector('img')||item.querySelector('video')).src, date: item.querySelector('._3-94').textContent, latitude: [...item.querySelectorAll('div')].find(el => el.textContent == 'Latitude')?.nextElementSibling?.textContent, longitude: [...item.querySelectorAll('div')].find(el => el.textContent == 'Longitude')?.nextElementSibling?.textContent, description: item.querySelector('._2pim') && item.querySelector('._2pim').textContent }))

// let items = [];

// document.querySelectorAll('img,video').forEach(m => {
//     m.onclick = function(e) {
//         e.preventDefault();

//         const hashtags = prompt('Hashtags');
//         const location = prompt('Location');
//         const description = prompt('Description');

//         items.push({
//             original_file: m.src,
//             location,
//             hashtags,
//             description,
//             city,
//         })
//     }
// })

// items = brussels.split('\n----\n').map((i) => {
//   let [location, hashtags, newHashtags] = i.split('\n');
//   const [thePlace, alternativeLocations] = location.split(' $ ');
//   const theAlternativeLocations = alternativeLocations?.split(' € ');

//   return { location: thePlace, alternative_names: theAlternativeLocations, hashtags, newHashtags };
// }).reverse()

// temp1.map((c, i) => ({...c, ...items[i]}))

// const stories = require('./the-stories.json');
// const fixed = require('./fixedLat.json');

// const fs = require('fs');

// stories.forEach((c) => {
//   const lt = fixed.find((f) => f.file.includes(c.original_file.split('.')[0]));
//   if (!lt) {
//     return;
//   }
//   c.latitude = lt.latitude;
//   c.longitude = lt.longitude;
//   c.date = lt.date;
//   c.description = lt.description;
//   const split = c.original_file.split('/');
//   const file = split[split.length - 1];

//   c.original_file = file;
//   c.file = file;
// });

// fs.writeFileSync('./test.json', JSON.stringify(stories, null, 4));

const fs = require('fs');
const items = require('./test.json');
const sizeOf = require('image-size');
const sharp = require('sharp');
const mt = require('media-thumbnail');
const gm = require('gm');
const { getVideoDurationInSeconds } = require('get-video-duration');

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};

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
    console.log(item.date, date);
    item.date = date.toISOString().replace('T', ' ').substring(0, 19);

    let file = './stories/' + item.country + '/' + item.city + '/' + item.file;

    if (!fs.existsSync(file)) {
      file = './stories/' + item.original_file;
    }

    item.file = file;

    if (item.file.includes('.mp4') || !item.file.substring(2).includes('.')) {
      item.width = 720;
      item.height = 1280;
    } else {
      const dimensions = sizeOf(file);

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

    fs.copyFileSync(file, fileToSend);

    if (item.file.includes('.mp4') || !item.file.substring(2).includes('.')) {
      await mt.forVideo(fileToSend, fileToSend.replace('.mp4', '-thumb.png'), {
        width: 720,
      });

      const duration = await getVideoDurationInSeconds(file);
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
    console.log(item.file);
    item.hashtags = [
      ...(item?.hashtags?.split(' ') || []),
      ...(item?.newHashtags?.split(` / `) || []),
    ].join(' ');

    if (item.location) {
      const [name, namePt] = item.location.split(' / ');

      item.location_data = [
        {
          name: name,
          slug: string_to_slug(name),
          latitude: item.latitude,
          longitude: item.longitude,
          country: item.country,
          city: item.city,
        },
      ];

      if (namePt) {
        item.location_data.name_pt = namePt;
      }

      if (item.alternative_names) {
        item.location_data.alternative_names = item.alternative_names;
      }

      item.locations = [item.location_data[0].slug];

      delete item.latitude;
      delete item.latitute;
      delete item.longitude;
      delete item.alternative_names;
    }
  }

  fs.writeFileSync('./the-result.json', JSON.stringify(items, null, 4));
  fs.writeFileSync(
    './the-locations.json',
    JSON.stringify(
      items.filter((c) => c.location_data).flatMap((c) => c.location_data),
      null,
      4
    )
  );
};

main();

// items.forEach((data, i) => {

//   if (!data.hashtags) {
//       return;
//   }

//   let en = null;
//   let pt = null;

//   if (data.newHashtags) {
//       [en, pt] = data.newHashtags.split(' / ')
//   }

//   data.hashtags = data.hashtags.split(' ');

//   data.hashtags = [data.city, data.country,data.locations ? data.locations[0].replaceAll('-', '') : null, ...data.hashtags].filter(c => c);

// theBatch.update(doc(db, '/countries/' + data.country + '/medias/' + data.id), {
// hashtags: data.hashtags.filter(c => c !== pt),
// hashtags_pt: [...data.hashtags].filter(c => c !== en).map(c => {
// const hash = allHashtags.find(d => d.name == c);
// console.log(hash)
// if (hash && hash.name_pt) {
//   return hash.name_pt;
// }
// return c;
// }),
// }, {merge: true})
// });
