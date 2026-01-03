import Link from 'next/link';

/**
 * @param {import('@/typings/components').SortPickerProps} props
 */
export default function SortPicker({
  i18n,
  sort,
  paginationBase,
  type,
  reverse = false,
}) {
  const sortOptions = [
    { name: 'Latest', value: 'desc' },
    { name: 'Oldest', value: 'asc' },
  ];

  const getHref = (optionValue) => {
    const basePath = paginationBase.split('?')[0].replace('/page/{page}', '');

    if (reverse) {
      return optionValue !== 'asc'
        ? basePath + '?sort=' + optionValue
        : basePath;
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
          <Link
            key={option.value}
            href={getHref(option.value)}
            scroll={false}
            prefetch={false}
          >
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
    </div>
  );
}
