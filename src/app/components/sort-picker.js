import Link from 'next/link';

/**
 * @param {import('@/typings/components').SortPickerProps} props
 */
export default function SortPicker({
  i18n,
  sort,
  paginationBase,
  type,
  isRandom,
  newShuffle,
  useCache,
}) {
  const sortOptions = [
    { name: 'Latest', value: 'desc' },
    { name: 'Oldest', value: 'asc' },
    { name: 'Random', value: 'random' },
  ];

  const getHref = (optionValue) => {
    const basePath = paginationBase.split('?')[0].replace('/page/{page}', '');

    if (optionValue === 'random') {
      return sort === 'random'
        ? basePath + '?sort=' + optionValue
        : basePath + '?sort=random';
    }

    return optionValue !== 'desc'
      ? basePath + '?sort=' + optionValue
      : basePath;
  };

  return (
    <div className="container-fluid">
      <div className="sort_picker">
        <span>{i18n('Sorting')}:</span>

        {sortOptions.map((option) => (
          <Link key={option.value} href={getHref(option.value)} scroll={false}>
            <label>
              <input
                type="radio"
                name={'sort-' + type}
                value={option.value}
                checked={sort === option.value}
                readOnly
              />
              {i18n(option.name)}
            </label>
          </Link>
        ))}
      </div>

      {isRandom && (
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <Link
            href={`?sort=random${useCache ? '' : '&shuffle=' + newShuffle}`}
            scroll={false}
            prefetch={false}
            className="shuffle"
          >
            <button className="btn btn-primary">{i18n('Shuffle')}</button>
          </Link>
        </div>
      )}
    </div>
  );
}
