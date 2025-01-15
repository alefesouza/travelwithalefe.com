const { getStorage } = require('firebase-admin/storage');
const { getFirestore } = require('firebase-admin/firestore');
const { fediverse } = require('./social');

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
    .where('is_compilation', '==', true)
    .orderBy('date', 'asc')
    .get();

  const items = [];

  compilationsSnapshot.forEach((doc) => {
    const data = doc.data();

    if (data.pixelfed_id_pt) {
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
  ].slice(0, 10);

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

  const description = `${
    item.description
  } ${siteLink}\n.\n.\n.\n#${item.hashtags.join(' #')}`;

  const descriptionPt = `${
    item.description_pt
  } ${siteLinkPt}\n.\n.\n.\n#${item.hashtags_pt.join(' #')}`;

  if (!item.pixelfed_id || !item.pixelfed_id_pt) {
    try {
      const pixelfedId = await fediverse.post(
        !!item.pixelfed_id,
        item,
        description,
        descriptionPt,
        allChunks,
        false
      );

      firestore.doc(item.path).update({
        [item.pixelfed_id ? 'pixelfed_id_pt' : 'pixelfed_id']: pixelfedId,
      });
    } catch (e) {
      console.error('pixelfed error', e);
    }
  }
}

// createPost();

module.exports = {
  createPost,
};
