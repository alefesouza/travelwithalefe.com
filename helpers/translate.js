const { translate } = require('@vitalets/google-translate-api');
const items = require('./the-result.json');
const fs = require('fs');

items
  .filter((item) => item.description && !item.description_pt)
  .forEach(async (item) => {
    const { text } = await translate(item.description, {
      from: 'en',
      to: 'pt',
    });
    console.log(text);
    item.description_pt = text;

    fs.writeFileSync(
      'helpers/the-result.js',
      'const result = ' + JSON.stringify(items, null, 4)
    );
  });
