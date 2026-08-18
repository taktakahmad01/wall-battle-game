/* =========================
   DOM
========================= */

const scanner =
  document.querySelector(".scanner");

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

    /*
      إلا ماكانتش data
      نخليو avatar الافتراضي.
    */

  }

}


loadPlayerAvatar();


/* =========================
   AUDIO
========================= */

let audioContext = null;


function getAudio(){

  if(!audioContext){

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;


    if(AudioContextClass){

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

  const ctx =
    getAudio();


  if(!ctx){

    return;

  }


  const oscillator =
    ctx.createOscillator();


  const gain =
    ctx.createGain();


  const start =
    ctx.currentTime +
    (delay || 0);


  oscillator.type =
    type || "triangle";


  oscillator.frequency.value =
    frequency;


  gain.gain.setValueAtTime(
    0.0001,
    start
  );


  gain.gain.exponentialRampToValueAtTime(
    volume || 0.025,
    start + 0.01
  );


  gain.gain.exponentialRampToValueAtTime(
    0.0001,
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
    0.04
  );

}


/* =========================
   MATCH FOUND SOUND
========================= */

function playMatchFoundSound(){

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
   SEARCH DOTS
========================= */

let dotCount = 1;


const dotsTimer =
  setInterval(
    ()=>{

      dotCount++;


      if(
        dotCount > 3
      ){

        dotCount = 1;

      }


      searchDots.textContent =
        ".".repeat(
          dotCount
        );

    },
    330
  );


/* =========================
   MATCH FOUND
========================= */

function matchFound(){

  clearInterval(
    dotsTimer
  );


  scanner.classList.add(
    "found"
  );


  foundBadge.classList.add(
    "show"
  );


  searchText.classList.add(
    "found"
  );


  searchText.innerHTML =
    "MATCH FOUND! ⚔️";


  matchSubtext.textContent =
    "Opponent ready";


  playMatchFoundSound();


  /*
    نخلي Animation تبان شوية
    قبل الدخول للماتش.
  */

  setTimeout(
    ()=>{

      window.location.href =
        "index.html";

    },
    1050
  );

}


/* =========================
   SEARCH
========================= */

/*
  حالياً هادي animation تجريبية:
  كتقلب تقريباً جوج ثواني.

  من بعد ملي نديرو matchmaking،
  Firebase هو اللي غادي يقرر
  إمتى فعلاً تلقى الخصم.
*/

setTimeout(
  matchFound,
  2000
);
