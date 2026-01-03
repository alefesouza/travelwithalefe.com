import useHost from './hooks/use-host';
import defaultMetadata from './utils/default-metadata';
import Sidebar from './components/sidebar';

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();

  const defaultMeta = defaultMetadata();

  return {
    ...defaultMeta,
    alternates: {
      ...defaultMeta.alternates,
      types: {
        'application/rss+xml': host('/rss'),
      },
    },
  };
}

export default async function Home() {
  return <Sidebar />;
}
