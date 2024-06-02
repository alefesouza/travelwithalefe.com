const { translate } = require('@vitalets/google-translate-api');
const items = require('./items.json');
const fs = require('fs');

items
  .filter((item) => item.description && !item.description_pt)
  .slice(0, 30)
  .forEach(async (item) => {
    item.description_pt = item.description;
    const { text } = await translate(item.description, 'pt', 'en');
    console.log(text);
    item.description = text;

    fs.writeFileSync('helpers/items.json', JSON.stringify(items));
  });
