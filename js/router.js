/* =========================
   FIREBASE
========================= */

import {
  initializeApp
} from
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";


/* =========================
   CONFIG
========================= */

const firebaseConfig = {

  apiKey:
    "AIzaSyBiHbADPPYAOLzRzaCCfvTFKpe89clPHsI",

  authDomain:
    "rps-online-5e3d5.firebaseapp.com",

  databaseURL:
    "https://rps-online-5e3d5-default-rtdb.europe-west1.firebasedatabase.app",

  projectId:
    "rps-online-5e3d5",

  storageBucket:
    "rps-online-5e3d5.firebasestorage.app",

  messagingSenderId:
    "173039684242",

  appId:
    "1:173039684242:web:c3c00e53493d696fa9b44b"

};


/* =========================
   INIT
========================= */

const app =
  initializeApp(firebaseConfig);

const auth =
  getAuth(app);


/* =========================
   SMART ROUTER
========================= */

onAuthStateChanged(
  auth,
  user => {

    /*
      No account/session
      → AUTH
    */

    if (!user) {

      window.location.replace(
        "auth.html"
      );

      return;
    }


    /*
      Logged in.

      حالياً نمشيو Home.

      من بعد ملي نصايبو activeGames،
      هنا غادي نزيدو check:

      active match → game.html
      no match     → home.html
    */

    window.location.replace(
      "home.html"
    );

  }
);
