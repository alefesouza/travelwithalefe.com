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
  pixelfed: {
    url: 'https://pixelfed.social',
    accessToken:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIyMzAxMiIsImp0aSI6IjhjZWYxZTI4YjBiNjYyM2Y0ZjNlMTFiMTYyODRhZjM2YjcxNTY1NzUwMzdhNTAzYmI1NWUyZGJjNzkxMmIzZDAzMmNhMzFjYjUxMTUzOWQ1IiwiaWF0IjoxNzM2ODgyNzQ4LjM3MTU4NywibmJmIjoxNzM2ODgyNzQ4LjM3MTU5LCJleHAiOjE3Njg0MTg3NDguMzY5MTIyLCJzdWIiOiIxNDgyNjMiLCJzY29wZXMiOlsicmVhZCIsIndyaXRlIl19.WlxTtYlf8ZL7LNdgpKeZEzDo6P0FYBe1bXpZq7mRurOCrR6JCSdkmcX2p87GYF0JTqFP99MvfGngHiUmZIdEjIc1cICrWJtnI_iV_WxUFpxY5Hmjp02DmiNWfUhL6st8c3-EneKdA3CyVQlUL2K2Mk8sA7R6boXQ-PZLafiXT-LnHM5s_NHLZiOwE2ySm7AuE33W_BgRRP4q1fhPUhOkNxz-roTlq3wUxsI3X8DJwa8vL6xk6ogREw6BL3CgZOMMz5f9cPBis8aVlqpOHlT3rHOgR6FDZHjiD3dHCx3qyYI-LikCDq0iuOFxy1PaeN7OeaVkb-6DquSSFWk3oYqG0myWgoj-AO4bBuXOc3NaimjJtCwMGxqnW0YvcVc6P5KAZbtTc0ERQd7aHNmDadFANJfFpjnfYr3nkjCNgDYvms0qQIUU3MHg76g3NMXznMYRdvB4AePVUw6R78BaidVqVLaHUnuitsFFEGHUBPNVAqtiKCxcBG-2WmJCLDaaAQ1qG_bS1-o8ZulkZP69Ue5tZ3KmotE5wTDtwVQTRQ-rFRvqMCP3plWnFrNxmCl38nU6fkY35rZsmBtsCF_2zxuqlKAu-QVOy4ihMGW1doXmFdVEOaGVlW8ME7709ljqoz8wyhj6GukeYuejx-iaXG0bJYu232KJ0LBKUdvPDhKUv5Q',
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
  pixelfed: {
    url: 'https://pixelfed.social',
    accessToken:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIyMzAxMiIsImp0aSI6ImZjODQ3YjU0NzlmNzUzYTAzNDZjYTgxOWIyYjY2MTcyMTdlMjQ2ZDQ0OTRhNzM2ZGM1ZDMwNDQ3NmIyZDM0MDc1YmVmZDQ5Yzc0MDc2ODE4IiwiaWF0IjoxNzM2ODg1MjkzLjQxODQ0LCJuYmYiOjE3MzY4ODUyOTMuNDE4NDQ0LCJleHAiOjE3Njg0MjEyOTMuNDExODQsInN1YiI6IjE0OTI4MyIsInNjb3BlcyI6WyJ3cml0ZSIsInJlYWQiXX0.v_Sjm69ErCofBmYK4Wo8mSvxMeZqJmemROVAotS5UP2CZzXBlYfpwaWf9J5LxM5l9G_C8bTuUk1H5mgmOn93DRYgo5C7BqVnWVilPYyJtWm4C6NhAGUsq7rajrSMhEei-kCIdECR2SEEdoIClv3KylCWY-82h4Hcaw3cebbJbUTYuUuIj9u7xaJeRH9vWBJ2ZEEEug3aBEeVW_eX3VG0qVTuYTfyAYHEq0XmYl8wtNCijqz0lbuiyiS3Za2nXHtygISFhHSK_xNs32qfaE9KVkzHU8M2284NfON-iWatIXzSlaQjvTBNKbivPuKqXbdWnZoN3xAwSCqkl8FzCOS9fpcELqvSiCEjeb-cV6l0lwC55RyTi4oiVPjpEUYWnImY_Vrmxg1F-w2IALcG0yaoyqndPmiXelx8x7g2tpyuQnUt30C_mNlQGeLQajJDk1covvpFyEw-QI1X3rWzOwzXelBBhKpw63Wgxv5LVXGUyZ_AGKcj5PBLgZdgczFw1z3T6SJnUiXGmazvfHByW3lwjuGIO7UIPEcD_SW7f_JUIUmcE6XTG2Nk4-s_EbGEtwEigFpL5R9yYd95lQ1AKibDsHznCGtr4b3sWzMXCd5Nwyrr3bxcm9cVw3tTwgrmUvcoFQC5_ZuVrAbD9iQb6CgOgP9RHKOSkxLTcJxgttUxnWU',
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
          } = await agent.uploadBlob(chunks, { encoding: 'image/jpeg' });

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

    console.info('twitter', result);

    return result.data.id;
  },
};

module.exports = {
  bluesky,
  fediverse,
  twitter,
};
