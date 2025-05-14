import Link from 'next/link';
import useI18n from '@/app/hooks/use-i18n';

export default function SortPicker({
  type,
  basePath,
  sort,
}) {
  const i18n = useI18n();

  return (
    <div className="container-fluid">
      <div className="sort_picker">
        <span>{i18n('Sorting')}:</span>

        {[
          { name: 'Latest', value: 'desc' },
          { name: 'Oldest', value: 'asc' },
          // { name: 'Random', value: 'random' },
        ].map((o) => (
          <Link
            key={o}
            href={
              o.value !== 'desc'
                ? '?sort=' + o.value
                : basePath
            }
            scroll={false}
          >
            <label>
              <input
                type="radio"
                name={'sort-' + type}
                value={o.value}
                checked={sort === o.value}
                readOnly
              />
              {i18n(o.name)}
            </label>
          </Link>
        ))}
      </div>
    </div>
  );
}
