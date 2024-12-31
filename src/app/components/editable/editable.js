'use client';

import { useState } from 'react';
import { JsonEditor } from 'json-edit-react';

const Editable = ({ item, path, forceEditTextMode, autoOpenEdit }) => {
  const params = new URLSearchParams(window.location.search);

  const search = params.get('search') || '';
  const height = params.get('height') || 'auto';
  const width = params.get('width') || '100%';
  const addField = params.get('add_field') || '';
  const fieldDefaultValue = params.get('field_default_value') || '';

  let theMedia = JSON.parse(item);

  if (addField) {
    theMedia[addField] = fieldDefaultValue;
  }

  const [isEditMode, setIsEditMode] = useState(
    autoOpenEdit || params.get('auto_open') === 'true'
  );
  const [isEditTextMode, setIsEditTextMode] = useState(
    forceEditTextMode || params.get('force_edit_text') === 'true'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [media, setMedia] = useState(theMedia);

  const onSave = () => {
    const { apps } = firebase;
    let app = null;
    let db;

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
      db = app.firestore();

      if (location.hostname === 'localhost') {
        db.useEmulator('127.0.0.1', 8080);
      }
    } else {
      app = apps[0];
      db = app.firestore();
    }

    setIsLoading(true);

    delete media.createdAt;
    media.from_editor = true;

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
      <div style={{ overflow: 'auto', width, height }}>
        <JsonEditor
          data={media}
          setData={setMedia}
          enableClipboard={false}
          collapse={1}
          searchFilter={({ key }, searchText) => {
            if (!searchText) {
              return true;
            }

            const split = searchText.split(',');

            return split.includes(key);
          }}
          searchText={search}
          defaultValue=""
          keySort={true}
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
