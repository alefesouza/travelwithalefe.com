const expandPosts = (items, expandGalleries, isWebStories) => {
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
      const itemWithLocation = gallery.findIndex(
        (g) => g.item_locations && g.item_locations.includes(location)
      );

      if (itemWithLocation > -1) {
        delete gallery[itemWithLocation].is_gallery;
        expandedList[expandedList.length - 1] = gallery[itemWithLocation];

        item.file_type = 'image';
        gallery[itemWithLocation] = item;
      }

      if (expandGalleries || (isWebStories && !item.is_compilation)) {
        expandedList = [...expandedList, ...gallery];
      }
    }
  });

  return expandedList;
};

export default expandPosts;
