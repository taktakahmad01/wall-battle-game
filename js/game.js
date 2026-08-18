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
  getDoc,
  updateDoc,
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
   HOME DOM
========================= */

const avatarEmoji =
  document.getElementById(
    "avatarEmoji"
  );

const playerName =
  document.getElementById(
    "playerName"
  );

const countryFlag =
  document.getElementById(
    "countryFlag"
  );

const countryName =
  document.getElementById(
    "countryName"
  );

const winsCount =
  document.getElementById(
    "winsCount"
  );


const playOnlineBtn =
  document.getElementById(
    "playOnlineBtn"
  );

const createCodeBtn =
  document.getElementById(
    "createCodeBtn"
  );

const roomCodeInput =
  document.getElementById(
    "roomCodeInput"
  );

const joinCodeBtn =
  document.getElementById(
    "joinCodeBtn"
  );

const homeStatus =
  document.getElementById(
    "homeStatus"
  );


/* =========================
   MATCH DOM
========================= */

const matchOverlay =
  document.getElementById(
    "matchOverlay"
  );

const matchCancelBtn =
  document.getElementById(
    "matchCancelBtn"
  );

const matchScanner =
  document.getElementById(
    "matchScanner"
  );

const matchAvatar =
  document.getElementById(
    "matchAvatar"
  );

const matchFoundBadge =
  document.getElementById(
    "matchFoundBadge"
  );

const matchSearchText =
  document.getElementById(
    "matchSearchText"
  );

const matchSubtext =
  document.getElementById(
    "matchSubtext"
  );


/* =========================
   PLAYER STATE
========================= */

let currentUser =
  null;

let currentPlayer =
  null;


/* =========================
   HOME STATUS
========================= */

function setStatus(
  text
){

  const textElement =
    homeStatus.querySelector(
      "span:last-child"
    );


  if(
    textElement
  ){

    textElement.textContent =
      text;

  }

}


/* =========================
   LOAD PROFILE
========================= */

async function loadPlayerProfile(
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


  currentPlayer =
    data;


  /* =========================
     SHOW DATA IN HOME
  ========================== */

  avatarEmoji.textContent =
    data.avatar ||
    "😎";


  playerName.textContent =
    data.username ||
    "Player";


  countryFlag.textContent =
    data.countryFlag ||
    "🌍";


  countryName.textContent =
    data.countryName ||
    "";


  winsCount.textContent =
    Number(
      data.wins || 0
    );


  /*
    Match overlay avatar
    يكون نفس avatar ديال account.
  */

  matchAvatar.textContent =
    data.avatar ||
    "😎";


  /*
    Cache خفيفة فقط.
    Firebase يبقى source الحقيقي.
  */

  try{

    localStorage.setItem(
      "wallBattlePlayer",
      JSON.stringify({
        uid:user.uid,
        username:data.username || "",
        avatar:data.avatar || "😎",
        gender:data.gender || "",
        countryCode:data.countryCode || "",
        countryName:data.countryName || "",
        countryFlag:data.countryFlag || "",
        wins:Number(data.wins || 0)
      })
    );

  }

  catch(error){}


  /*
    lastSeen مسموح به فالRules ديالنا.
  */

  try{

    await updateDoc(
      userRef,
      {
        lastSeen:
          serverTimestamp()
      }
    );

  }

  catch(error){

    console.warn(
      "Could not update lastSeen:",
      error
    );

  }

}


/* =========================
   AUTH CHECK
========================= */

onAuthStateChanged(
  auth,
  async user=>{

    /*
      ما عندوش session:
      يرجع Auth.
    */

    if(
      !user
    ){

      window.location.replace(
        "auth.html"
      );

      return;

    }


    currentUser =
      user;


    setStatus(
      "Loading profile..."
    );


    try{

      await loadPlayerProfile(
        user
      );


      setStatus(
        "Ready to play"
      );

    }

    catch(error){

      console.error(
        "PROFILE LOAD ERROR:",
        error
      );


      if(
        error.message ===
        "PROFILE_NOT_FOUND"
      ){

        setStatus(
          "Profile not found"
        );

      }

      else{

        setStatus(
          "Could not load profile"
        );

      }

    }

  }
);


/* =========================
   ROOM CODE
========================= */

function generateRoomCode(){

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


  let code =
    "";


  for(
    let i=0;
    i<6;
    i++
  ){

    const randomIndex =
      Math.floor(
        Math.random() *
        chars.length
      );


    code +=
      chars[randomIndex];

  }


  return code;

}


/* =========================
   MATCH STATE
========================= */

let matchRunning =
  false;

let matchFinished =
  false;

let dotsTimer =
  null;

let searchTimer =
  null;

let enterTimer =
  null;

let audioContext =
  null;


/* =========================
   MATCH AUDIO
========================= */

function getAudio(){

  if(
    !audioContext
  ){

    const AC =
      window.AudioContext ||
      window.webkitAudioContext;


    if(
      AC
    ){

      audioContext =
        new AC();

    }

  }


  if(
    audioContext &&
    audioContext.state ===
    "suspended"
  ){

    audioContext.resume();

  }


  return audioContext;

}


function tone(
  frequency,
  duration,
  volume,
  type,
  delay
){

  if(
    !matchRunning
  ){

    return;

  }


  const ctx =
    getAudio();


  if(
    !ctx
  ){

    return;

  }


  const osc =
    ctx.createOscillator();


  const gain =
    ctx.createGain();


  const start =
    ctx.currentTime +
    (
      delay ||
      0
    );


  osc.type =
    type ||
    "triangle";


  osc.frequency.value =
    frequency;


  gain.gain.setValueAtTime(
    .0001,
    start
  );


  gain.gain
    .exponentialRampToValueAtTime(
      volume ||
      .025,
      start+.01
    );


  gain.gain
    .exponentialRampToValueAtTime(
      .0001,
      start+duration
    );


  osc.connect(
    gain
  );


  gain.connect(
    ctx.destination
  );


  osc.start(
    start
  );


  osc.stop(
    start+
    duration+
    .04
  );

}


function matchFoundSound(){

  tone(
    440,
    .08,
    .025,
    "triangle",
    0
  );


  tone(
    590,
    .10,
    .030,
    "triangle",
    .08
  );


  tone(
    760,
    .16,
    .035,
    "triangle",
    .17
  );

}


/* =========================
   RESET MATCH UI
========================= */

function resetMatchUI(){

  matchScanner
    .classList
    .remove(
      "found"
    );


  matchFoundBadge
    .classList
    .remove(
      "show"
    );


  matchSearchText
    .classList
    .remove(
      "found"
    );


  matchSearchText.innerHTML =
    'SEARCHING <span id="matchDots">.</span>';


  matchSubtext.textContent =
    "Looking for a player";


  if(
    currentPlayer
  ){

    matchAvatar.textContent =
      currentPlayer.avatar ||
      "😎";

  }

}


/* =========================
   STOP MATCH TIMERS
========================= */

function stopMatchTimers(){

  if(
    dotsTimer
  ){

    clearInterval(
      dotsTimer
    );

    dotsTimer =
      null;

  }


  if(
    searchTimer
  ){

    clearTimeout(
      searchTimer
    );

    searchTimer =
      null;

  }


  if(
    enterTimer
  ){

    clearTimeout(
      enterTimer
    );

    enterTimer =
      null;

  }

}


/* =========================
   CANCEL MATCH
========================= */

function cancelMatch(){

  matchRunning =
    false;

  matchFinished =
    false;


  stopMatchTimers();


  matchOverlay
    .classList
    .add(
      "hidden"
    );


  resetMatchUI();


  setStatus(
    "Ready to play"
  );

}


/* =========================
   MATCH FOUND
========================= */

function matchFound(){

  if(
    !matchRunning ||
    matchFinished
  ){

    return;

  }


  matchFinished =
    true;


  if(
    dotsTimer
  ){

    clearInterval(
      dotsTimer
    );

    dotsTimer =
      null;

  }


  matchScanner
    .classList
    .add(
      "found"
    );


  matchFoundBadge
    .classList
    .add(
      "show"
    );


  matchSearchText
    .classList
    .add(
      "found"
    );


  matchSearchText.textContent =
    "MATCH FOUND! ⚔️";


  matchSubtext.textContent =
    "Opponent ready";


  matchFoundSound();


  enterTimer =
    setTimeout(
      ()=>{

        if(
          !matchRunning
        ){

          return;

        }


        matchRunning =
          false;


        window.location.href =
          "index.html";

      },
      1050
    );

}


/* =========================
   START MATCH
========================= */

function startMatch(){

  /*
    ما نبدأوش حتى profile تكون
    جاية من Firebase.
  */

  if(
    !currentUser ||
    !currentPlayer ||
    matchRunning
  ){

    return;

  }


  stopMatchTimers();


  resetMatchUI();


  matchRunning =
    true;

  matchFinished =
    false;


  matchOverlay
    .classList
    .remove(
      "hidden"
    );


  setStatus(
    "Finding opponent..."
  );


  let dotCount =
    1;


  dotsTimer =
    setInterval(
      ()=>{

        if(
          !matchRunning
        ){

          return;

        }


        dotCount++;


        if(
          dotCount > 3
        ){

          dotCount =
            1;

        }


        const dots =
          document.getElementById(
            "matchDots"
          );


        if(
          dots
        ){

          dots.textContent =
            ".".repeat(
              dotCount
            );

        }

      },
      330
    );


  searchTimer =
    setTimeout(
      matchFound,
      2000
    );

}


/* =========================
   PLAY ONLINE
========================= */

playOnlineBtn.addEventListener(
  "click",
  ()=>{

    if(
      !currentPlayer
    ){

      setStatus(
        "Loading profile..."
      );

      return;

    }


    startMatch();

  }
);


/* =========================
   CANCEL MATCH
========================= */

matchCancelBtn.addEventListener(
  "click",
  cancelMatch
);


/* =========================
   CREATE CODE
========================= */

createCodeBtn.addEventListener(
  "click",
  ()=>{

    if(
      !currentPlayer
    ){

      return;

    }


    const code =
      generateRoomCode();


    roomCodeInput.value =
      code;


    setStatus(
      "Room " +
      code +
      " created"
    );

  }
);


/* =========================
   CODE INPUT
========================= */

roomCodeInput.addEventListener(
  "input",
  ()=>{

    let value =
      roomCodeInput
        .value
        .toUpperCase();


    value =
      value.replace(
        /[^A-Z0-9]/g,
        ""
      );


    roomCodeInput.value =
      value.slice(
        0,
        6
      );

  }
);


/* =========================
   JOIN
========================= */

joinCodeBtn.addEventListener(
  "click",
  ()=>{

    const code =
      roomCodeInput
        .value
        .trim()
        .toUpperCase();


    if(
      code.length !== 6
    ){

      setStatus(
        "Enter a 6-character code"
      );


      roomCodeInput.focus();


      return;

    }


    setStatus(
      "Joining " +
      code +
      "..."
    );

  }
);


/* =========================
   ENTER CODE
========================= */

roomCodeInput.addEventListener(
  "keydown",
  event=>{

    if(
      event.key ===
      "Enter"
    ){

      joinCodeBtn.click();

    }

  }
);
