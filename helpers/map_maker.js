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

const items = [];
const cities = {
  toronto: 5,
};

(async () => {
  const files = [];

  for await (const f of getFiles('./done')) {
    if (f.includes('.DS_Store')) {
      continue;
    }

    files.push(f);
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

    if (file.includes('.jpg') || file.includes('.heic')) {
      const tags = await ExifReader.load(f);

      const latitude = tags['GPSLatitudeRef']
        ? (tags['GPSLatitudeRef'].value[0] == 'S' ? -1 : 1) *
          tags['GPSLatitude'].description
        : null;
      const longitude = tags['GPSLongitudeRef']
        ? (tags['GPSLongitudeRef'].value[0] == 'W' ? -1 : 1) *
          tags['GPSLongitude'].description
        : null;
      const altitude = tags['GPSAltitude']
        ? tags['GPSAltitude'].description
        : null;

      const datetime = tags['DateTimeOriginal'].description.split(' ');
      const date = datetime[0].replaceAll(':', '-');
      const time = datetime[1];

      itemData.latitude = latitude;
      itemData.longitude = longitude;
      itemData.altitude = altitude;
      itemData.date = date + ' ' + time;

      if (f.includes('.HEIC')) {
        const inputBuffer = await promisify(fs.readFile)(f);
        const outputBuffer = await convert({
          buffer: inputBuffer, // the HEIC file buffer
          format: 'JPEG', // output format
          quality: 1, // the jpeg compression quality, between 0 and 1
        });

        f = f.replace('upload/done', 'upload/jpegs').replace('.HEIC', '.jpg');
        console.log(f);

        await promisify(fs.writeFile)(f, outputBuffer);
      }

      sharp(f)
        .rotate()
        .resize(1440)
        .jpeg({ mozjpeg: true })
        .toFile(
          './to_send/' + country + '/' + city + '/' + itemData.id + '.jpg',
          (err, info) => {
            console.log(err);

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
          './to_send/500/' + country + '/' + city + '/' + itemData.id + '.jpg',
          (err, info) => {
            console.log(err);
          }
        );
    } else {
      const fileToSend =
        './to_send/' + country + '/' + city + '/' + itemData.id + '.mp4';
      fs.copyFileSync(f, fileToSend);

      const duration = await getVideoDurationInSeconds(f);
      itemData.duration = duration;

      const dimensions = await getDimensions(fileToSend);
      await mt.forVideo(fileToSend, fileToSend.replace('.mp4', '-thumb2.png'), {
        width: dimensions.width,
      });

      itemData.width_real = dimensions.width;
      itemData.height_real = dimensions.height;

      sharp(fileToSend.replace('.mp4', '-thumb2.png'))
        .rotate()
        .resize(1440)
        .jpeg({ mozjpeg: true })
        .toFile(fileToSend.replace('.mp4', '-thumb.png'), (err, info) => {
          console.log(err);

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
                console.log(err);
                fs.unlinkSync(fileToSend.replace('.mp4', '-thumb2.png'));
              }
            );
        });
    }

    cities[city]++;
  }
})();
