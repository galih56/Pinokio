import { useState, useEffect } from 'react';

type Position = GeolocationPosition;

function useGeoLocation() {
  const [coords, setCoords] = useState<{ latitude: number | null, longitude: number | null, altitude: number | null }>({ latitude: null, longitude: null, altitude: null });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    const watchID = navigator.geolocation.watchPosition(
      (position: Position) => {
        const { latitude, longitude, altitude } = position.coords;
        setCoords({ latitude, longitude, altitude });
      },
      (error: GeolocationPositionError) => {
        setError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchID);
  }, []);

  return { coords, error };
}

export default useGeoLocation;
