const { getStorage } = require('firebase-admin/storage');
const { getFirestore } = require('firebase-admin/firestore');
// const { initializeApp, cert } = require('firebase-admin/app');

// const serviceAccount = require('../viajarcomale-firebase-adminsdk-u7w0a-30def9db38.json');
const { bluesky, mastodon, twitter } = require('./social');

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

    if (data.bluesky_id_pt && data.mastodon_id_pt && data.twitter_id_pt) {
      return;
    }

    items.push({
      ...data,
      path: doc.ref.path,
    });
  });

  const item = items[0];

  const promises = [];

  const files = [
    item.file,
    ...item.gallery
      .filter((item) => !item.file_type.includes('.mp4'))
      .map((item) => item.file),
  ].slice(0, 4);

  for (const file of files) {
    promises.push(
      new Promise((resolve) => {
        const chunks = [];

        bucket
          .file(file.substring(1))
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
  }

  if (!item.mastodon_id || !item.mastodon_id_pt) {
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
  }

  if (!item.twitter_id || !item.twitter_id_pt) {
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
  }
}

module.exports = {
  createPost,
};
