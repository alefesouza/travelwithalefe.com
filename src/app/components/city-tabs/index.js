import Link from 'next/link';

/**
 * @param {import('@/typings/components').CityTabsProps} props
 */
export default function CityTabs({
  countrySlug,
  cities,
  currentCity,
  expandGalleries,
  sort,
  i18n,
  isBR,
}) {
  const getSortParam = () => {
    return sort !== 'desc' && sort !== 'random' ? '?sort=' + sort : '';
  };

  return (
    <ul className="nav nav-tabs">
      <Link
        className={`nav-link${!currentCity ? ' active' : ''}`}
        aria-current="page"
        href={
          `/countries/${countrySlug}${expandGalleries ? '/expand' : ''}` +
          (sort !== 'desc' ? '?sort=' + sort : '')
        }
      >
        {i18n('All')}
      </Link>
      {cities.map((city) => (
        <li key={city.slug} className="nav-item">
          <Link
            className={`nav-link${currentCity === city.slug ? ' active' : ''}`}
            aria-current="page"
            href={
              `/countries/${countrySlug}/cities/${city.slug}${
                expandGalleries ? '/expand' : ''
              }` + getSortParam()
            }
            prefetch={false}
          >
            {isBR && city.name_pt ? city.name_pt : city.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
