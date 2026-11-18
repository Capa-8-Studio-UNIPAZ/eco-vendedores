import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCqUeaS2GOiTq_p76j1NNr7tX3m29Br1z4',
  authDomain: 'ecovendedores-unipaz.firebaseapp.com',
  projectId: 'ecovendedores-unipaz',
  storageBucket: 'ecovendedores-unipaz.firebasestorage.app',
  messagingSenderId: '382342234300',
  appId: '1:382342234300:web:9111f974802154564090b9',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
