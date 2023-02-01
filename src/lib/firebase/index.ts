import Constants from 'expo-constants';
import { initializeApp } from 'firebase/app';

import 'firebase/auth';
import { getAuth } from 'firebase/auth';

const config = Constants.manifest?.extra;

/**
 * @see https://docs.expo.dev/guides/using-firebase/
 */

// For Firebase JS SDK v7.20.0 and later, measurementId is optional.
const firebaseConfig = {
  apiKey: config?.firebaseApiKey as string,
  authDomain: config?.firebaseAuthDomain as string,
  projectId: config?.firebaseProjectId as string,
  storageBucket: config?.firebaseStorageBucket as string,
  messagingSenderId: config?.firebaseMessagingSenderId as string,
  appId: config?.firebaseAppId as string,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
