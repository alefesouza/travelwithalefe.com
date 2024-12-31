'use client';

import { useState } from 'react';
import { JsonEditor } from 'json-edit-react';

const Editable = ({ item, path, forceEditTextMode, autoOpenEdit }) => {
  const [isEditMode, setIsEditMode] = useState(autoOpenEdit);
  const [isEditTextMode, setIsEditTextMode] = useState(forceEditTextMode);
  const [isLoading, setIsLoading] = useState(false);
  const [media, setMedia] = useState(JSON.parse(item));

  const onSave = () => {
    const { apps } = firebase;
    let app = null;

    if (apps.length <= 0) {
      const firebaseConfig = {
        apiKey: 'AIzaSyBwRPBNhCfGDLC8wdAkIlx9m5mba5gm_iA',
        authDomain: 'viajarcomale.firebaseapp.com',
        projectId: 'viajarcomale',
        storageBucket: 'viajarcomale.appspot.com',
        messagingSenderId: '207097887664',
        appId: '1:207097887664:web:b0f038dd322c756f77b475',
        measurementId: 'G-SGK9KS9BBN',
      };

      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = apps[0];
    }

    const db = app.firestore();

    setIsLoading(true);

    delete media.createdAt;

    db.doc(path)
      .update(media)
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
    return (
      <div style={{ textAlign: 'center' }}>
        <button onClick={() => setIsEditMode(true)}>Edit</button>
      </div>
    );
  }

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}
    >
      <div style={{ width: 500, overflow: 'auto' }}>
        <JsonEditor
          data={media}
          setData={setMedia}
          enableClipboard={false}
          collapse={1}
        />
      </div>

      <div>
        {isEditTextMode && (
          <textarea
            style={{ width: 500, height: 400 }}
            value={JSON.stringify(media, null, 2)}
            onChange={(e) => setMedia(JSON.parse(e.target.value))}
          />
        )}

        <div style={{ textAlign: 'center' }}>
          {!isEditTextMode && (
            <button
              onClick={() => setIsEditTextMode(true)}
              disabled={isLoading}
            >
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
      </div>
    </div>
  );
};

export default Editable;
