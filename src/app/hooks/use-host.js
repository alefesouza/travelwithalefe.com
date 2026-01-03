export default async function useHost() {
  const firebaseURL =
    process.env.NODE_ENV === 'production'
      ? 'travelwithalefe.com'
      : 'localhost:3000';
  const protocol =
    process.env.NODE_ENV === 'production' ? 'https://' : 'http://';

  const baseURL = process.env.NEXT_PUBLIC_SITE_URL;

  return (path) => {
    return new URL(
      path,
      firebaseURL ? protocol + firebaseURL : baseURL
    ).toString();
  };
}
