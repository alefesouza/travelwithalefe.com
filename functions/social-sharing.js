const { getStorage } = require('firebase-admin/storage');
const { getFirestore } = require('firebase-admin/firestore');
const { initializeApp, cert } = require('firebase-admin/app');

const serviceAccount = require('../viajarcomale-firebase-adminsdk-u7w0a-30def9db38.json');
const { bluesky, mastodon, twitter } = require('./social');

initializeApp({
  credential: cert(serviceAccount),
});

async function createPost(text) {
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
    items.push(doc.data());
  });

  for (const item of items.slice(0, 1)) {
    const promises = [];

    const files = [
      item.file,
      ...item.gallery
        .filter((item) => !item.file_type.includes('.mp4'))
        .map((item) => item.file),
    ].slice(0, 4);

    for (const file of files) {
      promises.push(
        new Promise((resolve, reject) => {
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

    const description = `${item.description}\n.\n.\n.\n#${item.hashtags.join(
      ' #'
    )} https://travelwithalefe.com/countries/${item.country}/cities/${
      item.city
    }/posts/${item.id.replace(`${item.city}-post-`, '')}`;

    bluesky.post(item, description, allChunks);
    mastodon.post(item, description, allChunks);
    twitter.post(item, description, allChunks);
  }
}

createPost('Hello World');
