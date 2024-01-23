// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { ReactNativeAsyncStorage } from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUGZrKMPIO5PaMNNkP1IWUCm4jffRrhxM",
  authDomain: "loyal-bean.firebaseapp.com",
  projectId: "loyal-bean",
  storageBucket: "loyal-bean.appspot.com",
  messagingSenderId: "382582413068",
  appId: "1:382582413068:web:2ad8cbe58b3cbca6d55b29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
