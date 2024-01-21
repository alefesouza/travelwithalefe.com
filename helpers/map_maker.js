const sharp = require('sharp');
const { resolve } = require('path');
const { readdir } = require('fs').promises;
const fs = require('fs');
const mt = require('media-thumbnail');
const getDimensions = require('get-video-dimensions');
const { getVideoDurationInSeconds } = require('get-video-duration');
const sizeOf = require('image-size');
const convert = require('heic-convert');
const { promisify } = require('util');
const ExifReader = require('exifreader');
const cp = require('child_process');

async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

const cities = {
  seoul: 33,
};

let items = [];

(async () => {
  const files = [];
  const allFiles = [];

  for await (const f of getFiles('./done/south-korea/seoul')) {
    if (f.includes('.DS_Store')) {
      continue;
    }

    allFiles.push(f.toLowerCase());
  }

  for await (const f of getFiles('./done/south-korea/seoul')) {
    if (f.includes('.DS_Store')) {
      continue;
    }

    if (!f.includes('.MP4')) {
      if (
        f.toLowerCase().includes('.heic') &&
        !allFiles.find(
          (a) =>
            a.includes(f.toLowerCase().replace('.heic', '.jpg')) ||
            a.includes(f.toLowerCase().replace('.heic', '.jpeg'))
        )
      ) {
        files.push(f);
      }

      if (
        f.toLowerCase().includes('.jpg') ||
        f.toLowerCase().includes('.jpeg') ||
        f.toLowerCase().includes('.mov')
      ) {
        files.push(f);
      }
    }

    if (
      f.includes('.MP4') &&
      !allFiles.find((a) =>
        a.includes(f.toLowerCase().replace('.mp4', '.heic'))
      )
    ) {
      console.log(f);
      files.push(f);
    }

    // if (f.toLowerCase().includes('.mov')) {
    //   const split = f.split('/');

    //   const city = split[7];
    //   const country = split[6];
    //   const location = split[8];

    //   if (!fs.existsSync('./mp4s/' + country)) {
    //     fs.mkdirSync('./mp4s/' + country);
    //   }

    //   if (!fs.existsSync('./mp4s/' + country + '/' + city)) {
    //     fs.mkdirSync('./mp4s/' + country + '/' + city);
    //   }

    //   if (!fs.existsSync('./mp4s/' + country + '/' + city + '/' + location)) {
    //     fs.mkdirSync('./mp4s/' + country + '/' + city + '/' + location);
    //   }

    //   const command = `ffmpeg -i "${f}" "${f
    //     .replace('done', 'mp4s')
    //     .replace('.mov', '.mp4')
    //     .replace('.MOV', '.mp4')}"`;
    //   console.log(command);
    //   const childInfo = cp.spawnSync(command, {
    //     stdio: 'ignore',
    //     shell: true,
    //     env: process.env,
    //   });

    //   if (childInfo.status !== 0) {
    //     throw new Error(
    //       `Video converted failed with error code ${childInfo.status}`
    //     );
    //   }
    // }
  }

  files.sort((a, b) => {
    const splitA = a.split('/');
    const fileA = splitA[9];
    const splitB = b.split('/');
    const fileB = splitB[9];

    return fileA.localeCompare(fileB);
  });

  for await (let f of files) {
    if (f.includes('.DS_Store')) {
      continue;
    }

    if (f.toLowerCase().includes('.mov')) {
      f = f
        .replace('done', 'mp4s')
        .replace('.mov', '.mp4')
        .replace('.MOV', '.mp4');
    }

    const split = f.split('/');

    const city = split[7];
    const country = split[6];
    const location = split[8];
    const file = split[9].toLowerCase();

    if (!fs.existsSync('./to_send/' + country)) {
      fs.mkdirSync('./to_send/' + country);
    }

    if (!fs.existsSync('./to_send/' + country + '/' + city)) {
      fs.mkdirSync('./to_send/' + country + '/' + city);
    }

    if (!fs.existsSync('./to_send/500/' + country)) {
      fs.mkdirSync('./to_send/500/' + country);
    }

    if (!fs.existsSync('./to_send/500/' + country + '/' + city)) {
      fs.mkdirSync('./to_send/500/' + country + '/' + city);
    }

    if (!fs.existsSync('./jpegs/' + country)) {
      fs.mkdirSync('./jpegs/' + country);
    }

    if (!fs.existsSync('./jpegs/' + country + '/' + city)) {
      fs.mkdirSync('./jpegs/' + country + '/' + city);
    }

    if (!fs.existsSync('./jpegs/' + country + '/' + city + '/' + location)) {
      fs.mkdirSync('./jpegs/' + country + '/' + city + '/' + location);
    }

    if (!cities[city]) {
      cities[city] = 1;
    }

    const itemData = {
      country,
      city,
      location: location,
      id: city + '-maps-' + cities[city],
      original_file: file,
      file:
        '/maps/' +
        country +
        '/' +
        city +
        '/' +
        city +
        '-maps-' +
        cities[city] +
        (file.includes('.mp4') ? '.mp4' : '.jpg'),
    };

    // if (
    //   fs.existsSync(
    //     './to_send/500/' + country + '/' + city + '/' + itemData.id + '.jpg'
    //   )
    // ) {
    //   cities[city]++;
    //   continue;
    // }

    // if (
    //   fs.existsSync(
    //     (
    //       './to_send/500/' +
    //       country +
    //       '/' +
    //       city +
    //       '/' +
    //       itemData.id +
    //       '.mp4'
    //     ).replace('.mp4', '-thumb.png')
    //   )
    // ) {
    //   cities[city]++;
    //   continue;
    // }

    if (
      file.includes('.jpg') ||
      file.includes('.jpeg') ||
      file.includes('.heic')
    ) {
      let tags = await ExifReader.load(f);

      let latitude = tags['GPSLatitudeRef']
        ? (tags['GPSLatitudeRef'].value[0] == 'S' ? -1 : 1) *
          tags['GPSLatitude'].description
        : null;

      if (
        !latitude &&
        (file.includes('.jpg') || file.includes('.jpeg')) &&
        allFiles.find((item) =>
          item.includes(f.toLowerCase().split('.')[0] + '.heic')
        )
      ) {
        tags = await ExifReader.load(
          fs.existsSync(f.replace('.jpg', '.heic').replace('.jpeg', '.heic'))
            ? f.replace('.jpg', '.heic').replace('.jpeg', '.heic')
            : f.replace('.jpg', '.HEIC').replace('.jpeg', '.HEIC')
        );

        latitude = tags['GPSLatitudeRef']
          ? (tags['GPSLatitudeRef'].value[0] == 'S' ? -1 : 1) *
            tags['GPSLatitude'].description
          : null;
      }

      const longitude = tags['GPSLongitudeRef']
        ? (tags['GPSLongitudeRef'].value[0] == 'W' ? -1 : 1) *
          tags['GPSLongitude'].description
        : null;
      const altitude = tags['GPSAltitude']
        ? tags['GPSAltitude'].description
        : null;

      if (tags['DateTimeOriginal']) {
        const datetime = tags['DateTimeOriginal'].description.split(' ');
        const date = datetime[0].replaceAll(':', '-');
        const time = datetime[1];

        itemData.latitude = latitude;
        itemData.longitude = longitude;
        itemData.altitude = altitude;
        itemData.date = date + ' ' + time;
      }

      console.log(f);

      if (
        !fs.existsSync(
          './to_send/' + country + '/' + city + '/' + itemData.id + '.jpg'
        ) ||
        !fs.existsSync(
          './to_send/500/' + country + '/' + city + '/' + itemData.id + '.jpg'
        )
      ) {
        if (f.includes('.HEIC')) {
          const inputBuffer = await promisify(fs.readFile)(f);
          const outputBuffer = await convert({
            buffer: inputBuffer, // the HEIC file buffer
            format: 'JPEG', // output format
            quality: 1, // the jpeg compression quality, between 0 and 1
          });

          f = f.replace('done', 'jpegs').replace('.HEIC', '.jpg');

          await promisify(fs.writeFile)(f, outputBuffer);
        }

        sharp(f)
          .rotate()
          .resize(1440)
          .jpeg({ mozjpeg: true })
          .toFile(
            './to_send/' + country + '/' + city + '/' + itemData.id + '.jpg',
            (err, info) => {
              console.log(err, 1);

              const dimensions = sizeOf(
                './to_send/' + country + '/' + city + '/' + itemData.id + '.jpg'
              );

              itemData.width = dimensions.width;
              itemData.height = dimensions.height;

              items.push(itemData);
              fs.writeFileSync('path.json', JSON.stringify(items, null, 4));
            }
          );

        sharp(f)
          .rotate()
          .resize(500)
          .jpeg({ mozjpeg: true })
          .toFile(
            './to_send/500/' +
              country +
              '/' +
              city +
              '/' +
              itemData.id +
              '.jpg',
            (err, info) => {
              console.log(err, 2);
            }
          );
      } else {
        console.log(
          './to_send/' + country + '/' + city + '/' + itemData.id + '.jpg'
        );

        let dimensions = null;

        try {
          dimensions = sizeOf(
            './to_send/' + country + '/' + city + '/' + itemData.id + '.jpg'
          );
        } catch (e) {
          console.log(
            './to_send/' + country + '/' + city + '/' + itemData.id + '.jpg',
            e
          );
        }

        itemData.width = dimensions.width;
        itemData.height = dimensions.height;

        items.push(itemData);
        fs.writeFileSync('path.json', JSON.stringify(items, null, 4));
      }
    } else {
      const fileToSend =
        './to_send/' + country + '/' + city + '/' + itemData.id + '.mp4';

      if (
        !fs.existsSync(
          './to_send/' + country + '/' + city + '/' + itemData.id + '-thumb.png'
        ) ||
        !fs.existsSync(
          './to_send/500/' +
            country +
            '/' +
            city +
            '/' +
            itemData.id +
            '-thumb.png'
        ) ||
        !fs.existsSync(fileToSend)
      ) {
        fs.copyFileSync(f, fileToSend);

        const duration = await getVideoDurationInSeconds(f);
        itemData.duration = duration;

        const dimensions = await getDimensions(fileToSend);
        await mt.forVideo(
          fileToSend,
          fileToSend.replace('.mp4', '-thumb2.png'),
          {
            width: dimensions.width,
          }
        );

        itemData.width_real = dimensions.width;
        itemData.height_real = dimensions.height;

        sharp(fileToSend.replace('.mp4', '-thumb2.png'))
          .rotate()
          .resize(1440)
          .jpeg({ mozjpeg: true })
          .toFile(fileToSend.replace('.mp4', '-thumb.png'), (err, info) => {
            console.log(err, 3);

            const dimensions = sizeOf(fileToSend.replace('.mp4', '-thumb.png'));

            itemData.width = dimensions.width;
            itemData.height = dimensions.height;

            items.push(itemData);

            fs.writeFileSync('path.json', JSON.stringify(items, null, 4));

            sharp(fileToSend.replace('.mp4', '-thumb.png'))
              .rotate()
              .resize(500)
              .jpeg({ mozjpeg: true })
              .toFile(
                (
                  './to_send/500/' +
                  country +
                  '/' +
                  city +
                  '/' +
                  itemData.id +
                  '.mp4'
                ).replace('.mp4', '-thumb.png'),
                (err, info) => {
                  console.log(err, 4);
                  fs.unlinkSync(fileToSend.replace('.mp4', '-thumb2.png'));
                }
              );
          });
      } else {
        const duration = await getVideoDurationInSeconds(fileToSend);
        itemData.duration = duration;

        const dimensions = await getDimensions(fileToSend);

        itemData.width_real = dimensions.width;
        itemData.height_real = dimensions.height;

        let thumbDimensions = null;

        try {
          thumbDimensions = sizeOf(fileToSend.replace('.mp4', '-thumb.png'));
        } catch (e) {
          console.log(fileToSend.replace('.mp4', '-thumb.png'), e);
        }

        itemData.width = thumbDimensions.width;
        itemData.height = thumbDimensions.height;

        items.push(itemData);

        fs.writeFileSync('path.json', JSON.stringify(items, null, 4));
      }
    }

    cities[city]++;
  }
})();
