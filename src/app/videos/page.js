import { getFirestore } from 'firebase-admin/firestore';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME } from '../utils/constants';
import defaultMetadata from '../utils/default-metadata';
import logAccess from '../utils/log-access';
import VideoFeed from '../components/video-feed';
import getRandomVideos from '../utils/get-random-videos';

export function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();

  const title = i18n('Video Feed') + ' - ' + i18n(SITE_NAME);
  const description = i18n("Travel with Alefe's video feed.");

  return defaultMetadata(title, description, 'videos');
}

export default async function Videos() {
  const host = useHost();
  const i18n = useI18n();

  const db = getFirestore();

  const videos = await getRandomVideos(db);

  logAccess(host('/videos'));

  return (
    <VideoFeed
      openText={i18n('Open')}
      swipeUpText={i18n('Swipe up')}
      tapToUnmuteText={i18n('Tap to unmute')}
      refreshText={i18n('Refresh')}
      refreshingText={i18n('Refreshing')}
      homeText={i18n('Home')}
      iOSVideoFeedWarningMessage={i18n(
        'Due to iOS limitations, the following videos will be initially muted, please tap the video if you want to unmute it. Clicking the refresh button, the next 10 videos will be loaded with sound enabled.'
      )}
      initialVideos={videos}
    />
  );
}
