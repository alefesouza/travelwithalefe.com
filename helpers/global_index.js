const types = ['post', 'story', '360photo', 'short-video', 'youtube', 'maps'];

medias.sort((a, b) => {
  return a.id.localeCompare(b.id, 'en', { numeric: true });
});

types.forEach((type) => {
  medias
    .filter((a) => a.type === type)
    .sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    })
    .forEach((item, i) => {
      item.global_index = i;
    });
});

console.log(medias);

medias.forEach((item) => {
  const data = {
    global_index: item.global_index,
  };

  if (!item.createdAt) {
    data.createdAt = new Date(item.date);
  }

  const [, country, , city] = item.path.split('/');

  theBatch.update(
    doc(db, '/countries/' + country + '/cities/' + city + '/medias/' + item.id),
    data
  );
});

theBatch.commit();
