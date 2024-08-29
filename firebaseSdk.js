
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAMzr_J6oz08vo_84XDLAumDahgW8gNhGo",
  authDomain: "hbmsystem-bf60b.firebaseapp.com",
  projectId: "hbmsystem-bf60b",
  storageBucket: "hbmsystem-bf60b.appspot.com",
  messagingSenderId: "1068897138516",
  appId: "1:1068897138516:web:2a4bf719dc8e3dca7e3ac1"
};


const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };