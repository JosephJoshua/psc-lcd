import Constants from 'expo-constants';
import { initializeApp } from 'firebase/app';

import 'firebase/auth';
import 'firebase/firestore';
import Category from '@/types/category';
import User from '@/types/user';
import { getAuth } from 'firebase/auth';
import {
  QueryDocumentSnapshot,
  collection,
  getFirestore,
} from 'firebase/firestore';

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

// TODO: turn on long polling
export const db = getFirestore(app);

export const CATEGORIES = 'categories';
export const USERS = 'users';

const firestoreConverters = {
  categories: {
    toFirestore: (data: Category): Category => data,
    fromFirestore: (snap: QueryDocumentSnapshot): Omit<Category, 'id'> =>
      snap.data() as Category,
  },
  users: {
    toFirestore: (data: User): User => data,
    fromFirestore: (snap: QueryDocumentSnapshot): Omit<User, 'id'> =>
      snap.data() as User,
  },
};

export const collections = {
  users: collection(db, USERS).withConverter(firestoreConverters.users),
  categories: collection(db, CATEGORIES).withConverter(
    firestoreConverters.categories,
  ),
};
