import messaging from '@react-native-firebase/messaging';
import {
  getPermissionsAsync,
  isAvailableAsync,
  PermissionResponse,
  PermissionStatus,
  requestPermissionsAsync,
} from 'expo-ads-admob';
import React, {createContext, useEffect, useState} from 'react';

type ConsentContent = {
  hasConsent: boolean;
};

const ConsentContext = createContext<ConsentContent>(undefined!);

/**
 * Keeps track of ad/tracking consent. Work in progress
 */
const ConsentProvider = ({children}: {children: any}) => {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      // ATT Consent
      const available = await isAvailableAsync();
      if (!available) {
        console.error('Admob not enabled');
        return;
      }

      const permissionResponse = await getPermissionsAsync();
      console.log(permissionResponse);
      setConsent(permissionResponse);

      // Push notification permission
      await messaging().requestPermission();
    };

    initialize();
  }, []);

  // Set ATT consent
  const setConsent = (response: PermissionResponse, canRepeat = true) => {
    switch (response.status) {
      case PermissionStatus.GRANTED:
        setHasConsent(true);
        break;
      case PermissionStatus.DENIED:
        setHasConsent(false);
        break;
      case PermissionStatus.UNDETERMINED:
        if (response.canAskAgain && canRepeat) {
          requestPermissionsAsync().then(newResponse =>
            setConsent(newResponse, false),
          );
        } else {
          setHasConsent(false);
        }
    }
  };

  return (
    <ConsentContext.Provider
      value={{
        hasConsent: hasConsent,
      }}>
      {children}
    </ConsentContext.Provider>
  );
};

export {ConsentContext, ConsentProvider};
