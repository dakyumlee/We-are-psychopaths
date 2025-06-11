import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAIU8q64ZB6g8D72SPcCxxkOQmhtREN9cg",
    authDomain: "we-are-psychopath.firebaseapp.com",
    projectId: "we-are-psychopath",
    storageBucket: "we-are-psychopath.appspot.com",
    messagingSenderId: "1020831167882",
    appId: "1:1020831167882:web:addcfd266307c3bb71c473",
    measurementId: "G-MG2X69DDK8"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
