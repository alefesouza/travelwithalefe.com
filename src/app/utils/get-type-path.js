export default function getTypePath(type, isDb) {
  switch (type) {
    case 'story':
      return isDb ? 'story' : 'stories';
    case 'youtube':
      return isDb ? 'youtube' : 'videos';
    case 'short-video':
      return isDb ? 'shorts' : 'short-videos';
    case '360photo':
      return isDb ? '360photo' : '360-photos';
    case 'maps':
      return 'maps';
    default:
      return isDb ? 'post' : 'posts';
  }
}
