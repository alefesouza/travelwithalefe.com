const { TwitterApi, EUploadMimeType } = require('twitter-api-v2');
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

  const client = new TwitterApi({
    appKey: 'OpyXLafpumLSmzHgo0gOLsvCF',
    appSecret: 'FLIw1o3xFvIHcwAGhNC3V3Hsd0PO2BJgfitWxqaaoK1N0ElgZw',
    accessToken: '1693265790718357504-BIFUqVXJUvjESCApwfTLpSSrNyV6Cf',
    accessSecret: 'HyyWNP0KjwML6ZXs7sk4dFg5J7Cq78hxtU6gWa98zxaQZ',
  });

  const bearer = new TwitterApi(
    'AAAAAAAAAAAAAAAAAAAAAJhdyAEAAAAAF6F5ZIlw91tuOPwXdlZvLn%2BPnkU%3DS9qBlHHBAv01vH1kRAWnqt4OR43Im3o0u6kjxKxGrN9jmxrhw9'
  );

  const twitterClient = client.readWrite;

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
              const mediaId = client.v1.uploadMedia(Buffer.concat(chunks), {
                mimeType: EUploadMimeType.Jpeg,
              });

              resolve(mediaId);
            });
        })
      );
    }

    const mediaIds = await Promise.all(promises);

    const description = `${item.description}\n.\n.\n.\n#${item.hashtags.join(
      ' #'
    )} https://travelwithalefe.com/countries/${item.country}/cities/${
      item.city
    }/posts/${item.id.replace(`${item.city}-post-`, '')}`;

    const result = await twitterClient.v2.tweet({
      text: description,
      media: { media_ids: mediaIds },
    });

    console.log(result.id);
  }
}

createPost('Hello World');
