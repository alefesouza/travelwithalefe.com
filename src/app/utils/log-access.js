import { FieldValue } from 'firebase-admin/firestore';
import { headers } from 'next/headers';
import useHost from '@/app/hooks/use-host';
import getCookie from './get-cookies';

export default function logAccess(path) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const ignoreAnalytics =
    getCookie('ignore_analytics') ||
    host().includes('localhost') ||
    (headersList.get('x-pathname').includes('/webstories') &&
      headersList.get('x-searchparams').includes('ignore_analytics=true'));

  // if (ignoreAnalytics) {
  return;
  // }

  const db = getFirestore();
  const random = Math.floor(Math.random() * 1000);

  db.collection('accesses')
    .doc('accesses')
    .collection(new Date().toISOString().split('T')[0])
    .doc(
      path
        .replace('https://viajarcomale', '')
        .replace('https://travelwithalefe', '')
        .replaceAll('/', '-')
    )
    .set(
      {
        accesses: FieldValue.increment(1),
        accessDates: FieldValue.arrayUnion(new Date().toISOString()),
        ipAddresses: FieldValue.arrayUnion(
          (headers().get('x-forwarded-for') || '') + '-' + random
        ),
        isBot: FieldValue.arrayUnion(
          (userAgent.toLowerCase().includes('bot') || userAgent === 'node') +
            '-' +
            random
        ),
        userAgents: FieldValue.arrayUnion(userAgent + '-' + random),
        link: host(headersList.get('x-pathname')),
        lastAccessDate: new Date().toISOString(),
        lastIpAddress: headers().get('x-forwarded-for') || '',
        lastIsBot:
          userAgent.toLowerCase().includes('bot') || userAgent === 'node',
        lastUserAgent: userAgent,
      },
      { merge: true }
    );
}
