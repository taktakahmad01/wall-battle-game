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
   BLOCK BACK BUTTON
========================= */

history.pushState(
  {
    matchPage:true
  },
  "",
  window.location.href
);


window.addEventListener(
  "popstate",
  ()=>{

    /*
      زر الرجوع ديال الهاتف
      ما يخرجش من Match.
    */

    history.pushState(
      {
        matchPage:true
      },
      "",
      window.location.href
    );

  }
);


/* =========================
   CANCEL MATCH
========================= */

let matchCancelled =
  false;


cancelMatchBtn.addEventListener(
  "click",
  ()=>{

    matchCancelled =
      true;


    window.location.replace(
      "home.html"
    );

  }
);


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
      Default avatar يبقى.
    */

  }

}


loadPlayerAvatar();


/* =========================
   AUDIO
========================= */

let audioContext =
  null;


function getAudio(){

  if(!audioContext){

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
    type ||
    "triangle";


  oscillator.frequency.value =
    frequency;


  gain.gain.setValueAtTime(
    .0001,
    start
  );


  gain.gain.exponentialRampToValueAtTime(
    volume || .025,
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


/* =========================
   MATCH SOUND
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

let dotCount =
  1;


const dotsTimer =
  setInterval(
    ()=>{

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


/* =========================
   MATCH FOUND
========================= */

function matchFound(){

  if(
    matchCancelled
  ){

    return;

  }


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


  searchText.textContent =
    "MATCH FOUND! ⚔️";


  matchSubtext.textContent =
    "Opponent ready";


  playMatchFoundSound();


  setTimeout(
    ()=>{

      if(
        matchCancelled
      ){

        return;

      }


      /*
        replace:
        Match page كتخرج من history.
      */

      window.location.replace(
        "index.html"
      );

    },
    1050
  );

}


/* =========================
   SEARCH
========================= */

setTimeout(
  ()=>{

    matchFound();

  },
  2000
);
