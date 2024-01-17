import Link from 'next/link';
import useI18n from '@/app/hooks/use-i18n';

export default function SortPicker({
  type,
  basePath,
  sort,
  newShuffle,
  isRandom,
}) {
  const i18n = useI18n();

  return (
    <div className="container-fluid">
      <div className="sort_picker">
        <span>{i18n('Sorting')}:</span>

        {[
          { name: 'Latest', value: 'desc' },
          { name: 'Oldest', value: 'asc' },
          { name: 'Random', value: 'random' },
        ].map((o) => (
          <Link
            key={o}
            href={
              o.value === 'random'
                ? sort === 'random'
                  ? basePath
                  : basePath + '?sort=random&shuffle=' + newShuffle
                : o.value !== 'desc'
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

      {sort === 'random' && (
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <Link
            href={'?sort=random&shuffle=' + newShuffle}
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
