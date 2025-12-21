export default function getSort(
  searchParams,
  isWebStories,
  allowRandom = true,
  defaultSort = 'desc'
) {
  let sort =
    (searchParams.sort &&
      ['asc', 'desc', 'random'].includes(searchParams.sort) &&
      searchParams.sort) ||
    defaultSort;

  if (isWebStories) {
    if (!searchParams.sort || sort === 'desc') {
      sort = 'asc';
    } else if (sort === 'asc') {
      sort = 'desc';
    }
  }

  if (sort === 'random' && !allowRandom) {
    sort = defaultSort;
  }

  return sort;
}
