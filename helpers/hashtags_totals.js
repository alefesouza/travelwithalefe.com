const museums = collectionGroup(db, 'medias');
const querySnapshot = await getDocs(museums);

const medias = [];
querySnapshot.forEach((theDoc) => {
  const data = theDoc.data();

  medias.push(data);
});

const museums2 = collectionGroup(db, 'hashtags');
const querySnapshot2 = await getDocs(museums2);

querySnapshot2.forEach((theDoc) => {
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

theBatch.commit();
