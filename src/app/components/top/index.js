import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME } from '@/app/utils/constants';
import countries from '@/app/utils/countries';
import { getCountryLink } from '@/app/utils/country-link-helper';
import Link from 'next/link';

export default async function Top() {
  const host = await useHost();
  const i18n = await useI18n();

  return (
    <div className="profile">
      <Link href={host('/')} prefetch={false}>
        <img
          src={host('profile-photo.jpg')}
          srcSet={host('profile-photo-2x.jpg') + ' 2x'}
          width={96}
          height={96}
          alt={i18n('Profile Photo')}
          className="profile_picture"
        />
      </Link>

      <Link href={host('/')} prefetch={false}>
        <span className="profile_name">{i18n(SITE_NAME)}</span>
      </Link>

      <span className="profile_description">
        {countries
          .sort((a, b) => a.order - b.order)
          .map((c, i) => (
            <span key={i}>
              <Link href={getCountryLink(c)} key={c.name} prefetch={false}>
                <span className="country-emoji-flag">{c.flag}</span>
              </Link>
              {i % 14 === 0 && i > 0 && <br />}
            </span>
          ))}
      </span>
    </div>
  );
}
