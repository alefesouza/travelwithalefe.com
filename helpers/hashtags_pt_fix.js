const countryMedias = medias.filter((c) => c.country === 'colombia');

countryMedias.forEach((media) => {
  const hashtagsPt = [];

  media.hashtags.forEach((hashtag) => {
    const theHashtag = hashtags.find((h) => h.name === hashtag);

    if (theHashtag.name_pt) {
      hashtagsPt.push(theHashtag.name_pt);
    } else {
      hashtagsPt.push(hashtag);
    }
  });

  theBatch.update(doc(db, media.path), {
    hashtags_pt: hashtagsPt,
  });
});

theBatch.commit();
