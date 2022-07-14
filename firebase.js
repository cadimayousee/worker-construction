import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDWCMS2hvQseMbxbFMmVVJKUmXyZjXT-6w",
    authDomain: "construction-worker-87844.firebaseapp.com",
    projectId: "construction-worker-87844",
    storageBucket: "construction-worker-87844.appspot.com",
    messagingSenderId: "491808950966",
    appId: "1:491808950966:web:0e734939777378c1ac3417",
    measurementId: "G-SXKPTT70V8"
};

let app;

if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig)
} else {
  app = firebase.app();
}

const fireDB = app.firestore();
const database = getDatabase(app);
// const auth = firebase.auth();

export { fireDB , database};