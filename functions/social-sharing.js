const { getStorage } = require('firebase-admin/storage');
const { getFirestore } = require('firebase-admin/firestore');
const { bluesky, mastodon } = require('./social');

// const { initializeApp, cert } = require('firebase-admin/app');

// const serviceAccount = require('../viajarcomale-firebase-adminsdk-u7w0a-b4d02e4cb7.json');

// initializeApp({
//   credential: cert(serviceAccount),
// });

async function createPost() {
  const firestore = getFirestore();
  const storage = getStorage();
  const bucket = storage.bucket('files.viajarcomale.com');

  const compilationsSnaptshot = await firestore
    .collectionGroup('medias')
    .where('is_compilation', '==', true)
    .orderBy('date', 'asc')
    .get();

  const items = [];

  compilationsSnaptshot.forEach((doc) => {
    const data = doc.data();

    if (data.bluesky_id_pt && data.mastodon_id_pt) {
      return;
    }

    items.push({
      ...data,
      path: doc.ref.path,
    });
  });

  const item = items[0];

  if (!item) {
    return;
  }

  const promises = [];

  const files = [
    item.file,
    ...item.gallery
      .filter((item) => !item.file.includes('.mp4'))
      .map((item) => item.file),
  ].slice(0, 4);

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

  let description = `${item.description.substring(0, 300)}… ${siteLink}`;

  if (item.description.length < 250) {
    description = `${item.description}\n.\n.\n.\n#${item.hashtags.join(
      ' #'
    )} ${siteLink}`;

    while (description.length >= 300 && item.hashtags.length > 0) {
      description = description.replace(
        ' #' + item.hashtags[item.hashtags.length - 1],
        ''
      );

      item.hashtags.pop();
    }
  }

  let descriptionPt = `${item.description_pt.substring(0, 300)}… ${siteLinkPt}`;

  if (item.description_pt.length < 250) {
    descriptionPt = `${item.description_pt}\n.\n.\n.\n#${item.hashtags_pt.join(
      ' #'
    )} ${siteLinkPt}`;

    while (descriptionPt.length >= 300 && item.hashtags.length > 0) {
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
      const mastodonId = await mastodon.post(
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
}

// createPost();

module.exports = {
  createPost,
};
