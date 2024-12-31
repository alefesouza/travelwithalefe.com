import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import useHost from '@/app/hooks/use-host';

export async function GET(req) {
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const { searchParams } = new URL(req.url);

  if (searchParams.get('ignore_analytics') === 'true') {
    const oneYear = 3600 * 1000 * 24 * 365;
    cookies().set('__session', 'ignore_analytics=true&edit_mode=true', {
      maxAge: oneYear,
    });
    redirect(host('/'));
  }

  redirect('https://alefesouza.com' + (isBR ? '.br' : '') + '/contact');
}
