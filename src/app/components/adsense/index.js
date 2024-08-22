export default function AdSense({ isScroller, isTopBanner, isSidebar, style }) {
  return (
    <ins
      className={`adsbygoogle ${
        isSidebar ? 'sidebar_ad' : isTopBanner ? 'top_banner_ad' : ''
      }`}
      style={{
        display: 'block',
        textAlign: 'center',
        margin: '0 auto',
        height: isTopBanner ? null : isScroller ? 280 : 'auto',
        ...style,
      }}
      data-ad-client="ca-pub-6770185635428450"
      data-ad-slot={
        isTopBanner ? '8443499865' : isScroller ? '8751581776' : '2160336859'
      }
      data-ad-format={isTopBanner ? null : 'auto'}
      data-full-width-responsive={isScroller || isTopBanner ? 'false' : 'true'}
    />
  );
}
