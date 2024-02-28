'use client';

import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import Marker from './marker';
import { useState } from 'react';

export default function LocationsMap({
  locations,
  loadingText,
  resetZoomText,
  apiKey,
  mapContainerStyle,
  centerPosition,
  defaultZoom,
  withLoadButton,
  visitedLabel,
}) {
  const isBR =
    typeof window !== 'undefined' &&
    window.location.href.includes('viajarcomale.com.br');

  const [currentLocation, setCurrentLocation] = useState(
    centerPosition ? centerPosition : { lat: 0, lng: 0 }
  );
  const [center, setCenter] = useState(
    centerPosition ? centerPosition : { lat: 0, lng: 0 }
  );
  const [load, setLoad] = useState(!withLoadButton);

  let mapRef = null;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    language: isBR ? 'pt' : 'en',
    region: isBR ? 'BR' : 'US',
  });

  const setLocation = (location) => {
    const latLng = {
      lat: parseFloat(location.latitude),
      lng: parseFloat(location.longitude),
    };

    setCurrentLocation(latLng);

    if (
      mapRef.state.map.getZoom() <=
      (defaultZoom && defaultZoom <= 11 ? defaultZoom : 7)
    ) {
      setCenter(latLng);
      mapRef.state.map.setZoom(window.innerWidth < 493 ? 11 : 12);
    }
  };

  const resetZoom = () => {
    setCurrentLocation(
      centerPosition
        ? centerPosition
        : {
            lat: 0,
            lng: 0,
          }
    );
    mapRef.state.map.setZoom(
      defaultZoom
        ? defaultZoom
        : window.innerWidth <= 860
        ? 1
        : window.innerWidth <= 1024
        ? 1.6
        : window.innerWidth <= 1440
        ? 2
        : 2.6
    );

    if (centerPosition) {
      setCenter(centerPosition);
    }
  };

  return withLoadButton && !load ? (
    <div className="center_link" style={{ marginBottom: 0 }}>
      <button className="btn" onClick={() => setLoad(true)}>
        {visitedLabel}
      </button>
    </div>
  ) : !isLoaded ? (
    <div className="container-fluid" style={{ textAlign: 'center' }}>
      {loadingText}...
    </div>
  ) : (
    <div>
      <div className="center_link" style={{ marginBottom: 16 }}>
        <button onClick={resetZoom}>{resetZoomText}</button>
      </div>

      <GoogleMap
        ref={(ref) => (mapRef = ref)}
        mapContainerStyle={
          mapContainerStyle
            ? mapContainerStyle
            : {
                width: '100%',
                height: window.innerWidth < 493 ? '40vh' : '90vh',
              }
        }
        zoom={
          defaultZoom
            ? defaultZoom
            : window.innerWidth <= 860
            ? 1
            : window.innerWidth <= 1024
            ? 1.6
            : window.innerWidth <= 1440
            ? 2
            : 2.6
        }
        center={center}
        mapContainerClassName="map-container"
      >
        {locations.map((l, i) => (
          <Marker
            location={l}
            key={i}
            currentLocation={currentLocation}
            setLocation={setLocation}
            isBR={isBR}
          />
        ))}
      </GoogleMap>

      <div
        className="center_link"
        style={{ marginTop: 16, marginBottom: withLoadButton ? 0 : null }}
      >
        <button onClick={resetZoom}>{resetZoomText}</button>
      </div>
    </div>
  );
}
