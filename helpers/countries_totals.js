const museums = collectionGroup(db, 'medias');
const querySnapshot = await getDocs(museums);

const medias = [];
querySnapshot.forEach((theDoc) => {
  const data = theDoc.data();

  medias.push(data);
});

const museums2 = collectionGroup(db, 'countries');
const querySnapshot2 = await getDocs(museums2);

querySnapshot2.forEach((theDoc) => {
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

  console.log(data);
  theBatch.update(doc(db, theDoc.ref.path), data);
});

theBatch.commit();
