export default function getTypeLabel(type, label) {
  let item = null;

  switch (type) {
    case 'story':
      item = 'story';
      break;
    case 'youtube':
      item = 'video';
      break;
    case 'short-video':
      item = 'short video';
      break;
    case '360photo':
      item = '360 photo';
      break;
    case 'maps':
      item = 'place photo';
      break;
    default:
      item = 'post';
      break;
  }

  return label + ' ' + item;
}
