import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIU8q64ZB6g8D72SPcCxxkOQmhtREN9cg",
  authDomain: "we-are-psychopath.firebaseapp.com",
  projectId: "we-are-psychopath",
  storageBucket: "we-are-psychopath.firebasestorage.app",
  messagingSenderId: "1020831167882",
  appId: "1:1020831167882:web:addcfd266307c3bb71c473",
  measurementId: "G-MG2X69DDK8"
};

let app;
if (!window.firebaseApp) {
  app = initializeApp(firebaseConfig);
  window.firebaseApp = app;
} else {
  app = window.firebaseApp;
}

if (!window.db) {
  window.db = getFirestore(app);
}
if (!window.storage) {
  window.storage = getStorage(app);
}

export const db = window.db;
export const storage = window.storage;