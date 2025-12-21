import LocationsMap from '../components/locations-map';
import { getFirestore } from 'firebase-admin/firestore';
import logAccess from '../utils/log-access';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME, USE_CACHE } from '../utils/constants';
import Link from 'next/link';
import ShareButton from '../components/share-button';
import defaultMetadata from '../utils/default-metadata';
import { theCachedLocations } from '../utils/cache-locations';
import countries from '../utils/countries';
import useEditMode from '@/app/utils/use-edit-mode';
import { headers } from 'next/headers';

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
  const editMode = useEditMode(searchParams);
  let locations = [];

  if (USE_CACHE) {
    locations = theCachedLocations.filter(
      (l) => l.latitude && l.longitude && !l.hide_in_map
    );

    countries.forEach((data) => {
      locations.push(
        ...data.cities
          .filter((c) => !c.hide_in_map)
          .map((c) => ({
            latitude: c.latitude,
            longitude: c.longitude,
            name: c.name,
            name_pt: c.name_pt || null,
            is_placeholder: true,
            city: c.slug,
            country: data.slug,
          }))
      );
    });
  } else {
    const cacheRef = '/caches/static_pages/static_pages/locations';

    const db = getFirestore();

    let cache = null;

    if (editMode) {
      cache = { exists: false };
    } else {
      cache = await db.doc(cacheRef).get();
    }

    let locations = [];

    if (!cache.exists) {
      const locationsSnapshot = await db.collectionGroup('locations').get();

      locationsSnapshot.forEach((photo) => {
        const data = photo.data();

        if (!data.latitude || !data.longitude) {
          return;
        }

        if (data.hide_in_map) {
          return;
        }

        locations = [...locations, data];
      });

      const countriesSnapshot = await db.collectionGroup('countries').get();
      countriesSnapshot.forEach((doc) => {
        const data = doc.data();

        locations.push(
          ...data.cities
            .filter((c) => !c.hide_in_map)
            .map((c) => ({
              latitude: c.latitude,
              longitude: c.longitude,
              name: c.name,
              name_pt: c.name_pt || null,
              is_placeholder: true,
              city: c.slug,
              country: data.slug,
            }))
        );
      });

      db.doc(cacheRef).set({
        locations,
        last_update: new Date().toISOString().split('T')[0],
        user_agent: headers().get('user-agent'),
      });
    } else {
      locations = cache.data().locations;
    }
  }

  logAccess(host('/map'));

  return (
    <div>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/" id="back-button" scroll={false}>
            <img
              src={host('/images/back.svg')}
              alt={i18n('Back')}
              width="32px"
            ></img>
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
