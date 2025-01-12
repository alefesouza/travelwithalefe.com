const { AtpAgent, RichText } = require('@atproto/api');
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

  const agent = new AtpAgent({ service: 'https://bsky.social' });

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
              await agent.login({
                identifier: 'travelwithalefe@as.dev',
                password: 'g@3Y.!Kb4JqpspMzW4Nb',
              });

              const {
                data: { blob: image },
              } = await agent.uploadBlob(chunks, { encoding: 'image/jpg' });

              resolve(image);
            });
        })
      );
    }

    const images = await Promise.all(promises);

    const description = `${item.description}\n.\n.\n.\n#${item.hashtags.join(
      ' #'
    )} https://travelwithalefe.com/countries/${item.country}/cities/${
      item.city
    }/posts/${item.id.replace(`${item.city}-post-`, '')}`;

    const rt = new RichText({
      text: description,
    });
    await rt.detectFacets(agent); // automatically detects mentions and links

    const res3 = await agent.app.bsky.feed.post.create(
      { repo: agent.session?.did },
      {
        $type: 'app.bsky.feed.post',
        text: rt.text,
        facets: rt.facets,
        createdAt: new Date().toISOString(),
        embed: {
          $type: 'app.bsky.embed.images',
          images: images.map((image) => ({
            image,
            alt: item.description,
            aspectRatio: {
              // a hint to clients
              width: item.width,
              height: item.height,
            },
          })),
        },
      }
    );

    const blueskyId = path.basename(res3.uri);

    console.log(blueskyId);
  }
}

createPost('Hello World');
