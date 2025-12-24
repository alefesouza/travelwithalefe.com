import { headers } from 'next/headers';
import langs from '../utils/langs';

export default function useI18n() {
  // const headersList = await headers();

  // const host =
  //   headersList.get('x-forwarded-host') && headersList.get('x-forwarded-host');
  const isBR = '' === 'viajarcomale.com.br';

  return (string, options = {}) => {
    let text = isBR && langs['pt-BR'][string] ? langs['pt-BR'][string] : string;

    Object.entries(options).forEach((keyVal) => {
      text = text.replaceAll(':' + keyVal[0] + ':', keyVal[1]);
    });

    return text;
  };
}
