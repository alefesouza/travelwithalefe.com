import langs from '../utils/langs';

export default async function useI18n() {
  const isBR = process.env.NEXT_PUBLIC_LOCALE === 'pt-BR';

  return (string, options = {}) => {
    let text = isBR && langs['pt-BR'][string] ? langs['pt-BR'][string] : string;

    Object.entries(options).forEach((keyVal) => {
      text = text.replaceAll(':' + keyVal[0] + ':', keyVal[1]);
    });

    return text;
  };
}
