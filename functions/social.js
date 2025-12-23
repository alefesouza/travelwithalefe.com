const { AtpAgent, RichText } = require('@atproto/api');
const { createRestAPIClient } = require('masto');
const { TwitterApi, EUploadMimeType } = require('twitter-api-v2');
const path = require('path');
const { travelWithAlefe, viajarComAle } = require('./credentials');

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
          try {
            const agent = await this.authenticate(isBR);

            const {
              data: { blob: image },
            } = await agent.uploadBlob(chunks, { encoding: 'image/jpeg' });

            resolve(image);
          } catch (e) {
            reject(e);
          }
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
              width: item.width || 720,
              height: item.height || 900,
            },
          })),
        },
      }
    );

    console.info('bluesky', res3);

    const blueskyId = path.basename(res3.uri);

    return blueskyId;
  },
};

const fediverse = {
  authenticate(isBR, isMastodon) {
    const masto = createRestAPIClient(
      isMastodon
        ? isBR
          ? viajarComAle.mastodon
          : travelWithAlefe.mastodon
        : isBR
        ? viajarComAle.pixelfed
        : travelWithAlefe.pixelfed
    );

    return masto;
  },

  async post(
    isBR,
    item,
    description,
    descriptionPt,
    allChunks,
    isMastodon = true
  ) {
    const masto = this.authenticate(isBR, isMastodon);

    const attachments = await Promise.all(
      allChunks.map(async (chunks) => {
        return new Promise(async (resolve, reject) => {
          try {
            const attachment = await masto.v2.media.create({
              file: new Blob(chunks),
              description: isBR ? item.description_pt : item.description,
            });

            resolve(attachment.id);
          } catch (e) {
            reject(e);
          }
        });
      })
    );

    const status = await masto.v1.statuses.create({
      status: isBR ? descriptionPt : description,
      visibility: 'public',
      mediaIds: attachments,
    });

    console.info(isMastodon ? 'mastodon' : 'pixelfed', status);

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
          try {
            const mediaId = client.v1.uploadMedia(Buffer.concat(chunks), {
              mimeType: EUploadMimeType.Jpeg,
            });

            resolve(mediaId);
          } catch (e) {
            reject(e);
          }
        });
      })
    );

    const result = await twitterClient.v2.tweet({
      text: isBR ? descriptionPt : description,
      media: { media_ids: mediaIds },
    });

    console.info('twitter', result);

    return result.data.id;
  },
};

module.exports = {
  bluesky,
  fediverse,
  twitter,
};
