import { InfoWindowF, MarkerF } from '@react-google-maps/api';
import { useState } from 'react';

export default function Marker({
  location,
  setLocation,
  currentLocation,
  isBR,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setLocation(location);

    setIsOpen(!isOpen);
  };

  return (
    <MarkerF
      position={{
        lat: parseFloat(location.latitude),
        lng: parseFloat(location.longitude),
      }}
      onClick={handleClick}
    >
      {currentLocation.lng == location.longitude &&
        currentLocation.lat == location.latitude && (
          <InfoWindowF
            position={{
              lat: parseFloat(location.latitude),
              lng: parseFloat(location.longitude),
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <a
                href={
                  location.is_placeholder
                    ? '/countries/' +
                      location.country +
                      '/cities/' +
                      location.city
                    : '/countries/' +
                      location.country +
                      '/cities/' +
                      location.city +
                      '/locations/' +
                      location.slug
                }
                style={{ textDecoration: 'underline', color: '#2096cc' }}
                target="_blank"
              >
                {isBR && location.name_pt ? location.name_pt : location.name}
                {location.alternative_names && location.alternative_names.length
                  ? ' (' + location.alternative_names.join(', ') + ')'
                  : ''}
              </a>
            </div>
          </InfoWindowF>
        )}
    </MarkerF>
  );
}
