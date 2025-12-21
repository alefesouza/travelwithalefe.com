/**
 * Sort media items by date in descending order (newest first)
 * @param {import('@/typings/media').Media} a
 * @param {import('@/typings/media').Media} b
 * @returns {number}
 */
export function sortByDateDesc(a, b) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

/**
 * Sort media items by date in ascending order (oldest first)
 * @param {import('@/typings/media').Media} a
 * @param {import('@/typings/media').Media} b
 * @returns {number}
 */
export function sortByDateAsc(a, b) {
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

/**
 * Apply sorting to multiple media arrays
 * @param {import('@/typings/media').Media[][]} arrays
 * @param {'asc' | 'desc'} sortOrder
 * @returns {import('@/typings/media').Media[][]}
 */
export function sortMediaArrays(arrays, sortOrder) {
  const sortFn = sortOrder === 'desc' ? sortByDateDesc : sortByDateAsc;

  return arrays.map((array) => array.sort(sortFn));
}

/**
 * Shuffle array randomly
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
export function shuffleArray(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}
