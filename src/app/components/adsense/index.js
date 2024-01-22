export default function AdSense({ isScroller }) {
  return (
    <ins
      className="adsbygoogle"
      style={{
        display: 'block',
        textAlign: 'center',
        margin: '0 auto',
        height: isScroller ? 280 : 'auto',
      }}
      data-ad-client="ca-pub-6770185635428450"
      data-ad-slot={isScroller ? '8751581776' : '2160336859'}
      data-ad-format="auto"
      data-full-width-responsive={isScroller ? 'false' : 'true'}
    />
  );
}
