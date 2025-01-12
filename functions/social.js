const { AtpAgent, RichText } = require('@atproto/api');
const { createRestAPIClient } = require('masto');
const { TwitterApi, EUploadMimeType } = require('twitter-api-v2');
const path = require('path');

const bluesky = {
  async authenticate() {
    const agent = new AtpAgent({ service: 'https://bsky.social' });

    await agent.login({
      identifier: 'travelwithalefe@as.dev',
      password: 'g@3Y.!Kb4JqpspMzW4Nb',
    });

    return agent;
  },

  async post(item, description, allChunks) {
    const images = await Promise.all(
      allChunks.map(async (chunks) => {
        return new Promise(async (resolve, reject) => {
          const agent = await this.authenticate();

          const {
            data: { blob: image },
          } = await agent.uploadBlob(chunks, { encoding: 'image/jpg' });

          resolve(image);
        });
      })
    );

    const agent = await this.authenticate();

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

    return blueskyId;
  },
};

const mastodon = {
  authenticate() {
    const masto = createRestAPIClient({
      url: 'https://mastodon.social',
      accessToken: 'PQIRFliXg8s8jL9WHEj2tzyzMFMDYWq8P2ttSWnmTEc',
    });

    return masto;
  },

  async post(item, description, allChunks) {
    const masto = this.authenticate();

    const attachments = await Promise.all(
      allChunks.map(async (chunks) => {
        return new Promise(async (resolve, reject) => {
          const attachment = await masto.v2.media.create({
            file: new Blob(chunks),
            description: item.description,
          });

          resolve(attachment.id);
        });
      })
    );

    const status = await masto.v1.statuses.create({
      status: description,
      visibility: 'public',
      mediaIds: attachments,
    });

    return status.id;
  },
};

const twitter = {
  authenticate() {
    const client = new TwitterApi({
      appKey: 'OpyXLafpumLSmzHgo0gOLsvCF',
      appSecret: 'FLIw1o3xFvIHcwAGhNC3V3Hsd0PO2BJgfitWxqaaoK1N0ElgZw',
      accessToken: '1693265790718357504-BIFUqVXJUvjESCApwfTLpSSrNyV6Cf',
      accessSecret: 'HyyWNP0KjwML6ZXs7sk4dFg5J7Cq78hxtU6gWa98zxaQZ',
    });

    return client;
  },

  async post(item, description, allChunks) {
    const client = this.authenticate();

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
      text: description,
      media: { media_ids: mediaIds },
    });

    return result.id;
  },
};

module.exports = {
  bluesky,
  mastodon,
  twitter,
};
