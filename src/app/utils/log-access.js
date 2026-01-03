import { FieldValue } from 'firebase-admin/firestore';
// import { headers } from 'next/headers';
import useHost from '@/app/hooks/use-host';

export default async function logAccess(path) {
  // if (ignoreAnalytics) {
  return;
  // }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';

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
