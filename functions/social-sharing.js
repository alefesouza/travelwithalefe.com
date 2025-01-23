const { getStorage } = require('firebase-admin/storage');
const { getFirestore } = require('firebase-admin/firestore');
const { bluesky, fediverse, twitter } = require('./social');

// const { initializeApp, cert } = require('firebase-admin/app');

// const serviceAccount = require('../viajarcomale-firebase-adminsdk-u7w0a-b4d02e4cb7.json');

// initializeApp({
//   credential: cert(serviceAccount),
// });

async function createPost() {
  const firestore = getFirestore();
  const storage = getStorage();
  const bucket = storage.bucket('files.viajarcomale.com');

  const compilationsSnapshot = await firestore
    .collectionGroup('medias')
    .where('type', '==', 'post')
    .where('city', '==', 'new-york')
    .orderBy('id', 'asc')
    .get();

  let items = [];

  compilationsSnapshot.forEach((doc) => {
    const data = doc.data();

    if (data.bluesky_id_pt && data.mastodon_id_pt && data.twitter_id_pt) {
      return;
    }

    items.push({
      ...data,
      path: doc.ref.path,
    });
  });

  items.sort((a, b) => {
    return a.id.localeCompare(b.id, 'en', { numeric: true });
  });

  const item = items[0];

  if (!item) {
    return;
  }

  const promises = [];

  let files = [];

  const imageFiles = [
    item.file,
    ...item.gallery
      .filter((item) => !item.file.includes('.mp4'))
      .map((item) => item.file),
  ];

  if (imageFiles.length >= 4) {
    files = imageFiles.slice(0, 4);
  } else {
    files = [
      ...new Set([
        ...imageFiles,
        ...item.gallery
          .filter((item) => item.file.includes('.mp4'))
          .map((item) => item.file.replace('.mp4', '-thumb.png')),
      ]),
    ].slice(0, 4);
  }

  for (const file of files) {
    promises.push(
      new Promise(async (resolve) => {
        const chunks = [];

        let filePath = file.substring(1);

        const [metadata] = await bucket.file(filePath).getMetadata();

        if (metadata.size > 900000) {
          filePath = 'resize/500' + file;
        }

        bucket
          .file(filePath)
          .createReadStream() //stream is created
          .on('data', (data) => {
            chunks.push(data);
          })
          .on('finish', async () => {
            resolve(chunks);
          });
      })
    );
  }

  const allChunks = await Promise.all(promises);

  const siteLink = `https://travelwithalefe.com/countries/${
    item.country
  }/cities/${item.city}/posts/${item.id.replace(`${item.city}-post-`, '')}`;
  const siteLinkPt = `https://viajarcomale.com.br/countries/${
    item.country
  }/cities/${item.city}/posts/${item.id.replace(`${item.city}-post-`, '')}`;

  if (!item.description) {
    item.description = '';
  }

  let description = `${item.description.substring(0, 200)}… ${siteLink}`;

  if (item.description.length < 200) {
    description = `${
      item.description
    } ${siteLink}\n.\n.\n.\n#${item.hashtags.join(' #')}`;

    while (description.length >= 280 && item.hashtags.length > 0) {
      description = description.replace(
        ' #' + item.hashtags[item.hashtags.length - 1],
        ''
      );

      item.hashtags.pop();
    }
  }

  if (!item.description_pt) {
    item.description_pt = item.description;
  }

  let descriptionPt = `${item.description_pt.substring(0, 200)}… ${siteLinkPt}`;

  if (item.description_pt.length < 200) {
    descriptionPt = `${
      item.description_pt
    } ${siteLinkPt}\n.\n.\n.\n#${item.hashtags_pt.join(' #')}`;

    while (descriptionPt.length >= 280 && item.hashtags_pt.length > 0) {
      descriptionPt = descriptionPt.replace(
        ' #' + item.hashtags_pt[item.hashtags_pt.length - 1],
        ''
      );

      item.hashtags_pt.pop();
    }
  }

  if (!item.bluesky_id || !item.bluesky_id_pt) {
    try {
      const blueskyId = await bluesky.post(
        !!item.bluesky_id,
        item,
        description,
        descriptionPt,
        allChunks
      );

      firestore.doc(item.path).update({
        [item.bluesky_id ? 'bluesky_id_pt' : 'bluesky_id']: blueskyId,
      });
    } catch (e) {
      console.error('bluesky error', e);
    }
  }

  if (!item.mastodon_id || !item.mastodon_id_pt) {
    try {
      const mastodonId = await fediverse.post(
        !!item.mastodon_id,
        item,
        description,
        descriptionPt,
        allChunks
      );

      firestore.doc(item.path).update({
        [item.mastodon_id ? 'mastodon_id_pt' : 'mastodon_id']: mastodonId,
      });
    } catch (e) {
      console.error('mastodon error', e);
    }
  }

  if (!item.twitter_id || !item.twitter_id_pt) {
    try {
      const twitterId = await twitter.post(
        !!item.twitter_id,
        item,
        description,
        descriptionPt,
        allChunks
      );

      firestore.doc(item.path).update({
        [item.twitter_id ? 'twitter_id_pt' : 'twitter_id']: twitterId,
      });
    } catch (e) {
      console.error('twitter error', e);
    }
  }
}

// createPost();

module.exports = {
  createPost,
};
