/* =========================
   FIREBASE IMPORTS
========================= */

import {
  initializeApp
} from
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";


import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  deleteUser
} from
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";


import {
  getFirestore,
  doc,
  runTransaction,
  serverTimestamp
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
   DOM
========================= */

const loginTab =
  document.getElementById(
    "loginTab"
  );

const createTab =
  document.getElementById(
    "createTab"
  );

const loginPanel =
  document.getElementById(
    "loginPanel"
  );

const createPanel =
  document.getElementById(
    "createPanel"
  );


const loginUsername =
  document.getElementById(
    "loginUsername"
  );

const loginPassword =
  document.getElementById(
    "loginPassword"
  );

const loginBtn =
  document.getElementById(
    "loginBtn"
  );


const createUsername =
  document.getElementById(
    "createUsername"
  );

const createPassword =
  document.getElementById(
    "createPassword"
  );

const countrySelect =
  document.getElementById(
    "countrySelect"
  );

const createAccountBtn =
  document.getElementById(
    "createAccountBtn"
  );


const avatarOptions =
  document.querySelectorAll(
    ".avatar-option"
  );


const genderOptions =
  document.querySelectorAll(
    ".gender-option"
  );


const authMessage =
  document.getElementById(
    "authMessage"
  );


/* =========================
   STATE
========================= */

let selectedAvatar =
  "😎";


/*
  null = user mazal
  ma khtar la boy la girl.
*/

let selectedGender =
  null;


let authReady =
  false;


let creatingAccount =
  false;


/* =========================
   MESSAGE
========================= */

function setMessage(
  text,
  type
){

  authMessage.textContent =
    text || "";


  authMessage.className =
    "auth-message";


  if(
    type
  ){

    authMessage.classList.add(
      type
    );

  }

}


/* =========================
   LOADING
========================= */

function setLoginLoading(
  loading
){

  loginBtn.disabled =
    loading;


  loginBtn.textContent =
    loading
    ?
    "LOGGING IN..."
    :
    "LOGIN";

}


function setCreateLoading(
  loading
){

  createAccountBtn.disabled =
    loading;


  createAccountBtn.textContent =
    loading
    ?
    "CREATING..."
    :
    "CREATE ACCOUNT";

}


/* =========================
   USERNAME
========================= */

function normalizeUsername(
  username
){

  return username
    .trim()
    .toLowerCase();

}


function validUsername(
  username
){

  return /^[a-zA-Z0-9_]{3,16}$/
    .test(
      username
    );

}


/* =========================
   INTERNAL EMAIL
========================= */

function usernameToEmail(
  usernameLower
){

  return (
    usernameLower +
    "@wallbattle.app"
  );

}


/* =========================
   TABS
========================= */

function showLogin(){

  loginTab.classList.add(
    "active"
  );


  createTab.classList.remove(
    "active"
  );


  loginPanel.classList.remove(
    "hidden"
  );


  createPanel.classList.add(
    "hidden"
  );


  setMessage(
    ""
  );

}


function showCreate(){

  createTab.classList.add(
    "active"
  );


  loginTab.classList.remove(
    "active"
  );


  createPanel.classList.remove(
    "hidden"
  );


  loginPanel.classList.add(
    "hidden"
  );


  setMessage(
    ""
  );

}


loginTab.addEventListener(
  "click",
  showLogin
);


createTab.addEventListener(
  "click",
  showCreate
);


/* =========================
   GENDER
========================= */

genderOptions.forEach(
  button=>{

    button.addEventListener(
      "click",
      ()=>{

        genderOptions.forEach(
          item=>{

            item.classList.remove(
              "selected"
            );

          }
        );


        button.classList.add(
          "selected"
        );


        selectedGender =
          button.dataset.gender;


        setMessage(
          ""
        );

      }
    );

  }
);


/* =========================
   AVATAR
========================= */

const avatarCurrent =
  document.getElementById(
    "avatarCurrent"
  );

const avatarPrevBtn =
  document.getElementById(
    "avatarPrevBtn"
  );

const avatarNextBtn =
  document.getElementById(
    "avatarNextBtn"
  );


const avatars = [
  "😎",
  "🧢",
  "👦",
  "🕶️",
  "👧",
  "🎀",
  "🌸",
  "✨"
];


let avatarIndex =
  0;


let selectedAvatar =
  avatars[
    avatarIndex
  ];


function animateAvatar(
  direction
){

  avatarCurrent.classList.remove(
    "avatar-from-left",
    "avatar-from-right"
  );


  void avatarCurrent.offsetWidth;


  avatarCurrent.classList.add(
    direction === "left"
      ? "avatar-from-left"
      : "avatar-from-right"
  );

}


function showAvatar(
  direction
){

  selectedAvatar =
    avatars[
      avatarIndex
    ];


  avatarCurrent.textContent =
    selectedAvatar;


  animateAvatar(
    direction
  );

}


avatarNextBtn.addEventListener(
  "click",
  ()=>{

    avatarIndex++;


    if(
      avatarIndex >=
      avatars.length
    ){

      avatarIndex =
        0;

    }


    showAvatar(
      "right"
    );

  }
);


avatarPrevBtn.addEventListener(
  "click",
  ()=>{

    avatarIndex--;


    if(
      avatarIndex < 0
    ){

      avatarIndex =
        avatars.length - 1;

    }


    showAvatar(
      "left"
    );

  }
);

/* =========================
   PERSISTENCE
========================= */

await setPersistence(
  auth,
  browserLocalPersistence
);


/* =========================
   CREATE ACCOUNT
========================= */

createAccountBtn.addEventListener(
  "click",
  async ()=>{

    if(
      !authReady ||
      creatingAccount
    ){

      return;

    }


    const username =
      createUsername
        .value
        .trim();


    const usernameLower =
      normalizeUsername(
        username
      );


    const password =
      createPassword.value;


    const selectedOption =
      countrySelect.options[
        countrySelect.selectedIndex
      ];


    const countryCode =
      countrySelect.value;


    const countryName =
      selectedOption
      ?
      selectedOption.dataset.name
      :
      "";


    const countryFlag =
      selectedOption
      ?
      selectedOption.dataset.flag
      :
      "";


    /* =========================
       VALIDATION
    ========================== */

    if(
      !selectedGender
    ){

      setMessage(
        "Choose BOY or GIRL.",
        "error"
      );

      return;

    }


    if(
      !validUsername(
        username
      )
    ){

      setMessage(
        "Username must be 3-16 characters using letters, numbers or _",
        "error"
      );

      return;

    }


    if(
      password.length < 6
    ){

      setMessage(
        "Password must contain at least 6 characters.",
        "error"
      );

      return;

    }


    if(
      !countryCode ||
      !countryName
    ){

      setMessage(
        "Choose your country.",
        "error"
      );

      return;

    }


    creatingAccount =
      true;


    setCreateLoading(
      true
    );


    setMessage(
      "Creating account...",
      "loading"
    );


    let createdUser =
      null;


    try{

      /* =========================
         CREATE FIREBASE AUTH
      ========================== */

      const email =
        usernameToEmail(
          usernameLower
        );


      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );


      createdUser =
        credential.user;


      const uid =
        createdUser.uid;


      /* =========================
         FIRESTORE PROFILE
      ========================== */

      await runTransaction(
        db,
        async transaction=>{

          const usernameDocument =
            doc(
              db,
              "usernames",
              usernameLower
            );


          const usernameSnapshot =
            await transaction.get(
              usernameDocument
            );


          if(
            usernameSnapshot.exists()
          ){

            throw new Error(
              "USERNAME_TAKEN"
            );

          }


          const userDocument =
            doc(
              db,
              "users",
              uid
            );


          transaction.set(
            usernameDocument,
            {
              uid:uid
            }
          );


          transaction.set(
            userDocument,
            {

              username:
                username,

              usernameLower:
                usernameLower,

              avatar:
                selectedAvatar,

              /*
                Daba gender
                user khtarha
                b wa7do.
              */

              gender:
                selectedGender,

              countryCode:
                countryCode,

              countryName:
                countryName,

              countryFlag:
                countryFlag,

              wins:
                0,

              losses:
                0,

              gamesPlayed:
                0,

              role:
                "user",

              createdAt:
                serverTimestamp(),

              lastSeen:
                serverTimestamp()

            }
          );

        }
      );


      setMessage(
        "Account created!",
        "success"
      );


      setTimeout(
        ()=>{

          window.location.replace(
            "home.html"
          );

        },
        450
      );

    }

    catch(error){

      console.error(
        "CREATE ACCOUNT ERROR:",
        error
      );


      /*
        Ila Auth tkhlaq
        w Firestore fail,
        nms7o Auth bach
        mayb9ach account na9s.
      */

      if(
        createdUser
      ){

        try{

          await deleteUser(
            createdUser
          );

        }

        catch(deleteError){

          console.error(
            "ROLLBACK ERROR:",
            deleteError
          );

        }

      }


      if(
        error.message ===
        "USERNAME_TAKEN"
      ){

        setMessage(
          "This username is already taken.",
          "error"
        );

      }

      else if(
        error.code ===
        "auth/email-already-in-use"
      ){

        setMessage(
          "This username is already taken.",
          "error"
        );

      }

      else if(
        error.code ===
        "auth/weak-password"
      ){

        setMessage(
          "Password is too weak.",
          "error"
        );

      }

      else if(
        error.code ===
        "permission-denied"
      ){

        setMessage(
          "Database permission denied.",
          "error"
        );

      }

      else{

        setMessage(
          "Could not create account. Try again.",
          "error"
        );

      }

    }

    finally{

      creatingAccount =
        false;


      setCreateLoading(
        false
      );

    }

  }
);


/* =========================
   LOGIN
========================= */

loginBtn.addEventListener(
  "click",
  async ()=>{

    if(
      !authReady
    ){

      return;

    }


    const username =
      loginUsername
        .value
        .trim();


    const usernameLower =
      normalizeUsername(
        username
      );


    const password =
      loginPassword.value;


    if(
      !usernameLower ||
      !password
    ){

      setMessage(
        "Enter username and password.",
        "error"
      );

      return;

    }


    setLoginLoading(
      true
    );


    setMessage(
      "Logging in...",
      "loading"
    );


    try{

      const email =
        usernameToEmail(
          usernameLower
        );


      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


      setMessage(
        "Login successful!",
        "success"
      );


      window.location.replace(
        "home.html"
      );

    }

    catch(error){

      console.error(
        "LOGIN ERROR:",
        error
      );


      if(
        error.code ===
        "auth/invalid-credential" ||
        error.code ===
        "auth/user-not-found" ||
        error.code ===
        "auth/wrong-password"
      ){

        setMessage(
          "Wrong username or password.",
          "error"
        );

      }

      else{

        setMessage(
          "Could not login. Try again.",
          "error"
        );

      }

    }

    finally{

      setLoginLoading(
        false
      );

    }

  }
);


/* =========================
   ENTER LOGIN
========================= */

loginPassword.addEventListener(
  "keydown",
  event=>{

    if(
      event.key === "Enter"
    ){

      loginBtn.click();

    }

  }
);


/* =========================
   ENTER CREATE
========================= */

createPassword.addEventListener(
  "keydown",
  event=>{

    if(
      event.key === "Enter"
    ){

      createAccountBtn.click();

    }

  }
);


/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(
  auth,
  user=>{

    authReady =
      true;


    if(
      user &&
      !creatingAccount
    ){

      window.location.replace(
        "home.html"
      );

    }

  }
);
