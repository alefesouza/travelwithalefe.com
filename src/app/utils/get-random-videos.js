import { shuffleArray } from './media-sorting';

export default async function getRandomVideos(db) {
  const randomMedias = await db.collection('pages').doc('random').get();
  const cachedMedias = randomMedias.exists ? randomMedias.data().value : [];
  const randomMediasShuffled = shuffleArray(
    cachedMedias.filter(
      (media) =>
        media.type === 'story' && media.file && media.file.includes('.mp4')
    )
  ).slice(0, 5);

  return randomMediasShuffled;
}
