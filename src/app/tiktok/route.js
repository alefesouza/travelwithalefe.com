import { redirect } from 'next/navigation';

export async function GET() {
  return permanentRedirect('https://tiktok.com/@viajarcomale');
}
