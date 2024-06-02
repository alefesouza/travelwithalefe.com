var admin = require('firebase-admin');
admin.initializeApp();

const hashtags = [
  'airportlounge',
  'airport',
  'airplanes',
  'airplaneviews',
  'food',
  'cityviews',
  'ferriswheel',
  'observationdeck',
  'bridges',
  'monuments',
  'typicalfood',
  'poutine',
  'square',
  'church',
  'cathedral',
  'building',
  'indianfood',
  'museums',
  'mexicanfood',
  'tacos',
  'ramen',
  'japanesefood',
  'taco',
  'movies',
  'zoo',
  'penguins',
  'planetarium',
  'Montreal',
  'Botanical',
  'Garden',
  '$',
  'Jardin',
  'Botanique',
  'de',
  'Montréal',
  'botanicalgarden',
  'garden',
  'muzzarellasticks',
  'chinatown',
  'macaws',
  'monkeys',
  'weather',
  'farm',
  'software',
  'oldsoftware',
  'coincidences',
  'music',
  'macncheese',
  'bees',
  'cafe',
  'landscapes',
  'golf',
  'drone',
  'djimini4pro',
  'trail',
  'train',
  'drinks',
  '',
  'establishments',
  'citysigns',
  'water',
  'sea',
  'animals',
  'cat',
  'lizard',
  'castle',
  'castles',
  'insta360',
  'insta360x3',
  'bullettime',
  'sunset',
  'mexican',
  'waterfall',
  'nationalparks',
  'breakfast',
  'river',
  'beaches',
  'beach',
  'Playa',
  'Luquillo',
  'pinacolada',
  'dog',
  'cave',
  'naturalmonuments',
  'rooster',
  'airplane',
  'cars',
  'cats',
  'parks',
  'dogs',
  'bobmarley',
  'churches',
  'graffiti',
  'funny',
  'snacks',
  'icecream',
  'peacock',
  'mountains',
  'zipline',
  'filming',
  'eating',
  'driving',
  'roadway',
  'coins',
  'statues',
  'walking',
  'ocean',
  'swing',
  'boat',
  'caves',
  'working',
  'resort',
];

const { Storage } = require('@google-cloud/storage');

const storage = new Storage();

async function deleteFile() {
  for (hashtag of hashtags.slice(0, 50)) {
    console.log(hashtag);

    const bucketName = 'viajarcomale.appspot.com';

    if (
      await storage
        .bucket(bucketName)
        .file('webstories/.com-webstories-hashtags-' + hashtag + '-asc.html')
        .exists()[0]
    ) {
      await storage
        .bucket(bucketName)
        .file('webstories/.com-webstories-hashtags-' + hashtag + '-asc.html')
        .delete();
    }

    if (
      await storage
        .bucket(bucketName)
        .file('webstories/.com-webstories-hashtags-' + hashtag + '-desc.html')
        .exists()[0]
    ) {
      await storage
        .bucket(bucketName)
        .file('webstories/.com-webstories-hashtags-' + hashtag + '-desc.html')
        .delete();
    }

    if (
      await storage
        .bucket(bucketName)
        .file('webstories/.com.br-webstories-hashtags-' + hashtag + '-asc.html')
        .exists()[0]
    ) {
      await storage
        .bucket(bucketName)
        .file('webstories/.com.br-webstories-hashtags-' + hashtag + '-asc.html')
        .delete();
    }

    if (
      await storage
        .bucket(bucketName)
        .file(
          'webstories/.com.br-webstories-hashtags-' + hashtag + '-desc.html'
        )
        .exists()[0]
    ) {
      await storage
        .bucket(bucketName)
        .file(
          'webstories/.com.br-webstories-hashtags-' + hashtag + '-desc.html'
        )
        .delete();
    }

    console.log(`gs://${bucketName}/webstories/hashtag deleted`);
  }
}

deleteFile().catch(console.error);
