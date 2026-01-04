import Link from 'next/link';

/**
 * @param {import('@/typings/components').MainLocationsProps} props
 */
export default function MainLocations({ locations, i18n, isBR, host }) {
  if (locations.length === 0) return null;

  return (
    <div className="container-fluid" style={{ marginTop: 16 }}>
      <b>{i18n('Main visited places')}</b>:{' '}
      {locations.map((location, index) => (
        <span key={location.slug}>
          <Link
            href={host(
              '/countries/' +
                location.country +
                '/cities/' +
                location.city +
                '/locations/' +
                location.slug
            )}
            target="_blank"
            prefetch={false}
          >
            {isBR && location.name_pt ? location.name_pt : location.name}
          </Link>
          {index < locations.length - 1 && ', '}
        </span>
      ))}
    </div>
  );
}
