export default function useHost() {
  const firebaseURL =
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_SITE_URL
      : 'http://localhost:3000';

  return (path) => {
    return new URL(path, firebaseURL).toString();
  };
}
