import { redirect } from 'next/navigation';
import useHost from '@/app/hooks/use-host';

export async function GET() {
  const host = useHost();
  const isBR = process.env.NEXT_PUBLIC_LOCALE === 'pt-BR';

  redirect('https://alefesouza.com' + (isBR ? '.br' : '') + '/contact');
}
