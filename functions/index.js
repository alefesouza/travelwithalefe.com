const {
  onDocumentCreated,
  onDocumentUpdated,
} = require('firebase-functions/v2/firestore');
const { getStorage } = require('firebase-admin/storage');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onRequest } = require('firebase-functions/v2/https');
const { getMessaging } = require('firebase-admin/messaging');
const admin = require('firebase-admin');
// const { createPost } = require('./social-sharing');
// const { createPixelfedPost } = require('./pixelfed-sharing');

admin.initializeApp();

exports.onMediaCreated = onDocumentCreated(
  '/countries/{countryId}/cities/{mediaId}/medias/{mediaId}',
  async (event) => {
    const newValue = event.data.data();
    const update = {};

    // Set hashtags to an array
    if (typeof newValue.hashtags === 'string') {
      update.hashtags = [
        ...new Set(
          newValue.hashtags
            .split('#')
            .map((h) => h.trim())
            .filter((h) => h),
        ),
      ];
    }

    const split = event.data.ref.path.split('/');
    update.country = split[1];

    update.createdAt = FieldValue.serverTimestamp();

    return event.data.ref.update(update);
  },
);

function getTotalKey(type) {
  switch (type) {
    case 'post':
      key = 'posts';
      break;
    case 'story':
      key = 'stories';
      break;
    case '360photo':
      key = 'photos360';
      break;
    case 'maps':
      key = 'maps';
      break;
    case 'youtube':
      key = 'videos';
      break;
    case 'short-video':
      key = 'shorts';
      break;
  }

  return key;
}

function string_to_slug(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = 'àáäâãèéëêìíïîòóöôõùúüûñç·/_,:;';
  var to = 'aaaaaeeeeiiiiooooõuuuunc------';
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}

exports.onMediaUpdated = onDocumentUpdated(
  '/countries/{countryId}/cities/{cityId}/medias/{mediaId}',
  async (event) => {
    const oldValue = event.data.before.data();
    const newValue = event.data.after.data();
    const update = {};

    if (newValue.location_update) {
      update.location_update = FieldValue.delete();

      if (newValue.from_editor) {
        update.from_editor = FieldValue.delete();
      }

      return event.data.after.ref.update(update);
    }

    if (
      newValue.latitude === '41.914166666667' ||
      newValue.latitude === '41.909588333333'
    ) {
      return;
    }

    if (newValue.city === 'lisbon-2' && !newValue.cityData.travel_number) {
      update.cityData = { ...newValue.cityData, travel_number: 2 };
    }

    // Set hashtags to an array
    if (typeof newValue.hashtags === 'string') {
      update.hashtags = [
        ...new Set(
          newValue.hashtags
            .split('#')
            .map((h) => h.trim())
            .filter((h) => h),
        ),
      ];
    }

    if (typeof newValue.hashtags_pt === 'string') {
      update.hashtags_pt = [
        ...new Set(
          newValue.hashtags_pt
            .split('#')
            .map((h) => h.trim())
            .filter((h) => h),
        ),
      ];
    }

    let locations = [];

    if (
      (newValue.locations &&
        JSON.stringify(oldValue.locations) !==
          JSON.stringify(newValue.locations)) ||
      (!newValue.locations && newValue.location)
    ) {
      if (newValue.location) {
        newValue.locations = [string_to_slug(newValue.location)];
        update.location = FieldValue.delete();
      }

      const db = getFirestore();
      const country = await db
        .collection('countries')
        .doc(newValue.country)
        .get();

      const city = country.data().cities.find((c) => c.slug === newValue.city);

      if (city.main_city) {
        newValue.city = city.main_city;
      }

      const locationsSnapshot = await db
        .collection('countries')
        .doc(newValue.country)
        .collection('cities')
        .doc(newValue.city)
        .collection('locations')
        .where(
          'slug',
          'in',
          newValue.locations.map((l) => string_to_slug(l)),
        )
        .get();

      locationsSnapshot.forEach((doc) => {
        const data = doc.data();

        locations.push({
          name: data.name,
          name_pt: data.name_pt || null,
          alternative_names: data.alternative_names || [],
          slug: data.slug,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
        });

        if (!oldValue.locations || !oldValue.locations.includes(data.slug)) {
          let key = getTotalKey(newValue.type);

          doc.ref.update({
            totals: {
              ...data.totals,
              [key]: (data.totals[key] || 0) + 1,
            },
          });
        }
      });

      update.location_data = locations;
      update.hashtags = [
        ...new Set(
          [
            newValue.hashtags,
            locations.map((l) => l.slug.replaceAll('-', '')),
          ].flat(),
        ),
      ];
      update.hashtags_pt = [
        ...new Set(
          [
            newValue.hashtags_pt,
            locations.map((l) => l.slug.replaceAll('-', '')),
          ].flat(),
        ),
      ];
    }

    if (newValue.location && locations.length === 0) {
      const db = getFirestore();
      const country = await db
        .collection('countries')
        .doc(newValue.country)
        .get();

      const city = country.data().cities.find((c) => c.slug === newValue.city);

      if (city.main_city) {
        newValue.city = city.main_city;
      }

      const [locationEn, locationPt] = newValue.location.split(' $ ');
      const slug = string_to_slug(locationEn);
      const key = getTotalKey(newValue.type);

      const theNewLocation = {
        slug,
        city: newValue.city,
        country: newValue.country,
        name: locationEn,
        totals: {
          posts: 0,
          stories: 0,
          photos360: 0,
          maps: 0,
          videos: 0,
          shorts: 0,
          [key]: 1,
        },
      };

      if (locationPt) {
        theNewLocation.name_pt = locationPt;
      }

      if (newValue.longitude && newValue.latitude) {
        theNewLocation.longitude = newValue.longitude;
        theNewLocation.latitude = newValue.latitude;
      }

      if (newValue.alternative_names) {
        theNewLocation.alternative_names = newValue.alternative_names;
      }

      if (newValue.alternative_name) {
        theNewLocation.alternative_names = [newValue.alternative_name];
      }

      db.doc(
        `/countries/${newValue.country}/cities/${newValue.city}/locations/${slug}`,
      ).set(theNewLocation, { merge: true });

      update.location_data = [theNewLocation];
      update.locations = [slug];
      update.hashtags = [
        ...new Set([
          ...newValue.hashtags,
          slug.replaceAll('-', ''),
          ...(newValue.alternative_name
            ? [string_to_slug(newValue.alternative_name).replaceAll('-', '')]
            : []),
          ...(newValue.alternative_names
            ? newValue.alternative_names.map((l) =>
                string_to_slug(l).replaceAll('-', ''),
              )
            : []),
        ]),
      ];
      update.hashtags_pt = [
        ...new Set([
          ...newValue.hashtags_pt,
          locationPt
            ? string_to_slug(locationPt).replaceAll('-', '')
            : slug.replaceAll('-', ''),
          ...(newValue.alternative_name
            ? [string_to_slug(newValue.alternative_name).replaceAll('-', '')]
            : []),
          ...(newValue.alternative_names
            ? newValue.alternative_names.map((l) =>
                string_to_slug(l).replaceAll('-', ''),
              )
            : []),
        ]),
      ];
    }

    delete newValue.location;

    let promises = [];

    if (
      JSON.stringify(oldValue.hashtags) !== JSON.stringify(newValue.hashtags) ||
      (newValue.locations &&
        JSON.stringify(oldValue.locations) !==
          JSON.stringify(newValue.locations)) ||
      ((!oldValue.location || newValue.from_editor) && newValue.location)
    ) {
      const db = getFirestore();
      const batch = db.batch();
      const storage = getStorage();

      const sites = ['.com', '.com.br'];
      const sorts = ['desc', 'asc'];
      const bucket = storage.bucket('viajarcomale.appspot.com');

      [...new Set([...newValue.hashtags, ...newValue.hashtags_pt])].forEach(
        (hashtag) => {
          sorts.forEach((sort) => {
            batch.delete(
              db.doc(`caches/feeds/hashtags-cache/${hashtag}/sort/${sort}`),
            );
            batch.delete(
              db.doc(`caches/hashtags/hashtags-cache/${hashtag}/sort/${sort}`),
            );
          });

          try {
            sites.forEach((site) => {
              sorts.forEach((sort) => {
                const file = bucket.file(
                  `webstories/${site}-webstories-hashtags-${encodeURIComponent(
                    hashtag,
                  )}-${sort}.html`,
                );

                promises.push(
                  file.exists().then((exists) => {
                    if (exists[0]) {
                      return file.delete();
                    }
                  }),
                );
              });
            });
          } catch (e) {
            console.log(e);
          }
        },
      );

      if (newValue.locations) {
        newValue.locations.forEach((location) => {
          sorts.forEach((sort) => {
            batch.delete(
              db.doc(
                `caches/locations/locations-cache/${newValue.city}-${location}/sort/${sort}`,
              ),
            );
          });

          try {
            sites.forEach((site) => {
              sorts.forEach((sort) => {
                const file = bucket.file(
                  `webstories/${site}-webstories-countries-${newValue.country}-cities-${newValue.city}-locations-${location}-${sort}.html`,
                );

                promises.push(
                  file.exists().then((exists) => {
                    if (exists[0]) {
                      return file.delete();
                    }
                  }),
                );
              });
            });
          } catch (e) {
            console.log(e);
          }
        });
      }

      if (newValue.type === 'story') {
        sorts.forEach((sort) => {
          batch.delete(
            db.doc(
              `caches/stories/stories-cache/${newValue.city}/sort/${sort}`,
            ),
          );
        });

        try {
          sites.forEach((site) => {
            sorts.forEach((sort) => {
              const file = bucket.file(
                `webstories/${site}-webstories-countries-${newValue.country}-cities-${newValue.city}-stories-${sort}.html`,
              );

              promises.push(
                file.exists().then((exists) => {
                  if (exists[0]) {
                    return file.delete();
                  }
                }),
              );
            });
          });
        } catch (e) {
          console.log(e);
        }
      } else {
        sorts.forEach((sort) => {
          [...Array(10).keys()].forEach((index) => {
            batch.delete(
              db.doc(
                `caches/countries/countries-cache/${
                  newValue.country
                }/country/page/${index + 1}/sort/${sort}`,
              ),
            );

            batch.delete(
              db.doc(
                `caches/countries/countries-cache/${newValue.country}/${
                  newValue.city
                }/page/${index + 1}/sort/${sort}`,
              ),
            );
          });
        });
      }

      promises.push(batch.commit());
    }

    if (newValue.from_editor) {
      update.from_editor = FieldValue.delete();
    }

    if (Object.keys(update).length === 0) {
      return Promise.all(promises);
    }

    promises.push(event.data.after.ref.update(update));

    return Promise.all(promises);
  },
);

exports.onLocationUpdated = onDocumentUpdated(
  '/countries/{countryId}/cities/{cityId}/locations/{locationId}',
  async (event) => {
    const oldValue = event.data.before.data();
    const newValue = event.data.after.data();

    const db = getFirestore();
    const batch = db.batch();

    if (oldValue.slug !== newValue.slug || oldValue.city !== newValue.city) {
      batch.set(
        db.doc(
          `/countries/${newValue.country}/cities/${newValue.city}/locations/${newValue.slug}`,
        ),
        newValue,
      );
    }

    if (
      oldValue.name !== newValue.name ||
      oldValue.name_pt !== newValue.name_pt ||
      oldValue.slug !== newValue.slug ||
      oldValue.city !== newValue.city ||
      oldValue.latitude !== newValue.latitude ||
      oldValue.longitude !== newValue.longitude ||
      JSON.stringify(oldValue.alternative_names) !==
        JSON.stringify(newValue.alternative_names)
    ) {
      let countryData = null;
      let cityData = null;

      if (oldValue.city !== newValue.city) {
        const countryRef = await db
          .collection('countries')
          .doc(newValue.country)
          .get();

        countryData = countryRef.data();
        cityData = countryData.cities.find((c) => c.slug === newValue.city);
      }

      const mediasSnapshot = await db
        .collection('countries')
        .doc(newValue.changing_country || oldValue.country)
        .collection('cities')
        .doc(oldValue.city)
        .collection('medias')
        .where('locations', 'array-contains', oldValue.slug)
        .get();

      mediasSnapshot.forEach((doc) => {
        let locationData = doc.data().location_data;
        let locations = doc.data().locations;

        if (locationData) {
          const locationDataIndex = locationData.findIndex(
            (l) => l.slug === oldValue.slug,
          );

          if (locationData[locationDataIndex]) {
            locationData[locationDataIndex] = newValue;
          }

          if (newValue.slug !== oldValue.slug) {
            const locationIndex = locations.findIndex(
              (l) => l === oldValue.slug,
            );

            if (locationData[locationIndex]) {
              locations[locationIndex] = newValue.slug;
            }
          }
        } else {
          locationData = [newValue];
        }

        const mediaUpdate = {
          city: newValue.city,
          country: newValue.country,
          ...(countryData
            ? {
                cityData: {
                  name: cityData.name,
                  name_pt: cityData.name_pt ? cityData.name_pt : null,
                  slug: cityData.slug,
                  end: cityData.end,
                },
                countryData: {
                  name: countryData.name,
                  name_pt: countryData.name_pt ? countryData.name_pt : null,
                  slug: countryData.slug,
                  iso: countryData.iso,
                },
              }
            : null),
          locations,
          location_data: locationData.map((l) => ({
            name: l.name,
            name_pt: l.name_pt || null,
            slug: l.slug,
            alternative_names: l.alternative_names || [],
            latitude: l.latitude || null,
            longitude: l.longitude || null,
          })),
          location_update: true,
        };

        batch.update(doc.ref, mediaUpdate);
      });
    }

    return batch.commit();
  },
);

exports.onHashtagUpdated = onDocumentUpdated(
  '/hashtags/{hashtagId}',
  async (event) => {
    const oldValue = event.data.before.data();
    const newValue = event.data.after.data();

    const db = getFirestore();
    const batch = db.batch();

    if (oldValue.name !== newValue.name) {
      batch.set(db.doc(`/hashtags/${newValue.name}`), newValue);
    }
    if (
      oldValue.name !== newValue.name ||
      oldValue.name_pt !== newValue.name_pt
    ) {
      const mediasSnapshot = await db
        .collectionGroup('medias')
        .where('hashtags', 'array-contains', oldValue.name)
        .orderBy('order', 'desc')
        .get();

      mediasSnapshot.forEach((doc) => {
        let hashtags = [...new Set(doc.data().hashtags)];
        let hashtags_pt = [...new Set(doc.data().hashtags_pt)];

        const hashtagIndex = hashtags.findIndex((l) => l === oldValue.name);

        hashtags[hashtagIndex] = newValue.name;

        const hashtagPtIndex = hashtags_pt.findIndex(
          (l) => l === oldValue.name,
        );

        const hashtagPtPtIndex = hashtags_pt.findIndex(
          (l) => l === oldValue.name_pt,
        );

        if (hashtags_pt[hashtagPtIndex]) {
          hashtags_pt[hashtagPtIndex] = newValue.name_pt || newValue.name;
        }

        if (hashtags_pt[hashtagPtPtIndex]) {
          hashtags_pt[hashtagPtPtIndex] = newValue.name_pt;
        }

        if (
          !hashtags_pt[hashtagPtIndex] &&
          !hashtags_pt[hashtagPtPtIndex] &&
          newValue.name_pt
        ) {
          hashtags_pt.push(newValue.name_pt);
        }

        const mediaUpdate = {
          hashtags,
          hashtags_pt,
        };

        batch.update(doc.ref, mediaUpdate);
      });
    }

    return batch.commit();
  },
);

// exports.createPostEveryThirtyMinutes = onSchedule(
//   '*/30 11-23 * * *',
//   createPost
// );
// exports.createPixelfedPostEveryThirtyMinutes = onSchedule(
//   '*/30 11-23 * * *',
//   createPixelfedPost
// );

// ============================================
// Push Notifications
// ============================================

// HTTP function to subscribe a token to a topic
exports.subscribeToTopic = onRequest(
  { cors: ['https://travelwithalefe.com', 'https://viajarcomale.com.br'] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const { token, topic } = req.body;

    if (!token || !topic) {
      res.status(400).send('Missing token or topic');
      return;
    }

    // Validate topic name
    const validTopics = ['daily-content-en', 'daily-content-pt'];
    if (!validTopics.includes(topic)) {
      res.status(400).send('Invalid topic');
      return;
    }

    try {
      const messaging = getMessaging();
      await messaging.subscribeToTopic([token], topic);
      console.log(`Successfully subscribed token to topic ${topic}`);
      res.status(200).json({ success: true, topic });
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      res.status(500).send('Error subscribing to topic');
    }
  },
);

// HTTP function to unsubscribe a token from a topic
exports.unsubscribeFromTopic = onRequest(
  { cors: ['https://travelwithalefe.com', 'https://viajarcomale.com.br'] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const { token, topic } = req.body;

    if (!token || !topic) {
      res.status(400).send('Missing token or topic');
      return;
    }

    try {
      const messaging = getMessaging();
      await messaging.unsubscribeFromTopic([token], topic);
      console.log(`Successfully unsubscribed token from topic ${topic}`);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      res.status(500).send('Error unsubscribing from topic');
    }
  },
);

// Helper: Get random media from pages/random document
async function getRandomMedia() {
  const db = getFirestore();
  const randomDoc = await db.collection('pages').doc('random').get();

  if (!randomDoc.exists) {
    console.error('pages/random document does not exist');
    return null;
  }

  const data = randomDoc.data();
  const allMedia = data.value || [];

  if (allMedia.length === 0) {
    console.error('No media found in pages/random');
    return null;
  }

  // Select a random item
  const randomIndex = Math.floor(Math.random() * allMedia.length);
  return allMedia[randomIndex];
}

// Helper: Generate content URL from media object
function mediaToUrl(media) {
  const typeToPath = {
    post: 'posts',
    story: 'stories',
    '360photo': '360-photos',
    youtube: 'videos',
    'short-video': 'short-videos',
    maps: 'maps',
  };

  // Process the media ID
  let mediaId = media.id
    .replace(media.city + '-post-', '')
    .replace(media.city + '-story-', '')
    .replace(media.city + '-youtube-', '')
    .replace(media.city + '-short-video-', '')
    .replace(media.city + '-360photo-', '')
    .replace(media.city + '-maps-', '')
    .replace('road-trip-sea-las-story-', '')
    .replace('road-trip-sea-las-post-', '');

  // Construct the URL
  const url = `/countries/${media.country}/cities/${media.city}/${
    typeToPath[media.type]
  }/${mediaId}`;

  return url;
}

// Helper: Build notification payload for English topic
function buildNotificationPayload(media) {
  const locationName = media.location_data
    ? media.location_data.map((l) => l.name).join(', ')
    : '';
  const cityName = media.cityData?.name || '';
  const countryName = media.countryData?.name || '';

  const bodyParts = [];
  if (locationName) bodyParts.push(`Place: ${locationName}`);
  if (cityName) bodyParts.push(`City: ${cityName}`);
  if (countryName) bodyParts.push(countryName);

  const body =
    bodyParts.slice(1).join(', ') || 'Check out this travel content!';
  const contentUrl = mediaToUrl(media);

  if (media.file.includes('.mp4')) {
    media.file = media.file.replace('.mp4', '-thumb.png');
  }

  return {
    topic: 'daily-content-en',
    notification: {
      title: bodyParts[0] || 'Travel with Alefe',
      body: body,
      imageUrl: `https://storage.googleapis.com/files.viajarcomale.com/resize/500${media.file}`,
    },
    webpush: {
      fcmOptions: {
        link: `https://travelwithalefe.com${contentUrl}`,
      },
      notification: {
        icon: 'https://travelwithalefe.com/icons/192x192.png',
        badge: 'https://travelwithalefe.com/icons/96x96.png',
      },
    },
    data: {
      url: contentUrl,
      contentType: media.type,
      contentId: media.id,
      lang: 'en-US',
    },
  };
}

// Helper: Build notification payload for Portuguese topic
function buildNotificationPayloadPt(media) {
  const locationName = media.location_data
    ? media.location_data.map((l) => l.name_pt || l.name).join(', ')
    : '';
  const cityName = media.cityData?.name_pt || media.cityData?.name || '';
  const countryName =
    media.countryData?.name_pt || media.countryData?.name || '';

  const bodyParts = [];
  if (locationName) bodyParts.push(`Local: ${locationName}`);
  if (cityName) bodyParts.push(`Cidade: ${cityName}`);
  if (countryName) bodyParts.push(countryName);

  const body =
    bodyParts.slice(1).join(', ') || 'Confira este conteúdo de viagem!';
  const contentUrl = mediaToUrl(media);

  return {
    topic: 'daily-content-pt',
    notification: {
      title: bodyParts[0] || 'Viajar com Alê',
      body: body,
      imageUrl: `https://storage.googleapis.com/files.viajarcomale.com/resize/500${media.file}`,
    },
    webpush: {
      fcmOptions: {
        link: `https://viajarcomale.com.br${contentUrl}`,
      },
      notification: {
        icon: 'https://viajarcomale.com.br/icons/192x192.png',
        badge: 'https://viajarcomale.com.br/icons/96x96.png',
      },
    },
    data: {
      url: contentUrl,
      contentType: media.type,
      contentId: media.id,
      lang: 'pt-BR',
    },
  };
}

// Scheduled function: Send daily notification at 3:00 PM UTC
exports.sendDailyNotification = onSchedule('0 15,21 * * *', async () => {
  console.log('Starting daily notification job...');

  try {
    // Get random media
    const randomMedia = await getRandomMedia();

    if (!randomMedia) {
      console.error('No media available for notification');
      return;
    }

    console.log(
      `Selected random media: ${randomMedia.id} (${randomMedia.type})`,
    );

    // Fetch and log the specific media document based on the random media
    const db = getFirestore();
    const docRef = db
      .collection('countries')
      .doc(randomMedia.country)
      .collection('cities')
      .doc(randomMedia.city)
      .collection('medias')
      .doc(randomMedia.id);
    const doc = await docRef.get();
    const media = doc.data();

    const messaging = getMessaging();

    // Build payloads for both languages
    const payloadEn = buildNotificationPayload(media);
    const payloadPt = buildNotificationPayloadPt(media);

    // Send to English topic
    try {
      const responseEn = await messaging.send(payloadEn);
      console.log(
        'Successfully sent notification to English topic:',
        responseEn,
      );
    } catch (error) {
      console.error('Error sending to English topic:', error);
    }

    // Send to Portuguese topic
    try {
      const responsePt = await messaging.send(payloadPt);
      console.log(
        'Successfully sent notification to Portuguese topic:',
        responsePt,
      );
    } catch (error) {
      console.error('Error sending to Portuguese topic:', error);
    }

    console.log('Daily notification job completed');
  } catch (error) {
    console.error('Error in daily notification job:', error);
  }
});
