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

const matchDots =
  document.getElementById(
    "matchDots"
  );

const matchSubtext =
  document.getElementById(
    "matchSubtext"
  );


/* =========================
   PLAYER
========================= */

const defaultPlayer = {

  name:"Player",

  avatar:"😎",

  countryFlag:"🇲🇦",

  countryName:"Morocco",

  gender:"boy",

  wins:0

};


function loadPlayer(){

  let savedPlayer = null;


  try{

    savedPlayer =
      JSON.parse(
        localStorage.getItem(
          "wallBattlePlayer"
        )
      );

  }

  catch(error){

    savedPlayer = null;

  }


  const data = {

    ...defaultPlayer,

    ...(savedPlayer || {})

  };


  avatarEmoji.textContent =
    data.avatar;


  playerName.textContent =
    data.name;


  countryFlag.textContent =
    data.countryFlag;


  countryName.textContent =
    data.countryName;


  winsCount.textContent =
    data.wins;


  matchAvatar.textContent =
    data.avatar;


  return data;

}


let currentPlayer =
  loadPlayer();


/* =========================
   STATUS
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
   AUDIO
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


  /*
    innerHTML بدلات span،
    لذلك نجيبوه من جديد.
  */

  window.matchDotsElement =
    document.getElementById(
      "matchDots"
    );


  matchSubtext.textContent =
    "Looking for a player";

}


/* =========================
   STOP TIMERS
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

  if(
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
      ()=>{

        matchFound();

      },
      2000
    );

}


/* =========================
   PLAY ONLINE
========================= */

playOnlineBtn.addEventListener(
  "click",
  ()=>{

    startMatch();

  }
);


/* =========================
   CANCEL BUTTON
========================= */

matchCancelBtn.addEventListener(
  "click",
  ()=>{

    cancelMatch();

  }
);


/* =========================
   PHONE BACK
========================= */

/*
  Match ما تبدلاتش لصفحة أخرى.

  كنزيدو state غير ملي يبدأ
  matching باش Back يقدر يسدو.
*/

window.addEventListener(
  "popstate",
  ()=>{

    if(
      matchRunning
    ){

      cancelMatch();

    }

  }
);


/* =========================
   CREATE CODE
========================= */

createCodeBtn.addEventListener(
  "click",
  ()=>{

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
   JOIN CODE
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
   ENTER KEY
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


/* =========================
   START
========================= */

setStatus(
  "Ready to play"
);
