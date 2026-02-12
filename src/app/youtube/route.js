import { redirect } from 'next/navigation';

export async function GET() {
  return permanentRedirect('https://youtube.com/c/alefesouza');
}
