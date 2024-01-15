const {
  onDocumentCreated,
  onDocumentUpdated,
} = require('firebase-functions/v2/firestore');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

admin.initializeApp();

exports.onMediaCreated = onDocumentCreated(
  '/countries/{countryId}/cities/{mediaId}/medias/{mediaId}',
  async (event) => {
    const newValue = event.data.data();
    const update = {};

    // Set hashtags to an array
    if (typeof newValue.hashtags === 'string') {
      update.hashtags = newValue.hashtags
        .split('#')
        .map((h) => h.trim())
        .filter((h) => h);
    }

    const split = event.data.ref.path.split('/');
    update.country = split[1];

    update.createdAt = admin.firestore.FieldValue.serverTimestamp();

    return event.data.ref.update(update);
  }
);

exports.onMediaUpdated = onDocumentUpdated(
  '/countries/{countryId}/cities/{cityId}/medias/{mediaId}',
  async (event) => {
    const oldValue = event.data.before.data();
    const newValue = event.data.after.data();
    const update = {};

    // Set hashtags to an array
    if (typeof newValue.hashtags === 'string') {
      update.hashtags = newValue.hashtags
        .split('#')
        .map((h) => h.trim())
        .filter((h) => h);
    }

    if (
      !newValue.location_slug_update &&
      newValue.locations &&
      JSON.stringify(oldValue.locations) !== JSON.stringify(newValue.locations)
    ) {
      const db = getFirestore();
      const locationsSnapshot = await db
        .collection('countries')
        .doc(newValue.country)
        .collection('cities')
        .doc(newValue.city)
        .collection('locations')
        .where('slug', 'in', newValue.locations)
        .get();

      const locations = [];
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
          let key = '';

          switch (newValue.type) {
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

          doc.ref.update({
            totals: {
              ...data.totals,
              [key]: (data.totals[key] || 0) + 1,
            },
          });
        }
      });

      update.location_data = locations;
    }

    if (newValue.location_slug_update) {
      update.location_slug_update = FieldValue.delete();
    }

    return event.data.after.ref.update(update);
  }
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
          `/countries/${newValue.country}/cities/${newValue.city}/locations/${newValue.slug}`
        ),
        newValue
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
            (l) => l.slug === oldValue.slug
          );

          if (locationData[locationDataIndex]) {
            locationData[locationDataIndex] = newValue;
          }

          if (newValue.slug !== oldValue.slug) {
            const locationIndex = locations.findIndex(
              (l) => l === oldValue.slug
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
        };

        if (oldValue.slug !== newValue.slug) {
          mediaUpdate.location_slug_update = true;
        }

        batch.update(doc.ref, mediaUpdate);
      });
    }

    return batch.commit();
  }
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
          (l) => l === oldValue.name
        );

        const hashtagPtPtIndex = hashtags_pt.findIndex(
          (l) => l === oldValue.name_pt
        );

        if (hashtags_pt[hashtagPtIndex]) {
          hashtags_pt[hashtagPtIndex] = newValue.name_pt || newValue.name;
        }

        if (hashtags_pt[hashtagPtPtIndex]) {
          hashtags_pt[hashtagPtPtIndex] = newValue.name_pt;
        }

        const mediaUpdate = {
          hashtags,
          hashtags_pt,
        };

        batch.update(doc.ref, mediaUpdate);
      });
    }

    return batch.commit();
  }
);
