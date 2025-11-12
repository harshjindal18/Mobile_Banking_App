import { initializeApp } from "firebase/app";
import {initializeAuth, getReactNativePersistence} from "firebase/auth"
import {getFirestore} from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMebYalyRSIQoY74pduphJwfEQrU3GJxw",
  authDomain: "mobilebankingapp-c35df.firebaseapp.com",
  projectId: "mobilebankingapp-c35df",
  storageBucket: "mobilebankingapp-c35df.firebasestorage.app",
  messagingSenderId: "248605431866",
  appId: "1:248605431866:web:cea808c563b63c4a92fd03",
  measurementId: "G-CXS4Y86EXM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//InitializeAuth persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
})

//Initialize Firestore
const db = getFirestore(app)

export {auth, db}
