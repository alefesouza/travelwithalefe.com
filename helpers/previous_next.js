medias.forEach((media, i) => {
  if (!media.id.includes(media.city) && !media.id.includes('-')) {
    const split = media.path.split('/');
    media.id = split[split.length - 1];
  }
});

medias.sort((a, b) => {
  return a.id.localeCompare(b.id, 'en', { numeric: true });
});

medias.forEach((media, i) => {
  const before = medias[i - 1];
  const after = medias[i + 1];

  const [, beforeCountry, , beforeCity] = before ? before.path.split('/') : [];
  const [, afterCountry, , afterCity] = after ? after.path.split('/') : [];
  const [, country, , city] = media.path.split('/');

  if (
    before &&
    before.type == media.type &&
    beforeCity == city &&
    beforeCountry == country
  ) {
    media.previous = before.id;
  }

  if (
    after &&
    after.type == media.type &&
    afterCity == city &&
    afterCountry == country
  ) {
    media.next = after.id;
  }

  if (media.next || media.previous) {
    theBatch.update(doc(db, media.path), {
      previous: media.previous || null,
      next: media.next || null,
      id: media.id,
    });
  }
});

console.log(medias);

theBatch.commit();
