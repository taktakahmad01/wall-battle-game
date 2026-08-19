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


import {
  getDatabase,
  ref,
  set,
  remove,
  update,
  onValue,
  get,
  onDisconnect,
  serverTimestamp as rtdbServerTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";


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


const realtimeDb =
  getDatabase(
    app
  );


/* =========================
   DOM
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
   MATCH STATE
========================= */

let matchRunning =
  false;

let matchFinished =
  false;

let dotsTimer =
  null;

let enterTimer =
  null;

let botFallbackTimer =
  null;

let queueListenerOff =
  null;

let assignmentListenerOff =
  null;

let audioContext =
  null;

let matchingBusy =
  false;


/* =========================
   STATUS
========================= */

function setStatus(
  text
){

  const element =
    homeStatus.querySelector(
      "span:last-child"
    );


  if(element){

    element.textContent =
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


  matchAvatar.textContent =
    data.avatar ||
    "😎";


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
          )

      })
    );

  }

  catch(error){}


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
      "LAST SEEN ERROR:",
      error
    );

  }

}


/* =========================
   AUTH
========================= */

onAuthStateChanged(
  auth,
  async user=>{

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
        "PROFILE ERROR:",
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
   AUDIO
========================= */

function getAudio(){

  if(
    !audioContext
  ){

    const AC =
      window.AudioContext ||
      window.webkitAudioContext;


    if(AC){

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
      delay || 0
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
      volume || .025,
      start + .01
    );


  gain.gain
    .exponentialRampToValueAtTime(
      .0001,
      start + duration
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
    start +
    duration +
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
   MATCH UI
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
   TIMERS / LISTENERS
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
    enterTimer
  ){

    clearTimeout(
      enterTimer
    );

    enterTimer =
      null;

  }


  if(
    botFallbackTimer
  ){

    clearTimeout(
      botFallbackTimer
    );

    botFallbackTimer =
      null;

  }

}


function stopFirebaseListeners(){

  if(
    queueListenerOff
  ){

    queueListenerOff();

    queueListenerOff =
      null;

  }


  if(
    assignmentListenerOff
  ){

    assignmentListenerOff();

    assignmentListenerOff =
      null;

  }

}


/* =========================
   REMOVE OWN QUEUE
========================= */

async function removeOwnQueue(){

  if(
    !currentUser
  ){

    return;

  }


  try{

    await remove(
      ref(
        realtimeDb,
        "gameV2/matchmaking/" +
        currentUser.uid
      )
    );

  }

  catch(error){

    console.warn(
      "QUEUE REMOVE ERROR:",
      error
    );

  }

}


/* =========================
   CANCEL
========================= */

async function cancelMatch(){

  matchRunning =
    false;

  matchFinished =
    false;

  matchingBusy =
    false;


  stopMatchTimers();

  stopFirebaseListeners();


  await removeOwnQueue();


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
   SELECT OPPONENT
========================= */

function chooseOpponent(
  players
){

  if(
    !currentPlayer
  ){

    return null;

  }


  const myGender =
    currentPlayer.gender;


  /*
    90% opposite gender
    10% same gender.
  */

  const preferOpposite =
    Math.random() <
    .90;


  const preferred =
    players.filter(
      player=>{

        if(
          preferOpposite
        ){

          return (
            player.gender !==
            myGender
          );

        }


        return (
          player.gender ===
          myGender
        );

      }
    );


  /*
    إلا النوع المفضل ما موجودش،
    ناخدو أي player متوفر.
  */

  const pool =
    preferred.length
    ?
    preferred
    :
    players;


  if(
    !pool.length
  ){

    return null;

  }


  /*
    الأقدم فالqueue أولاً.
  */

  pool.sort(
    (a,b)=>{

      return (
        Number(
          a.joinedAt || 0
        )
        -
        Number(
          b.joinedAt || 0
        )
      );

    }
  );


  return pool[0];

}


/* =========================
   CREATE REAL MATCH
========================= */

async function createRealMatch(
  opponent
){

  if(
    !currentUser ||
    !currentPlayer ||
    !opponent
  ){

    return;

  }


  if(
    matchingBusy ||
    matchFinished
  ){

    return;

  }


  matchingBusy =
    true;


  try{

    /*
      قبل إنشاء match نشوف واش
      opponent مازال فالqueue.
    */

    const opponentQueueRef =
      ref(
        realtimeDb,
        "gameV2/matchmaking/" +
        opponent.uid
      );


    const opponentSnap =
      await get(
        opponentQueueRef
      );


    if(
      !opponentSnap.exists()
    ){

      matchingBusy =
        false;

      return;

    }


    /*
      Match ID ثابت للجوج.
    */

    const ids = [
      currentUser.uid,
      opponent.uid
    ].sort();


    const matchId =
      ids[0] +
      "_" +
      ids[1] +
      "_" +
      Date.now();


    const rootRef =
      ref(
        realtimeDb,
        "gameV2"
      );


    /*
      Assign نفس match للجوج.
    */

    const updates = {};


    updates[
      "matchAssignments/" +
      currentUser.uid
    ] = {

      matchId:
        matchId,

      opponentUid:
        opponent.uid,

      opponentUsername:
        opponent.username || "Player",

      opponentAvatar:
        opponent.avatar || "😎",

      opponentGender:
        opponent.gender || "",

      type:
        "online",

      createdAt:
        rtdbServerTimestamp()

    };


    updates[
      "matchAssignments/" +
      opponent.uid
    ] = {

      matchId:
        matchId,

      opponentUid:
        currentUser.uid,

      opponentUsername:
        currentPlayer.username || "Player",

      opponentAvatar:
        currentPlayer.avatar || "😎",

      opponentGender:
        currentPlayer.gender || "",

      type:
        "online",

      createdAt:
        rtdbServerTimestamp()

    };


    /*
      Match metadata.
    */

    updates[
      "rooms/" +
      matchId
    ] = {

      id:
        matchId,

      type:
        "online",

      status:
        "starting",

      player1:
        currentUser.uid,

      player2:
        opponent.uid,

      createdAt:
        rtdbServerTimestamp()

    };


    await update(
      rootRef,
      updates
    );

  }

  catch(error){

    console.error(
      "CREATE REAL MATCH ERROR:",
      error
    );

  }

  finally{

    matchingBusy =
      false;

  }

}


/* =========================
   WATCH QUEUE
========================= */

function watchMatchmakingQueue(){

  const queueRef =
    ref(
      realtimeDb,
      "gameV2/matchmaking"
    );


  queueListenerOff =
    onValue(
      queueRef,
      snapshot=>{

        if(
          !matchRunning ||
          matchFinished ||
          matchingBusy ||
          !snapshot.exists()
        ){

          return;

        }


        const players =
          [];


        snapshot.forEach(
          child=>{

            const value =
              child.val();


            if(
              !value
            ){

              return;

            }


            if(
              child.key ===
              currentUser.uid
            ){

              return;

            }


            players.push({
              ...value,
              uid:child.key
            });

          }
        );


        if(
          !players.length
        ){

          return;

        }


        const opponent =
          chooseOpponent(
            players
          );


        if(
          opponent
        ){

          createRealMatch(
            opponent
          );

        }

      }
    );

}


/* =========================
   WATCH ASSIGNMENT
========================= */

function watchMyAssignment(){

  const assignmentRef =
    ref(
      realtimeDb,
      "gameV2/matchAssignments/" +
      currentUser.uid
    );


  assignmentListenerOff =
    onValue(
      assignmentRef,
      async snapshot=>{

        if(
          !matchRunning ||
          matchFinished ||
          !snapshot.exists()
        ){

          return;

        }


        const assignment =
          snapshot.val();


        if(
          !assignment ||
          !assignment.matchId
        ){

          return;

        }


        matchFinished =
          true;


        stopMatchTimers();

        stopFirebaseListeners();


        await removeOwnQueue();


        /*
          نحفظ معلومات match
          باش game.js تقراهم من بعد.
        */

        try{

          localStorage.setItem(
            "wallBattleActiveMatch",
            JSON.stringify(
              assignment
            )
          );

        }

        catch(error){}


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
          assignment.opponentUsername
          ?
          "VS " +
          assignment.opponentUsername
          :
          "Opponent ready";


        matchFoundSound();


        enterTimer =
          setTimeout(
            ()=>{

              matchRunning =
                false;


              window.location.href =
                "game.html";

            },
            1050
          );

      }
    );

}


/* =========================
   BOT FALLBACK
========================= */

function startBotFallbackTimer(){

  /*
    إلا ما لقيناش real player
    بعد 8 ثواني،
    حالياً ندخلو للـBOT القديم.

    من بعد نقدر نخلي user
    يختار واش يبغي BOT.
  */

  botFallbackTimer =
    setTimeout(
      async ()=>{

        if(
          !matchRunning ||
          matchFinished
        ){

          return;

        }


        matchFinished =
          true;


        stopFirebaseListeners();


        await removeOwnQueue();


        const botMatch = {

          matchId:
            "bot_" +
            currentUser.uid +
            "_" +
            Date.now(),

          opponentUid:
            "BOT",

          opponentUsername:
            "BOT",

          opponentAvatar:
            "🔴",

          type:
            "bot"

        };


        try{

          localStorage.setItem(
            "wallBattleActiveMatch",
            JSON.stringify(
              botMatch
            )
          );

        }

        catch(error){}


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
          "BOT FOUND! 🤖";


        matchSubtext.textContent =
          "No player available";


        matchFoundSound();


        enterTimer =
          setTimeout(
            ()=>{

              matchRunning =
                false;


              window.location.href =
                "game.html";

            },
            1050
          );

      },
      8000
    );

}


/* =========================
   START REAL MATCHMAKING
========================= */

async function startMatch(){

  if(
    !currentUser ||
    !currentPlayer ||
    matchRunning
  ){

    return;

  }


  if(
    !currentPlayer.gender
  ){

    setStatus(
      "Gender missing"
    );

    return;

  }


  stopMatchTimers();

  stopFirebaseListeners();

  resetMatchUI();


  matchRunning =
    true;

  matchFinished =
    false;

  matchingBusy =
    false;


  matchOverlay
    .classList
    .remove(
      "hidden"
    );


  setStatus(
    "Finding opponent..."
  );


  /*
    Searching dots animation.
  */

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


        if(dots){

          dots.textContent =
            ".".repeat(
              dotCount
            );

        }

      },
      330
    );


  /*
    Add me to Firebase queue.
  */

  const myQueueRef =
    ref(
      realtimeDb,
      "gameV2/matchmaking/" +
      currentUser.uid
    );


  try{

    await set(
      myQueueRef,
      {

        uid:
          currentUser.uid,

        username:
          currentPlayer.username ||
          "Player",

        avatar:
          currentPlayer.avatar ||
          "😎",

        gender:
          currentPlayer.gender,

        joinedAt:
          rtdbServerTimestamp()

      }
    );


    /*
      إلا browser تسد أو النت تقطع،
      Firebase يحاول يمسح queue entry.
    */

    try{

      await onDisconnect(
        myQueueRef
      ).remove();

    }

    catch(error){

      console.warn(
        "ON DISCONNECT ERROR:",
        error
      );

    }


    watchMyAssignment();

    watchMatchmakingQueue();

    startBotFallbackTimer();

  }

  catch(error){

    console.error(
      "MATCHMAKING ERROR:",
      error
    );


    matchRunning =
      false;


    matchOverlay
      .classList
      .add(
        "hidden"
      );


    setStatus(
      "Could not start matchmaking"
    );

  }

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
   CANCEL
========================= */

matchCancelBtn.addEventListener(
  "click",
  cancelMatch
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
      chars[
        randomIndex
      ];

  }


  return code;

}


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
