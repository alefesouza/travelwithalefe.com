import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME } from '@/app/utils/constants';
import countries from '@/app/utils/countries';
import Link from 'next/link';
import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';

export default function Top() {
  const host = useHost();
  const i18n = useI18n();
  const isWindows =
    new UAParser(headers().get('user-agent')).getOS().name === 'Windows';

  return (
    <div className="profile">
      <Link href={host('/')}>
        <img
          src={host('profile-photo.jpg')}
          srcSet={host('profile-photo-2x.jpg') + ' 2x'}
          width={96}
          height={96}
          alt={i18n('Profile Photo')}
          className="profile_picture"
        />
      </Link>

      <Link href={host('/')}>
        <span className="profile_name">{i18n(SITE_NAME)}</span>
      </Link>

      <span className="profile_description">
        {countries.map((c, i) => (
          <>
            <Link href={'/countries/' + c.slug} key={c.name} prefetch={false}>
              {isWindows ? (
                <>
                  <img
                    src={host('/flags/' + c.slug + '.png')}
                    alt={i18n(c.name)}
                    width={18}
                    height={18}
                  />
                  &nbsp;
                </>
              ) : (
                c.flag
              )}
            </Link>
            {i % 14 === 0 && i > 0 && <br />}
          </>
        ))}
      </span>
    </div>
  );
}
