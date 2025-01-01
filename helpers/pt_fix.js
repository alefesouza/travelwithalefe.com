medias.forEach((media) => {
  if (!media.hashtags) {
    return;
  }

  const hashtagsPt = media.hashtags.map((hashtag) => {
    const theHashtag = hashtags.find((h) => h.name === hashtag);

    if (!theHashtag) {
      return hashtag;
    }

    if (theHashtag.name_pt) {
      return theHashtag.name_pt;
    }

    return hashtag;
  });

  if (JSON.stringify(hashtagsPt) !== JSON.stringify(media.hashtags_pt)) {
    theBatch.update(doc(db, media.path), {
      hashtags_pt: media.hashtags_pt,
    });
  }
});

theBatch.commit();
