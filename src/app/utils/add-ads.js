const addAds = (medias) => {
  let inserted = 0;

  medias.forEach((_, i) => {
    if (
      i % 8 === 0 &&
      i !== 0 &&
      i < medias.length - 4 &&
      !medias.find((item) => item.id === 'ad-' + i)
    ) {
      medias.splice(i + inserted, 0, { type: 'ad', id: 'ad-' + i });
      inserted++;
    }
  });

  return medias;
};

export default addAds;
