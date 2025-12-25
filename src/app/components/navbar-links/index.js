import Link from 'next/link';
import { headers } from 'next/headers';
import useI18n from '@/app/hooks/use-i18n';

const NavbarLinks = async () => {
  const headersList = await headers();
  const i18n = await useI18n();

  return (
    <ul className="navbar-nav">
      <li
        className={
          'nav-item' + (headersList.get('x-pathname') === '/' ? ' active' : '')
        }
      >
        <Link className="nav-link" href="/" prefetch={false}>
          {i18n('Home')}
        </Link>
      </li>
      <li
        className={
          'nav-item' +
          (headersList.get('x-pathname') === '/map' ? ' active' : '')
        }
      >
        <Link className="nav-link" href="/map" prefetch={false}>
          {i18n('Map')}
        </Link>
      </li>
      <li
        className={
          'nav-item' +
          (headersList.get('x-pathname') === '/hashtags' ? ' active' : '')
        }
      >
        <Link className="nav-link" href="/hashtags" prefetch={false}>
          {i18n('Hashtags')}
        </Link>
      </li>
      <li
        className={
          'nav-item' +
          (headersList.get('x-pathname') === '/coupons' ? ' active' : '')
        }
      >
        <Link className="nav-link" href="/coupons" prefetch={false}>
          {i18n('Coupons')}
        </Link>
      </li>
      <li
        className={
          'nav-item' +
          (headersList.get('x-pathname') === '/about' ? ' active' : '')
        }
      >
        <Link className="nav-link" href="/about" prefetch={false}>
          {i18n('About')}
        </Link>
      </li>
    </ul>
  );
};

export default NavbarLinks;
