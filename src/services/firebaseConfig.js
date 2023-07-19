// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAHdK4_0MdgqyGcGSr7TkQziXiRakvV9WQ',
  authDomain: 'chat-9e72a.firebaseapp.com',
  projectId: 'chat-9e72a',
  storageBucket: 'chat-9e72a.appspot.com',
  messagingSenderId: '592019173292',
  appId: '1:592019173292:web:29ea742a494855ae8c1409',
  measurementId: 'G-VP2BVRTY8R'
};

export const app = initializeApp(firebaseConfig);
export const databaseApp = getFirestore(app);
