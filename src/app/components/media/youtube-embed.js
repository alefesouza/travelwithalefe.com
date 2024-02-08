import styles from './youtube-embed.module.css';

export default function YouTubeEmbed({ media }) {
  let id = null;

  if (!media.is_photos) {
    const url = new URL(media.link);
    id = url.searchParams.get('v');
  } else {
    const split = media.youtube_link.split('/');
    id = split[split.length - 1];
  }

  return (
    <div
      className={!media.is_photos ? styles.video_container : null}
      data-youtube-id={id}
    >
      <iframe
        width={media.is_photos ? 325 : 560}
        height={media.is_photos ? 578 : 315}
        src={'https://www.youtube.com/embed/' + id}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
}
