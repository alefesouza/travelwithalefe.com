const sharp = require('sharp');
const { resolve } = require('path');
const { readdir } = require('fs').promises;
const fs = require('fs');
const mt = require('media-thumbnail');
const getDimensions = require('get-video-dimensions');
const { getVideoDurationInSeconds } = require('get-video-duration');
const sizeOf = require('image-size');

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
const cities = {};

(async () => {
  const files = [];

  for await (const f of getFiles('./done')) {
    if (f.includes('.DS_Store') || f.includes('.HEIC')) {
      continue;
    }

    files.push(f);
  }

  files.sort((a, b) => {
    const splitA = a.split('/');
    const fileA = splitA[11];
    const splitB = b.split('/');
    const fileB = splitB[11];

    return fileA.localeCompare(fileB);
  });

  for await (const f of files) {
    if (f.includes('.DS_Store') || f.includes('.HEIC')) {
      continue;
    }

    const split = f.split('/');

    const city = split[9];
    const country = split[8];
    const location = split[10];
    const file = split[11];

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

    if (!cities[city]) {
      cities[city] = 1;
    }
    console.log(f);
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

    let data = null;

    if (
      !file.includes('.mp4') &&
      !file.includes('Google Brasil.jpg') &&
      !file.includes('panoramio-99093262.jpg') &&
      !file.includes('panoramio-99093250.jpg') &&
      !file.includes('2023-12-02.jpg')
    ) {
      if (file.includes('(')) {
        const [date, n] = file.split('(');
        const [number] = n.split(')');
        const jsonFile = date + '.jpg' + '(' + number + ').json';
        if (fs.existsSync('./' + jsonFile)) {
          data = fs.readFileSync('./' + jsonFile);
        } else {
          data = fs.readFileSync(
            './' + date + '(' + number + ')' + '.jpg.json'
          );
        }
      } else {
        if (fs.existsSync('./' + file + '.json')) {
          data = fs.readFileSync('./' + file + '.json');
        } else {
          data = fs.readFileSync('./' + file.split('.')[0] + '.HEIC.json');
        }
      }

      const meta = JSON.parse(data.toString());

      itemData.latitude = meta.geoDataExif.latitude;
      itemData.longitude = meta.geoDataExif.longitude;
      itemData.altitude = meta.geoDataExif.altitude;
      itemData.latitude_span = meta.geoDataExif.latitudeSpan;
      itemData.longitude_span = meta.geoDataExif.longitudeSpan;
      itemData.date = new Date(meta.photoTakenTime.formatted)
        .toISOString()
        .replace('T', ' ')
        .slice(0, 16);
    }

    console.log(itemData);

    if (file.includes('.jpg')) {
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
