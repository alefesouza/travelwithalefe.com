# Travel with Alefe helpers

Functions used to update Firestore based on social networks data.

## Steps to add a new country from Instagram archive

- Download the country Twemoji flag on https://github.com/twitter/twemoji/tree/master/assets/72x72 and save it as "country-slug.png" on [../public/flags](../public/flags).
- Use the [./copy-data.html](./copy-data.html) to copy a existing country and make the modifications for the new one on top of it, you can get latitude and longitute by right clicking the location on Google Maps.
- Add the data you created to [../src/app/utils/countries.js](../src/app/utils/countries.js) too.
- Download the Instagram archive for the dates of your travel, you can choose to download `Content` only.
- On [./story_archive_converter.js](./story_archive_converter.js) update the `countriesData` with the created countries.
- On the Instagram archive, open your_instagram_activity/media/stories.html.
- Go to the last item, open the DevTools and add `data-city="city-slug"` and `data-country="country-slug"` to the container of the last item.

<img src="./images/Screenshot 2026-01-10 at 12.21.22 PM.png" alt="Example on the DevTools">

- Go to the first item of the next city, and `data-city="city-slug"` to it, and `data-city="country-slug"` if it is a new country, do it for all countries and cities.
- Paste the content of [./story_archive_converter.js](./story_archive_converter.js) in the DevTools console.

<img src="./images/Screenshot 2026-01-10 at 12.28.33 PM.png" alt="Example on the DevTools">

- Copy the output to a `the-stories.json` file in this directory.
- Run `node story_create_json.js` in this directory, it will generate the folder structure by country/city, rename the medias, and create thumbnails for every image and video in the `to_send` directory for uploading to Google Cloud Storage.
- Run `node translate.js` to translate the description from your original language to English and generate the `the-result.js` file.
- Run `firebase emulators:start` and access http://127.0.0.1:4001/firestore to open the Firebase Firestore emulator interface.
- Open [./copy-data.html](./copy-data.html) to copy the country data to Firestore.
- Open [./copy-result.html](./copy-result.html) to copy the generated data including all stories to Firestore.
- Check if the data was created successfully.
- Uncomment `connectFirestoreEmulator(db, '127.0.0.1', 8080);` on both files.
- Open the files again.
- The data should be copied to production Firestore.
- Stop the emulator and run `firebase emulators:start --only hosting` to start the App Hosting emulator connecting to the production database.
- Update [../src/app/utils/use-edit-mode.js](../src/app/utils/use-edit-mode.js) to:

```
const useEditMode = async () => {
  return {
    editMode: true,
    forceEditTextMode: process.env.FORCE_EDIT_TEXT_MODE === 'true',
    autoOpenEdit: true,
  };
};

export default useEditMode;
```

- Access [http://localhost:5002/](http://localhost:5002/) and open the new country.
- You can easily edit any information for each media in the edit mode.
- Open the stories for a city, then add `?search=hashtags,hashtags_pt,location&add_field=location` to the end of the url to filter the edit mode.
- You can easily edit the hashtags and location for each media, you can also add the following to the DevTools console, then click "Copy" to automatically copy the data to the media, then click `Save`.

```
window.copy = {
  "hashtags": [
    'airport', 'airportlounge'
  ],
  "hashtags_pt": [
    'aeroporto', 'salavipaeroporto'
  ],
  "location": "Aeroporto Internacional de Guarulhos",
}
```

<img src="./images/Screenshot 2026-01-10 at 3.31.02 PM.png" alt="Example on the DevTools">

- There's a Firebase Cloud Function that automatticaly create a location and update the media `location_data` when the `location` property does not exist.
- After adding the location and hashtags for all new medias, open the [./full-totals.html](./full-totals.html) file to update all countries, cities, locations and hashtags counts.
- In the console, copy all the output to:

  - ./backup/hashtags.js: Start the file with `const hashtags =` and then paste.
  - ./backup/locations.js: Start the file with `const locations =` and then paste.
  - ./backup/countries.js: Start the file with `const countries =` and then paste.
  - ./backup/medias.js: Start the file with `const medias =` and then paste.

- Open the [./previous-next.html](./previous-next.html) file to update the previous and next relation for all medias, update the ./backup/medias.js file with the output.
- Open the [./unkown-hashtags.html](./unkown-hashtags.html) file to generate the new hashtags, update the ./backup/medias.js file with the latest output.
- Open the [./make_random.html](./make_random.html) file to generate the random button and vertical video feed data.
- Update the [../src/app/utils/countries.js](../src/app/utils/countries.js) file with the updated country data from ./backup/countries.js.

It's done 🎉 now deploy the site to make the new country appear in production.
