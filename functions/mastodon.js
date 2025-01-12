const { createRestAPIClient } = require('masto');
const { getStorage } = require('firebase-admin/storage');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { initializeApp, cert } = require('firebase-admin/app');
const path = require('path');

const serviceAccount = require('../viajarcomale-firebase-adminsdk-u7w0a-b4d02e4cb7.json');

initializeApp({
  credential: cert(serviceAccount),
});

async function createPost(text) {
  const firestore = getFirestore();
  const storage = getStorage();
  const bucket = storage.bucket('files.viajarcomale.com');

  const masto = createRestAPIClient({
    url: 'https://mastodon.social',
    accessToken: 'PQIRFliXg8s8jL9WHEj2tzyzMFMDYWq8P2ttSWnmTEc',
  });

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
    ].slice(0, 1);

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
              const attachment = await masto.v2.media.create({
                file: new Blob(chunks),
                description: item.description,
              });

              resolve(attachment.id);
            });
        })
      );
    }

    const attachments = await Promise.all(promises);

    const description = `${item.description}\n.\n.\n.\n#${item.hashtags.join(
      ' #'
    )} https://travelwithalefe.com/countries/${item.country}/cities/${
      item.city
    }/posts/${item.id.replace(`${item.city}-post-`, '')}`;

    const status = await masto.v1.statuses.create({
      status: description,
      visibility: 'public',
      mediaIds: attachments,
    });

    console.log(status.id);
  }
}

createPost('Hello World');
