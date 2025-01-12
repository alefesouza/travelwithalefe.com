const { AtpAgent, RichText } = require('@atproto/api');
const { createRestAPIClient } = require('masto');
const { TwitterApi, EUploadMimeType } = require('twitter-api-v2');
const path = require('path');

const travelWithAlefe = {
  bluesky: {
    identifier: 'travelwithalefe@as.dev',
    password: 'g@3Y.!Kb4JqpspMzW4Nb',
  },
  mastodon: {
    url: 'https://mastodon.social',
    accessToken: 'PQIRFliXg8s8jL9WHEj2tzyzMFMDYWq8P2ttSWnmTEc',
  },
  twitter: {
    appKey: 'OpyXLafpumLSmzHgo0gOLsvCF',
    appSecret: 'FLIw1o3xFvIHcwAGhNC3V3Hsd0PO2BJgfitWxqaaoK1N0ElgZw',
    accessToken: '1693265790718357504-BIFUqVXJUvjESCApwfTLpSSrNyV6Cf',
    accessSecret: 'HyyWNP0KjwML6ZXs7sk4dFg5J7Cq78hxtU6gWa98zxaQZ',
  },
};

const viajarComAle = {
  bluesky: {
    identifier: 'contact@alefesouza.com',
    password: 'frg2djv!kdg3fge2HYM',
  },
  mastodon: {
    url: 'https://mastodon.social',
    accessToken: 'aPsROG1XDXiEucIGDDunk_LeExI66s16p8RUB0ZmZPU',
  },
  twitter: {
    appKey: 'u94IArl6frkXUkkiVK0lobLA5',
    appSecret: 'D6fm1OWvIZFffAlWuL32wFFoEVRDKVy8OT9phtHXMpTd6ICjPm',
    accessToken: '1693645649789480960-jvEmqw5610mx6Z4AWgoTyW8envGb4G',
    accessSecret: 'fWxXA4SSzFzTbsVT1bAuqlh5zrAktiBlpvGI1GgCS5OqM',
  },
};

const bluesky = {
  async authenticate(isBR) {
    const agent = new AtpAgent({ service: 'https://bsky.social' });

    await agent.login(isBR ? viajarComAle.bluesky : travelWithAlefe.bluesky);

    return agent;
  },

  async post(isBR, item, description, descriptionPt, allChunks) {
    const images = await Promise.all(
      allChunks.map(async (chunks) => {
        return new Promise(async (resolve, reject) => {
          const agent = await this.authenticate(isBR);

          const {
            data: { blob: image },
          } = await agent.uploadBlob(chunks, { encoding: 'image/jpg' });

          resolve(image);
        });
      })
    );

    const agent = await this.authenticate(isBR);

    const rt = new RichText({
      text: isBR ? descriptionPt : description,
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
            alt: isBR ? item.description_pt : item.description,
            aspectRatio: {
              // a hint to clients
              width: item.width,
              height: item.height,
            },
          })),
        },
      }
    );

    console.log('bluesky', res3);

    const blueskyId = path.basename(res3.uri);

    return blueskyId;
  },
};

const mastodon = {
  authenticate(isBR) {
    const masto = createRestAPIClient(
      isBR ? viajarComAle.mastodon : travelWithAlefe.mastodon
    );

    return masto;
  },

  async post(isBR, item, description, descriptionPt, allChunks) {
    const masto = this.authenticate(isBR);

    const attachments = await Promise.all(
      allChunks.map(async (chunks) => {
        return new Promise(async (resolve, reject) => {
          const attachment = await masto.v2.media.create({
            file: new Blob(chunks),
            description: isBR ? item.description_pt : item.description,
          });

          resolve(attachment.id);
        });
      })
    );

    const status = await masto.v1.statuses.create({
      status: isBR ? descriptionPt : description,
      visibility: 'public',
      mediaIds: attachments,
    });

    console.log('mastodon', status);

    return status.id;
  },
};

const twitter = {
  authenticate(isBR) {
    const client = new TwitterApi(
      isBR ? viajarComAle.twitter : travelWithAlefe.twitter
    );

    return client;
  },

  async post(isBR, item, description, descriptionPt, allChunks) {
    const client = this.authenticate(isBR);

    const twitterClient = client.readWrite;

    const mediaIds = await Promise.all(
      allChunks.map(async (chunks) => {
        return new Promise(async (resolve, reject) => {
          const mediaId = client.v1.uploadMedia(Buffer.concat(chunks), {
            mimeType: EUploadMimeType.Jpeg,
          });

          resolve(mediaId);
        });
      })
    );

    const result = await twitterClient.v2.tweet({
      text: isBR ? descriptionPt : description,
      media: { media_ids: mediaIds },
    });

    console.log('twitter', result);

    return result.data.id;
  },
};

module.exports = {
  bluesky,
  mastodon,
  twitter,
};
