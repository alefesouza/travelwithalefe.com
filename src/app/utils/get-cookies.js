import { cookies } from 'next/headers';

export default async function getCookie(name) {
  const cookieStore = await cookies();

  if (!cookieStore.get('__session')) {
    return null;
  }

  const searchParams = new URLSearchParams(cookieStore.get('__session').value);

  return searchParams.get(name);
}
