/* =========================
   HOME DOM
========================= */

const avatarEmoji =
  document.getElementById("avatarEmoji");

const playerName =
  document.getElementById("playerName");

const countryFlag =
  document.getElementById("countryFlag");

const countryName =
  document.getElementById("countryName");

const winsCount =
  document.getElementById("winsCount");

const playOnlineBtn =
  document.getElementById("playOnlineBtn");

const createCodeBtn =
  document.getElementById("createCodeBtn");

const roomCodeInput =
  document.getElementById("roomCodeInput");

const joinCodeBtn =
  document.getElementById("joinCodeBtn");

const homeStatus =
  document.getElementById("homeStatus");


/* =========================
   LOCAL PLAYER
========================= */

/*
  مؤقتاً كنستعملو localStorage.
  من بعد Firebase غادي يعوض هاد الجزء.
*/

const defaultPlayer = {
  name: "Player",
  avatar: "😎",
  countryFlag: "🇲🇦",
  countryName: "Morocco",
  gender: "boy",
  wins: 0
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


  return data;

}


let currentPlayer =
  loadPlayer();


/* =========================
   STATUS
========================= */

function setStatus(text){

  const textElement =
    homeStatus.querySelector(
      "span:last-child"
    );


  if(textElement){

    textElement.textContent =
      text;

  }

}


/* =========================
   ROOM CODE
========================= */

function generateRoomCode(){

  /*
    ما كنستعملوش 0/O و 1/I
    باش الكود يكون واضح.
  */

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


  let code = "";


  for(
    let i = 0;
    i < 6;
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
   PLAY ONLINE
========================= */

playOnlineBtn.addEventListener(
  "click",
  ()=>{

    setStatus(
      "Finding an opponent..."
    );

    window.location.href =
      "match.html";

  }
);

/* =========================
   CREATE FRIEND CODE
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


    /*
      دابا هاد الكود غير local.

      من بعد Firebase:
      هنا غادي ننشئو room حقيقية
      ونستناو الصديق يدخل.
    */

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


    /*
      نخليو غير:
      A-Z
      0-9
    */

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
   JOIN FRIEND
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


    /*
      ما ندخلوش للعبة دابا.

      حيت مازال Firebase
      ما تحققش واش Room موجودة.

      الربط الحقيقي غادي نديروه
      فالمرحلة ديال Firebase.
    */

  }
);


/* =========================
   ENTER KEY
========================= */

roomCodeInput.addEventListener(
  "keydown",
  event=>{

    if(
      event.key === "Enter"
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
