const countries = collection(db, 'countries/colombia/cities/medellin/medias');
const querySnapshot = await getDocs(museums);

const medias = [];
querySnapshot.forEach((theDoc) => {
  const data = theDoc.data();
  data.path = theDoc.ref.path;

  // medias.push(data);

  if (data.locationData && data.locationData.length > 0) {
    theBatch.update(doc(db, data.path), {
      locations: data.locationData.map((c) => c.slug),
    });
  }
});

console.log(medias);

theBatch.commit();
