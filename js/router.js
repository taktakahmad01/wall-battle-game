/* =========================
   FIREBASE IMPORTS
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


import {
  getFirestore,
  doc,
  getDoc
} from
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";


/* =========================
   FIREBASE CONFIG
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
  initializeApp(
    firebaseConfig
  );


const auth =
  getAuth(
    app
  );


const db =
  getFirestore(
    app
  );


/* =========================
   SAVE PROFILE CACHE
========================= */

function saveProfileCache(
  user,
  data
){

  try{

    localStorage.setItem(
      "wallBattlePlayer",
      JSON.stringify({

        uid:
          user.uid,

        username:
          data.username || "",

        avatar:
          data.avatar || "😎",

        gender:
          data.gender || "",

        countryCode:
          data.countryCode || "",

        countryName:
          data.countryName || "",

        countryFlag:
          data.countryFlag || "",

        wins:
          Number(
            data.wins || 0
          ),

        losses:
          Number(
            data.losses || 0
          ),

        gamesPlayed:
          Number(
            data.gamesPlayed || 0
          )

      })
    );

  }

  catch(error){

    console.warn(
      "PROFILE CACHE ERROR:",
      error
    );

  }

}


/* =========================
   LOAD PROFILE
========================= */

async function loadProfile(
  user
){

  const userRef =
    doc(
      db,
      "users",
      user.uid
    );


  const userSnap =
    await getDoc(
      userRef
    );


  if(
    !userSnap.exists()
  ){

    throw new Error(
      "PROFILE_NOT_FOUND"
    );

  }


  const data =
    userSnap.data();


  saveProfileCache(
    user,
    data
  );


  return data;

}


/* =========================
   SMART ROUTER
========================= */

onAuthStateChanged(
  auth,
  async user=>{

    /*
      ما عندوش حساب/session
      → AUTH
    */

    if(
      !user
    ){

      try{

        localStorage.removeItem(
          "wallBattlePlayer"
        );

      }

      catch(error){}


      window.location.replace(
        "auth.html"
      );


      return;

    }


    /*
      عندو session:
      Landing كتبقى ظاهرة
      حتى Firebase profile تجي.
    */

    try{

      await loadProfile(
        user
      );


      /*
        من بعد غادي نزيدو هنا:

        active game ?
          → game.html

        no active game ?
          → home.html

        حالياً:
        → HOME
      */

      window.location.replace(
        "home.html"
      );

    }

    catch(error){

      console.error(
        "ROUTER PROFILE ERROR:",
        error
      );


      /*
        إلا Auth account موجود
        ولكن profile ما كايناش،
        ما ندخلوش Home ناقصة.
      */

      if(
        error.message ===
        "PROFILE_NOT_FOUND"
      ){

        const text =
          document.querySelector(
            ".text"
          );


        if(text){

          text.textContent =
            "Profile not found";

        }


        return;

      }


      /*
        مشكل نت أو Firestore:
        Landing تبقى وما ندخلوش
        Home ببيانات ناقصة.
      */

      const text =
        document.querySelector(
          ".text"
        );


      if(text){

        text.textContent =
          "Connecting...";

      }

    }

  }
);
