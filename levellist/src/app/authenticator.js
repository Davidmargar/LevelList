import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
    apiKey: "AIzaSyBaEgrHEOgZCNYk9GnOd7ZcDjTs4MFCLxs",
    authDomain: "levellist.firebaseapp.com",
    projectId: "levellist",
    storageBucket: "levellist.appspot.com",
    messagingSenderId: "556130227404",
    appId: "1:556130227404:web:3d93eb543d06d8acc5de69",
    measurementId: "G-QZCVZLK76S"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
