const expandPosts = (items, expandGalleries, isWebStories, name) => {
  let expandedList = [];

  items.forEach((item) => {
    expandedList = [...expandedList, item];

    if (item.gallery && item.gallery.length) {
      const gallery = item.gallery.map((g, i) => ({
        ...item,
        ...g,
        is_gallery: true,
        img_index: i + 2,
      }));
      const itemWithHashtag = gallery.findIndex(
        (g) =>
          g.item_hashtags && g.item_hashtags.includes(name.replaceAll('-', ''))
      );

      if (itemWithHashtag > -1) {
        delete gallery[itemWithHashtag].is_gallery;
        expandedList[expandedList.length - 1] = gallery[itemWithHashtag];

        item.file_type = 'image';
        gallery[itemWithHashtag] = item;
      }

      if (
        (expandGalleries || (isWebStories && !item.is_compilation)) &&
        itemWithHashtag === -1
      ) {
        expandedList = [...expandedList, ...gallery];
      }
    }
  });

  return expandedList;
};

export default expandPosts;
