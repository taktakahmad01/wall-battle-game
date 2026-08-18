/* =========================
   DOM
========================= */

const scanner =
  document.getElementById("scanner");

const searchAvatar =
  document.getElementById("searchAvatar");

const foundBadge =
  document.getElementById("foundBadge");

const searchText =
  document.getElementById("searchText");

const searchDots =
  document.getElementById("searchDots");

const matchSubtext =
  document.getElementById("matchSubtext");

const cancelMatchBtn =
  document.getElementById("cancelMatchBtn");


/* =========================
   STATE
========================= */

let matchCancelled = false;

let matchFoundStarted = false;

let searchTimer = null;

let enterGameTimer = null;

let dotsTimer = null;

let audioContext = null;


/* =========================
   PLAYER AVATAR
========================= */

function loadPlayerAvatar(){

  try{

    const saved =
      JSON.parse(
        localStorage.getItem(
          "wallBattlePlayer"
        )
      );


    if(
      saved &&
      saved.avatar
    ){

      searchAvatar.textContent =
        saved.avatar;

    }

  }

  catch(error){

    /* نخليو avatar الافتراضي */

  }

}


loadPlayerAvatar();


/* =========================
   AUDIO
========================= */

function getAudio(){

  if(
    !audioContext
  ){

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;


    if(
      AudioContextClass
    ){

      audioContext =
        new AudioContextClass();

    }

  }


  if(
    audioContext &&
    audioContext.state === "suspended"
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
    matchCancelled
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


  const oscillator =
    ctx.createOscillator();


  const gain =
    ctx.createGain();


  const start =
    ctx.currentTime +
    (
      delay ||
      0
    );


  oscillator.type =
    type ||
    "triangle";


  oscillator.frequency.value =
    frequency;


  gain.gain.setValueAtTime(
    .0001,
    start
  );


  gain.gain.exponentialRampToValueAtTime(
    volume ||
    .025,
    start + .01
  );


  gain.gain.exponentialRampToValueAtTime(
    .0001,
    start + duration
  );


  oscillator.connect(
    gain
  );


  gain.connect(
    ctx.destination
  );


  oscillator.start(
    start
  );


  oscillator.stop(
    start +
    duration +
    .04
  );

}


function playMatchFoundSound(){

  if(
    matchCancelled
  ){

    return;

  }


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
   STOP AUDIO
========================= */

function stopMatchAudio(){

  if(
    audioContext
  ){

    try{

      if(
        audioContext.state !==
        "closed"
      ){

        audioContext.close();

      }

    }

    catch(error){}


    audioContext =
      null;

  }

}


/* =========================
   SEARCH DOTS
========================= */

let dotCount = 1;


function startDots(){

  dotsTimer =
    setInterval(
      ()=>{

        if(
          matchCancelled
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


        searchDots.textContent =
          ".".repeat(
            dotCount
          );

      },
      330
    );

}


startDots();


/* =========================
   CLEANUP
========================= */

function cleanupMatch(){

  matchCancelled =
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
    enterGameTimer
  ){

    clearTimeout(
      enterGameTimer
    );

    enterGameTimer =
      null;

  }


  stopMatchAudio();

}


/* =========================
   CANCEL MATCH
========================= */

function cancelMatch(){

  if(
    matchCancelled
  ){

    return;

  }


  cleanupMatch();


  window.location.replace(
    "home.html"
  );

}


/* =========================
   CANCEL BUTTON
========================= */

cancelMatchBtn.addEventListener(
  "click",
  ()=>{

    cancelMatch();

  }
);


/* =========================
   PHONE / BROWSER BACK
========================= */

/*
  كنزيدو state واحد باش أول Back
  يبقى داخل الصفحة ونستقبلو popstate.
*/

history.pushState(
  {
    match:true
  },
  "",
  window.location.href
);


window.addEventListener(
  "popstate",
  ()=>{

    cancelMatch();

  }
);


/* =========================
   MATCH FOUND
========================= */

function matchFound(){

  if(
    matchCancelled ||
    matchFoundStarted
  ){

    return;

  }


  matchFoundStarted =
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


  scanner.classList.add(
    "found"
  );


  foundBadge.classList.add(
    "show"
  );


  searchText.classList.add(
    "found"
  );


  searchText.textContent =
    "MATCH FOUND! ⚔️";


  matchSubtext.textContent =
    "Opponent ready";


  playMatchFoundSound();


  enterGameTimer =
    setTimeout(
      ()=>{

        if(
          matchCancelled
        ){

          return;

        }


        /*
          ما نديروش cleanupMatch()
          حيث هادي ماشي cancel.

          غير نوقفو timers
          قبل الانتقال.
        */

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


        window.location.replace(
          "index.html"
        );

      },
      1050
    );

}


/* =========================
   START SEARCH
========================= */

searchTimer =
  setTimeout(
    ()=>{

      matchFound();

    },
    2000
  );


/* =========================
   PAGE CLEANUP
========================= */

/*
  إلا الصفحة خرجات لأي سبب،
  نحبسو كلشي باش ما يبقاش
  sound ولا timer فالخلفية.
*/

window.addEventListener(
  "pagehide",
  ()=>{

    cleanupMatch();

  }
);


window.addEventListener(
  "beforeunload",
  ()=>{

    cleanupMatch();

  }
);
