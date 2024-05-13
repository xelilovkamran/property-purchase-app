import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAWCfmawwv9BdY3j0B0yTdvIcNcx6QyNOQ",
    authDomain: "property-purchase-app.firebaseapp.com",
    projectId: "property-purchase-app",
    storageBucket: "property-purchase-app.appspot.com",
    messagingSenderId: "645422599992",
    appId: "1:645422599992:web:fcba2b1a6bd4cd166e3bcd",
    measurementId: "G-Q987WCMEJ3",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
