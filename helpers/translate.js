const { translate } = require('@vitalets/google-translate-api');
const items = require('./the-result.json');
const fs = require('fs');

items
  .filter((item) => item.description && !item.description_pt)
  .slice(0, 30)
  .forEach(async (item) => {
    item.description_pt = item.description;
    const { text } = await translate(item.description, 'pt', 'en');
    console.log(text);
    item.description = text;

    fs.writeFileSync(
      'helpers/the-result.js',
      'const result = ' + JSON.stringify(items, null, 4)
    );
  });
