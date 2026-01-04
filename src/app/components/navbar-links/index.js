import Link from 'next/link';
import useI18n from '@/app/hooks/use-i18n';

const NavbarLinks = async () => {
  const i18n = useI18n();

  return (
    <ul className="navbar-nav">
      <li className="nav-item" suppressHydrationWarning>
        <Link className="nav-link" href="/videos" prefetch={false}>
          {i18n('Videos')}
        </Link>
      </li>
      <li className="nav-item" suppressHydrationWarning>
        <Link className="nav-link" href="/map" prefetch={false}>
          {i18n('Map')}
        </Link>
      </li>
      <li className="nav-item" suppressHydrationWarning>
        <Link className="nav-link" href="/hashtags" prefetch={false}>
          {i18n('Hashtags')}
        </Link>
      </li>
      <li className="nav-item" suppressHydrationWarning>
        <Link className="nav-link" href="/coupons" prefetch={false}>
          {i18n('Coupons')}
        </Link>
      </li>
      <li className="nav-item" suppressHydrationWarning>
        <Link className="nav-link" href="/about" prefetch={false}>
          {i18n('About')}
        </Link>
      </li>
    </ul>
  );
};

export default NavbarLinks;
