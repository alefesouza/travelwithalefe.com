import { translate } from '@vitalets/google-translate-api';
import items from './the-result.json' with { type: "json" };
import fs from 'fs';

items
  .filter((item) => item.description && !item.description_pt)
  .forEach(async (item) => {
    const { text } = await translate(item.description, {
      from: 'pt',
      to: 'en',
    });

    console.log(item.description);

    item.description_pt = item.description;
    item.description = text;

    fs.writeFileSync(
      './the-result.js',
      'const result = ' + JSON.stringify(items, null, 4)
    );
  });
