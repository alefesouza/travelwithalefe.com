import Link from 'next/link';
import { headers } from 'next/headers';
import useI18n from '@/app/hooks/use-i18n';

const NavbarLinks = () => {
  const headersList = headers();
  const i18n = useI18n();

  return (
    <ul className="navbar-nav">
      <li
        className={
          'nav-item' + (headersList.get('x-pathname') === '/' ? ' active' : '')
        }
      >
        <Link className="nav-link" href="/">
          {i18n('Home')}
        </Link>
      </li>
      <li
        className={
          'nav-item' +
          (headersList.get('x-pathname') === '/map' ? ' active' : '')
        }
      >
        <Link className="nav-link" href="/map">
          {i18n('Map')}
        </Link>
      </li>
      <li
        className={
          'nav-item' +
          (headersList.get('x-pathname') === '/hashtags' ? ' active' : '')
        }
      >
        <Link className="nav-link" href="/hashtags">
          {i18n('Hashtags')}
        </Link>
      </li>
      <li
        className={
          'nav-item' +
          (headersList.get('x-pathname') === '/about' ? ' active' : '')
        }
      >
        <Link className="nav-link" href="/about">
          {i18n('About')}
        </Link>
      </li>
    </ul>
  );
};

export default NavbarLinks;
