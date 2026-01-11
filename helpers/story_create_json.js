import fs from 'fs';
import items from './the-stories.json' with { type: "json" };
import sizeOf from 'image-size';
import sharp from 'sharp';
import mt from 'media-thumbnail';
import gm from 'gm';
import { getVideoDurationInSeconds } from 'get-video-duration';

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
