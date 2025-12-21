export default function getSort(
  searchParams,
  isWebStories,
  allowRandom = true
) {
  let sort =
    (searchParams.sort &&
      ['asc', 'desc', 'random'].includes(searchParams.sort) &&
      searchParams.sort) ||
    'desc';

  if (isWebStories) {
    if (!searchParams.sort || sort === 'desc') {
      sort = 'asc';
    } else if (sort === 'asc') {
      sort = 'desc';
    }
  }

  if (sort === 'random' && !allowRandom) {
    sort = 'desc';
  }

  return sort;
}
