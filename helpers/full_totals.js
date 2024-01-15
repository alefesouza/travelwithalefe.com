const countries = [];

const museums = collectionGroup(db, 'medias');
const querySnapshot = await getDocs(museums);

const medias = [];
querySnapshot.forEach((theDoc) => {
  const data = theDoc.data();

  medias.push(data);
});

const museums2 = collectionGroup(db, 'locations');
const querySnapshot2 = await getDocs(museums2);

querySnapshot2.forEach((theDoc) => {
  const data = theDoc.data();

  const totals = {
    stories: medias.filter(
      (c) =>
        c.country === data.country &&
        c.type === 'story' &&
        c.locations &&
        c.locations.includes(data.slug)
    ).length,
    posts: medias.filter(
      (c) =>
        c.country === data.country &&
        c.type === 'post' &&
        c.locations &&
        c.locations.includes(data.slug)
    ).length,
    photos360: medias.filter(
      (c) =>
        c.country === data.country &&
        c.type === '360photo' &&
        c.locations &&
        c.locations.includes(data.slug)
    ).length,
    videos: medias.filter(
      (c) =>
        c.country === data.country &&
        c.type === 'youtube' &&
        c.locations &&
        c.locations.includes(data.slug)
    ).length,
    shorts: medias.filter(
      (c) =>
        c.country === data.country &&
        c.type === 'short-video' &&
        c.locations &&
        c.locations.includes(data.slug)
    ).length,
    maps: medias.filter(
      (c) =>
        c.country === data.country &&
        c.type === 'maps' &&
        c.locations &&
        c.locations.includes(data.slug)
    ).length,
  };

  theBatch.update(doc(db, theDoc.ref.path), {
    total:
      (totals.stories || 0) +
      (totals.posts || 0) +
      (totals.photos360 || 0) +
      (totals.videos || 0) +
      (totals.shorts || 0) +
      (totals.maps || 0),
    totals: {
      ...totals,
    },
  });
});

const museums3 = collectionGroup(db, 'hashtags');
const querySnapshot3 = await getDocs(museums3);

querySnapshot3.forEach((theDoc) => {
  const data = theDoc.data();

  const totals = {
    stories: medias.filter(
      (c) => c.type === 'story' && c.hashtags && c.hashtags.includes(data.name)
    ).length,
    posts: medias.filter(
      (c) => c.type === 'post' && c.hashtags && c.hashtags.includes(data.name)
    ).length,
    photos360: medias.filter(
      (c) =>
        c.type === '360photo' && c.hashtags && c.hashtags.includes(data.name)
    ).length,
    videos: medias.filter(
      (c) =>
        c.type === 'youtube' && c.hashtags && c.hashtags.includes(data.name)
    ).length,
    shorts: medias.filter(
      (c) =>
        c.type === 'short-video' && c.hashtags && c.hashtags.includes(data.name)
    ).length,
    maps: medias.filter(
      (c) => c.type === 'maps' && c.hashtags && c.hashtags.includes(data.name)
    ).length,
  };

  theBatch.update(doc(db, theDoc.ref.path), {
    total:
      (totals.stories || 0) +
      (totals.posts || 0) +
      (totals.photos360 || 0) +
      (totals.videos || 0) +
      (totals.shorts || 0) +
      (totals.maps || 0),
    totals: {
      ...totals,
    },
  });
});

const museums4 = collectionGroup(db, 'countries');
const querySnapshot4 = await getDocs(museums4);

querySnapshot4.forEach((theDoc) => {
  const data = theDoc.data();

  data.cities.forEach((city) => {
    const totals = {
      stories: medias.filter(
        (c) =>
          c.country === data.slug && c.type === 'story' && c.city === city.slug
      ).length,
      posts: medias.filter(
        (c) =>
          c.country === data.slug && c.type === 'post' && c.city === city.slug
      ).length,
      photos360: medias.filter(
        (c) =>
          c.country === data.slug &&
          c.type === '360photo' &&
          c.city === city.slug
      ).length,
      videos: medias.filter(
        (c) =>
          c.country === data.slug &&
          c.type === 'youtube' &&
          c.city === city.slug
      ).length,
      shorts: medias.filter(
        (c) =>
          c.country === data.slug &&
          c.type === 'short-video' &&
          c.city === city.slug
      ).length,
      maps: medias.filter(
        (c) =>
          c.country === data.slug && c.type === 'maps' && c.city === city.slug
      ).length,
    };

    city.total =
      (totals.stories || 0) +
      (totals.posts || 0) +
      (totals.photos360 || 0) +
      (totals.videos || 0) +
      (totals.shorts || 0) +
      (totals.maps || 0);

    city.totals = totals;
  });

  const totals = {
    stories: medias.filter((c) => c.country === data.slug && c.type === 'story')
      .length,
    posts: medias.filter((c) => c.country === data.slug && c.type === 'post')
      .length,
    photos360: medias.filter(
      (c) => c.country === data.slug && c.type === '360photo'
    ).length,
    videos: medias.filter(
      (c) => c.country === data.slug && c.type === 'youtube'
    ).length,
    shorts: medias.filter(
      (c) => c.country === data.slug && c.type === 'short-video'
    ).length,
    maps: medias.filter((c) => c.country === data.slug && c.type === 'maps')
      .length,
  };

  data.total =
    (totals.stories || 0) +
    (totals.posts || 0) +
    (totals.photos360 || 0) +
    (totals.videos || 0) +
    (totals.shorts || 0) +
    (totals.maps || 0);

  data.totals = totals;

  theBatch.update(doc(db, theDoc.ref.path), data);
});

theBatch.commit();
