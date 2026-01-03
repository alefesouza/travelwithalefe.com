import Link from 'next/link';
import LocationsMap from '../components/locations-map';
import ShareButton from '../components/share-button';
import logAccess from '../utils/log-access';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME, USE_CACHE } from '../utils/constants';
import defaultMetadata from '../utils/default-metadata';
import useEditMode from '@/app/utils/use-edit-mode';
import { fetchLocations } from '../utils/map-helpers';

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();

  const title = i18n('Map') + ' - ' + i18n(SITE_NAME);
  const description = i18n('The map of the places I have been.');

  return defaultMetadata(title, description);
}

export default async function MapPage({ searchParams }) {
  const i18n = useI18n();
  const host = useHost();
  const editMode = await useEditMode(searchParams);

  const locations = await fetchLocations(USE_CACHE, editMode);

  logAccess(host('/map'));

  return (
    <div>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/" id="back-button" scroll={false} prefetch={false}>
            <img
              src={host('/images/back.svg')}
              alt={i18n('Back')}
              width="32px"
            />
          </Link>

          <ShareButton />
        </div>
      </div>

      <h2 style={{ textAlign: 'center' }}>{i18n('Places I have been')}</h2>
      <LocationsMap
        locations={locations}
        loadingText={i18n('Loading')}
        resetZoomText={i18n('Reset Zoom')}
        apiKey={process.env.NEXT_MAPS_API_KEY}
      />
    </div>
  );
}
