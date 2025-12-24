import useHost from '@/app/hooks/use-host';

export default async function StructuredBreadcrumbs({ breadcrumbs }) {
  const host = await useHost();

  return (
    <script
      id="ld-breadcrumb"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: host(item.item),
          })),
        }),
      }}
    ></script>
  );
}
