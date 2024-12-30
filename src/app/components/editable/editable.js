'use client';

import { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore/lite';
import { JsonEditor } from 'json-edit-react';

const Editable = ({ item, path, forceEditTextMode, autoOpenEdit }) => {
  const [isEditMode, setIsEditMode] = useState(autoOpenEdit);
  const [isEditTextMode, setIsEditTextMode] = useState(forceEditTextMode);
  const [isLoading, setIsLoading] = useState(false);
  const [media, setMedia] = useState(JSON.parse(item));

  const onSave = () => {
    const firebaseConfig = {
      apiKey: 'AIzaSyBwRPBNhCfGDLC8wdAkIlx9m5mba5gm_iA',
      authDomain: 'viajarcomale.firebaseapp.com',
      projectId: 'viajarcomale',
      storageBucket: 'viajarcomale.appspot.com',
      messagingSenderId: '207097887664',
      appId: '1:207097887664:web:b0f038dd322c756f77b475',
      measurementId: 'G-SGK9KS9BBN',
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    setIsLoading(true);

    delete media.createdAt;

    updateDoc(doc(db, path), media)
      .then((doc) => {
        console.log(doc);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  };

  if (!isEditMode) {
    return <button onClick={() => setIsEditMode(true)}>Edit</button>;
  }

  return (
    <div>
      <div style={{ width: '100%', height: 400, overflow: 'auto' }}>
        <JsonEditor
          data={media}
          setData={setMedia}
          enableClipboard={false}
          collapse={1}
        />
      </div>

      {isEditTextMode ? (
        <textarea
          style={{ width: '100%', height: 400 }}
          value={JSON.stringify(media, null, 2)}
          onChange={(e) => setMedia(JSON.parse(e.target.value))}
        />
      ) : (
        <button onClick={() => setIsEditTextMode(true)} disabled={isLoading}>
          Text Mode
        </button>
      )}

      <button onClick={onSave} disabled={isLoading}>
        Save
      </button>

      <button onClick={() => setIsEditMode(false)} disabled={isLoading}>
        Cancel
      </button>
    </div>
  );
};

export default Editable;
