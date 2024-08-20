import { initializeApp } from "firebase/app";
import {getFirestore} from '@firebase/firestore'
const firebaseConfig = {
    apiKey: "AIzaSyBmvqIw1GeXcZWfH7B2gn4W4mxmFl33ACE",
    authDomain: "portfolio-scheduler-ec9b3.firebaseapp.com",
    projectId: "portfolio-scheduler-ec9b3",
    storageBucket: "portfolio-scheduler-ec9b3.appspot.com",
    messagingSenderId: "52572163607",
    appId: "1:52572163607:web:06bd899f3d6a4fd9d05652"
};
const app = initializeApp(firebaseConfig);
export const db= getFirestore(app)