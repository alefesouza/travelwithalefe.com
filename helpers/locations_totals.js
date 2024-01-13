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

theBatch.commit();
