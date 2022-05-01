// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBjHaDpLmu90WOxCRcddKDLaChYkLFw1gQ",
  authDomain: "discordbot-c10ef.firebaseapp.com",
  projectId: "discordbot-c10ef",
  storageBucket: "discordbot-c10ef.appspot.com",
  messagingSenderId: "568624847367",
  appId: "1:568624847367:web:2bafc8214ad37de78c28a2",
  measurementId: "G-JZ4KJCS87F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


