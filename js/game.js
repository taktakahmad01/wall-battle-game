const SIZE = 9;

const MAX_ENERGY = 3;

const END_TURN_HOLD_MS = 900;


/* =========================
   DOM
========================= */

const board =
  document.getElementById("board");

const wallLayer =
  document.getElementById("wallLayer");

const slotLayer =
  document.getElementById("slotLayer");

const bluePawn =
  document.getElementById("bluePawn");

const redPawn =
  document.getElementById("redPawn");


const botCard =
  document.getElementById("botCard");

const botState =
  document.getElementById("botState");

const botEnergy =
  document.getElementById("botEnergy");


const playerCard =
  document.getElementById("playerCard");

const playerState =
  document.getElementById("playerState");

const playerEnergy =
  document.getElementById("playerEnergy");


const controlsPanel =
  document.getElementById("controlsPanel");


const blueWallsText =
  document.getElementById("blueWalls");

const redWallsText =
  document.getElementById("redWalls");


const wallModeBtn =
  document.getElementById("wallModeBtn");

const horizontalBtn =
  document.getElementById("horizontalBtn");

const verticalBtn =
  document.getElementById("verticalBtn");

const moveButtons =
  document.querySelectorAll(".move-btn");


const resultOverlay =
  document.getElementById("resultOverlay");

const resultIcon =
  document.getElementById("resultIcon");

const resultTitle =
  document.getElementById("resultTitle");

const resultText =
  document.getElementById("resultText");


/* =========================
   STATE
========================= */

let cells = [];


let blue = {
  r:8,
  c:4
};


let red = {
  r:0,
  c:4
};


let blueWalls = 10;

let redWalls = 10;


let actionsLeft =
  MAX_ENERGY;


let turn =
  "blue";


let wallMode =
  false;


let wallOrientation =
  "h";


let gameOver =
  false;


let hWalls =
  new Map();


let vWalls =
  new Map();


let newestWall =
  null;


let endTurnHoldTimer =
  null;


let endTurnHolding =
  false;


/* =========================
   AUDIO
========================= */

let audioContext =
  null;


function getAudio(){

  if(!audioContext){

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


  const osc =
    ctx.createOscillator();


  const gain =
    ctx.createGain();


  osc.type =
    type || "sine";


  osc.frequency.value =
    frequency;


  const start =
    ctx.currentTime +
    (delay || 0);


  gain.gain.setValueAtTime(
    .0001,
    start
  );


  gain.gain.exponentialRampToValueAtTime(
    volume || .022,
    start+.01
  );


  gain.gain.exponentialRampToValueAtTime(
    .0001,
    start+duration
  );


  osc.connect(gain);


  gain.connect(
    ctx.destination
  );


  osc.start(start);


  osc.stop(
    start+
    duration+
    .03
  );

}


function soundTurn(){

  tone(
    370,.07,.018,
    "triangle",0
  );


  tone(
    500,.09,.022,
    "triangle",.07
  );

}


function soundMove(){

  tone(
    430,.07,.018,
    "sine",0
  );

}


function soundWall(){

  tone(
    220,.07,.025,
    "square",0
  );


  tone(
    310,.09,.018,
    "triangle",.04
  );

}


function soundError(){

  tone(
    160,.12,.018,
    "sawtooth",0
  );

}


function soundEnergy(){

  tone(
    560,.06,.015,
    "triangle",0
  );

}


function soundEndTurn(){

  tone(
    420,.06,.018,
    "triangle",0
  );


  tone(
    300,.10,.018,
    "triangle",.07
  );

}


function soundWin(){

  tone(
    440,.12,.032,
    "triangle",0
  );


  tone(
    554,.13,.032,
    "triangle",.11
  );


  tone(
    659,.18,.038,
    "triangle",.23
  );

}


/* =========================
   HELPERS
========================= */

function key(r,c){

  return (
    r +
    "," +
    c
  );

}


function isInside(r,c){

  return (
    r >= 0 &&
    r < SIZE &&
    c >= 0 &&
    c < SIZE
  );

}


/* =========================
   ENERGY
========================= */

function renderEnergy(
  container,
  remaining
){

  const items =
    container.querySelectorAll(
      ".energy"
    );


  items.forEach(
    (item,index)=>{

      item.classList.remove(
        "hold-fade"
      );


      item.style.animationDelay =
        "0s";


      if(
        index < remaining
      ){

        item.classList.remove(
          "used"
        );

      }

      else{

        item.classList.add(
          "used"
        );

      }

    }
  );

}


function animateEnergyUse(
  container,
  remaining
){

  const items =
    container.querySelectorAll(
      ".energy"
    );


  const usedIndex =
    remaining;


  if(
    items[usedIndex]
  ){

    items[
      usedIndex
    ]
    .classList
    .remove(
      "consume"
    );


    void items[
      usedIndex
    ].offsetWidth;


    items[
      usedIndex
    ]
    .classList
    .add(
      "consume"
    );

  }


  renderEnergy(
    container,
    remaining
  );

}


/* =========================
   LONG PRESS END TURN
========================= */

function startEndTurnHold(){

  if(
    gameOver ||
    turn !== "blue" ||
    actionsLeft <= 0 ||
    endTurnHolding
  ){

    return;

  }


  endTurnHolding =
    true;


  playerEnergy.classList.add(
    "holding"
  );


  const items =
    playerEnergy.querySelectorAll(
      ".energy"
    );


  for(
    let i=0;
    i<actionsLeft;
    i++
  ){

    if(
      items[i]
    ){

      items[i]
        .classList
        .remove(
          "hold-fade"
        );


      items[i]
        .style
        .animationDelay =
        (
          i *
          .12
        ) +
        "s";


      void items[i]
        .offsetWidth;


      items[i]
        .classList
        .add(
          "hold-fade"
        );

    }

  }


  endTurnHoldTimer =
    setTimeout(
      ()=>{

        if(
          !endTurnHolding
        ){

          return;

        }


        completeEndTurnHold();

      },
      END_TURN_HOLD_MS
    );

}


function cancelEndTurnHold(){

  if(
    !endTurnHolding
  ){

    return;

  }


  endTurnHolding =
    false;


  if(
    endTurnHoldTimer
  ){

    clearTimeout(
      endTurnHoldTimer
    );


    endTurnHoldTimer =
      null;

  }


  playerEnergy.classList.remove(
    "holding"
  );


  renderEnergy(
    playerEnergy,
    actionsLeft
  );

}


function completeEndTurnHold(){

  if(
    gameOver ||
    turn !== "blue" ||
    actionsLeft <= 0
  ){

    cancelEndTurnHold();

    return;

  }


  endTurnHolding =
    false;


  endTurnHoldTimer =
    null;


  playerEnergy.classList.remove(
    "holding"
  );


  actionsLeft =
    0;


  soundEndTurn();


  renderEnergy(
    playerEnergy,
    0
  );


  finishPlayerTurn();

}


/* =========================
   END TURN INPUT
   MOBILE + OLD BROWSERS
========================= */

function startEnergyHold(e){

  if(e){

    e.preventDefault();

  }


  startEndTurnHold();

}


function stopEnergyHold(e){

  if(e){

    e.preventDefault();

  }


  if(
    endTurnHolding
  ){

    cancelEndTurnHold();

  }

}


/*
   TOUCH
   Mi Browser / old Android
*/

playerEnergy.addEventListener(
  "touchstart",
  startEnergyHold,
  {
    passive:false
  }
);


playerEnergy.addEventListener(
  "touchend",
  stopEnergyHold,
  {
    passive:false
  }
);


playerEnergy.addEventListener(
  "touchcancel",
  stopEnergyHold,
  {
    passive:false
  }
);


/*
   MOUSE
   Desktop
*/

playerEnergy.addEventListener(
  "mousedown",
  startEnergyHold
);


playerEnergy.addEventListener(
  "mouseup",
  stopEnergyHold
);


playerEnergy.addEventListener(
  "mouseleave",
  stopEnergyHold
);


/*
   Prevent browser long press menu
*/

playerEnergy.addEventListener(
  "contextmenu",
  e=>{

    e.preventDefault();

  }
);


/* =========================
   BOARD
========================= */

function buildBoard(){

  board
    .querySelectorAll(
      ".cell"
    )
    .forEach(
      cell=>cell.remove()
    );


  cells = [];


  for(
    let r=0;
    r<SIZE;
    r++
  ){

    cells[r] = [];


    for(
      let c=0;
      c<SIZE;
      c++
    ){

      const cell =
        document.createElement(
          "div"
        );


      cell.className =
        "cell";


      if(
        r === 0
      ){

        cell.classList.add(
          "goal-top"
        );

      }


      if(
        r === SIZE-1
      ){

        cell.classList.add(
          "goal-bottom"
        );

      }


      board.insertBefore(
        cell,
        wallLayer
      );


      cells[r][c] =
        cell;

    }

  }


  requestAnimationFrame(
    ()=>{

      renderAll();

      preparePlayerTurn();

    }
  );

}


/* =========================
   GEOMETRY
========================= */

function getCellBox(
  r,
  c
){

  const boardRect =
    board.getBoundingClientRect();


  const rect =
    cells[r][c]
      .getBoundingClientRect();


  return {

    left:
      rect.left -
      boardRect.left,

    right:
      rect.right -
      boardRect.left,

    top:
      rect.top -
      boardRect.top,

    bottom:
      rect.bottom -
      boardRect.top,

    centerX:
      (
        rect.left +
        rect.right
      ) / 2 -
      boardRect.left,

    centerY:
      (
        rect.top +
        rect.bottom
      ) / 2 -
      boardRect.top

  };

}


/* =========================
   RENDER
========================= */

function renderAll(){

  blueWallsText.textContent =
    blueWalls;


  redWallsText.textContent =
    redWalls;


  positionPawn(
    bluePawn,
    blue,
    false
  );


  positionPawn(
    redPawn,
    red,
    false
  );


  renderWalls();


  renderWallSlots();

}


/* =========================
   PAWN
========================= */

function positionPawn(
  pawn,
  pos,
  animate
){

  const box =
    getCellBox(
      pos.r,
      pos.c
    );


  pawn.style.left =
    box.centerX +
    "px";


  pawn.style.top =
    box.centerY +
    "px";


  if(animate){

    pawn.classList.remove(
      "moved"
    );


    void pawn.offsetWidth;


    pawn.classList.add(
      "moved"
    );

  }

}


/* =========================
   WALL RENDER
========================= */

function renderWalls(){

  wallLayer.innerHTML =
    "";


  hWalls.forEach(
    (owner,k)=>{

      const p =
        k
          .split(",")
          .map(Number);


      drawWall(
        "h",
        p[0],
        p[1],
        owner
      );

    }
  );


  vWalls.forEach(
    (owner,k)=>{

      const p =
        k
          .split(",")
          .map(Number);


      drawWall(
        "v",
        p[0],
        p[1],
        owner
      );

    }
  );


  newestWall =
    null;

}


function drawWall(
  type,
  r,
  c,
  owner
){

  const first =
    getCellBox(
      r,
      c
    );


  const wall =
    document.createElement(
      "div"
    );


  wall.className =
    "wall " +
    (
      owner === "blue"
      ?
      "blue-wall"
      :
      "red-wall"
    );


  const newest =
    newestWall &&
    newestWall.type === type &&
    newestWall.r === r &&
    newestWall.c === c;


  if(
    type === "h"
  ){

    wall.classList.add(
      "horizontal"
    );


    if(newest){

      wall.classList.add(
        "new-h"
      );

    }


    const second =
      getCellBox(
        r,
        c+1
      );


    const lower =
      getCellBox(
        r+1,
        c
      );


    const y =
      (
        first.bottom +
        lower.top
      ) / 2;


    wall.style.left =
      first.left +
      "px";


    wall.style.top =
      y +
      "px";


    wall.style.width =
      (
        second.right -
        first.left
      ) +
      "px";

  }

  else{

    wall.classList.add(
      "vertical"
    );


    if(newest){

      wall.classList.add(
        "new-v"
      );

    }


    const second =
      getCellBox(
        r+1,
        c
      );


    const right =
      getCellBox(
        r,
        c+1
      );


    const x =
      (
        first.right +
        right.left
      ) / 2;


    wall.style.left =
      x +
      "px";


    wall.style.top =
      first.top +
      "px";


    wall.style.height =
      (
        second.bottom -
        first.top
      ) +
      "px";

  }


  wallLayer.appendChild(
    wall
  );

}


/* =========================
   WALL SLOTS
========================= */

function renderWallSlots(){

  slotLayer.innerHTML =
    "";


  if(
    !wallMode ||
    turn !== "blue" ||
    actionsLeft <= 0 ||
    gameOver
  ){

    return;

  }


  for(
    let r=0;
    r<SIZE-1;
    r++
  ){

    for(
      let c=0;
      c<SIZE-1;
      c++
    ){

      if(
        !canPlaceWallBasic(
          wallOrientation,
          r,
          c
        )
      ){

        continue;

      }


      createWallAnchor(
        wallOrientation,
        r,
        c
      );

    }

  }

}


function createWallAnchor(
  type,
  r,
  c
){

  const tl =
    getCellBox(
      r,
      c
    );


  const tr =
    getCellBox(
      r,
      c+1
    );


  const bl =
    getCellBox(
      r+1,
      c
    );


  const anchor =
    document.createElement(
      "div"
    );


  anchor.className =
    "wall-anchor " +
    type;


  const centerX =
    (
      tl.right +
      tr.left
    ) / 2;


  const centerY =
    (
      tl.bottom +
      bl.top
    ) / 2;


  anchor.style.left =
    centerX +
    "px";


  anchor.style.top =
    centerY +
    "px";


  anchor.addEventListener(
    "click",
    e=>{

      e.preventDefault();

      e.stopPropagation();


      tryPlayerWall(
        type,
        r,
        c
      );

    }
  );


  slotLayer.appendChild(
    anchor
  );

}


/* =========================
   WALL RULES
========================= */

function canPlaceWallBasic(
  type,
  r,
  c
){

  if(
    r < 0 ||
    c < 0 ||
    r >= SIZE-1 ||
    c >= SIZE-1
  ){

    return false;

  }


  if(
    type === "h"
  ){

    if(
      hWalls.has(
        key(r,c)
      )
    ){

      return false;

    }


    if(
      c > 0 &&
      hWalls.has(
        key(r,c-1)
      )
    ){

      return false;

    }


    if(
      c < SIZE-2 &&
      hWalls.has(
        key(r,c+1)
      )
    ){

      return false;

    }

  }

  else{

    if(
      vWalls.has(
        key(r,c)
      )
    ){

      return false;

    }


    if(
      r > 0 &&
      vWalls.has(
        key(r-1,c)
      )
    ){

      return false;

    }


    if(
      r < SIZE-2 &&
      vWalls.has(
        key(r+1,c)
      )
    ){

      return false;

    }

  }


  return true;

}


/* =========================
   BLOCKED
========================= */

function blocked(
  r1,
  c1,
  r2,
  c2
){

  if(
    r2 === r1+1 &&
    c2 === c1
  ){

    if(
      hWalls.has(
        key(r1,c1)
      )
    ){
      return true;
    }


    if(
      c1 > 0 &&
      hWalls.has(
        key(r1,c1-1)
      )
    ){
      return true;
    }


    return false;

  }


  if(
    r2 === r1-1 &&
    c2 === c1
  ){

    if(
      hWalls.has(
        key(r2,c1)
      )
    ){
      return true;
    }


    if(
      c1 > 0 &&
      hWalls.has(
        key(r2,c1-1)
      )
    ){
      return true;
    }


    return false;

  }


  if(
    c2 === c1+1 &&
    r2 === r1
  ){

    if(
      vWalls.has(
        key(r1,c1)
      )
    ){
      return true;
    }


    if(
      r1 > 0 &&
      vWalls.has(
        key(r1-1,c1)
      )
    ){
      return true;
    }


    return false;

  }


  if(
    c2 === c1-1 &&
    r2 === r1
  ){

    if(
      vWalls.has(
        key(r1,c2)
      )
    ){
      return true;
    }


    if(
      r1 > 0 &&
      vWalls.has(
        key(r1-1,c2)
      )
    ){
      return true;
    }


    return false;

  }


  return true;

}


/* =========================
   PATH FINDING
========================= */

function getNeighbors(
  pos
){

  const dirs = [

    [-1,0],
    [1,0],
    [0,-1],
    [0,1]

  ];


  const result =
    [];


  for(
    const [dr,dc]
    of dirs
  ){

    const nr =
      pos.r + dr;


    const nc =
      pos.c + dc;


    if(
      !isInside(
        nr,
        nc
      )
    ){

      continue;

    }


    if(
      blocked(
        pos.r,
        pos.c,
        nr,
        nc
      )
    ){

      continue;

    }


    result.push({
      r:nr,
      c:nc
    });

  }


  return result;

}


function shortestPath(
  start,
  targetRow
){

  const startKey =
    key(
      start.r,
      start.c
    );


  const queue = [
    {
      r:start.r,
      c:start.c
    }
  ];


  const visited =
    new Set([
      startKey
    ]);


  const parent = {};


  let finalKey =
    null;


  while(
    queue.length
  ){

    const current =
      queue.shift();


    if(
      current.r ===
      targetRow
    ){

      finalKey =
        key(
          current.r,
          current.c
        );


      break;

    }


    for(
      const next
      of getNeighbors(
        current
      )
    ){

      const k =
        key(
          next.r,
          next.c
        );


      if(
        visited.has(k)
      ){

        continue;

      }


      visited.add(k);


      parent[k] =
        key(
          current.r,
          current.c
        );


      queue.push(
        next
      );

    }

  }


  if(!finalKey){

    return null;

  }


  const path =
    [];


  let current =
    finalKey;


  while(current){

    const parts =
      current
        .split(",")
        .map(Number);


    path.push({
      r:parts[0],
      c:parts[1]
    });


    if(
      current ===
      startKey
    ){

      break;

    }


    current =
      parent[current];

  }


  path.reverse();


  return path;

}


/* =========================
   PATH AVOID PLAYER
========================= */

function shortestPathAvoidPlayer(
  start,
  targetRow,
  avoid
){

  const startKey =
    key(
      start.r,
      start.c
    );


  const queue = [
    {
      r:start.r,
      c:start.c
    }
  ];


  const visited =
    new Set([
      startKey
    ]);


  const parent = {};


  let finalKey =
    null;


  while(
    queue.length
  ){

    const current =
      queue.shift();


    if(
      current.r ===
      targetRow
    ){

      finalKey =
        key(
          current.r,
          current.c
        );


      break;

    }


    for(
      const next
      of getNeighbors(
        current
      )
    ){

      if(
        avoid &&
        next.r === avoid.r &&
        next.c === avoid.c
      ){

        continue;

      }


      const k =
        key(
          next.r,
          next.c
        );


      if(
        visited.has(k)
      ){

        continue;

      }


      visited.add(k);


      parent[k] =
        key(
          current.r,
          current.c
        );


      queue.push(
        next
      );

    }

  }


  if(!finalKey){

    return null;

  }


  const path =
    [];


  let current =
    finalKey;


  while(current){

    const parts =
      current
        .split(",")
        .map(Number);


    path.push({
      r:parts[0],
      c:parts[1]
    });


    if(
      current ===
      startKey
    ){

      break;

    }


    current =
      parent[current];

  }


  path.reverse();


  return path;

}


/* =========================
   PATH TO EXACT CELL
========================= */

function shortestPathToCellAvoidPlayer(
  start,
  target,
  avoid
){

  const startKey =
    key(
      start.r,
      start.c
    );


  const targetKey =
    key(
      target.r,
      target.c
    );


  const queue = [
    {
      r:start.r,
      c:start.c
    }
  ];


  const visited =
    new Set([
      startKey
    ]);


  const parent = {};


  let found =
    false;


  while(
    queue.length
  ){

    const current =
      queue.shift();


    const currentKey =
      key(
        current.r,
        current.c
      );


    if(
      currentKey ===
      targetKey
    ){

      found =
        true;

      break;

    }


    for(
      const next
      of getNeighbors(
        current
      )
    ){

      if(
        avoid &&
        next.r === avoid.r &&
        next.c === avoid.c
      ){

        continue;

      }


      const k =
        key(
          next.r,
          next.c
        );


      if(
        visited.has(k)
      ){

        continue;

      }


      visited.add(k);


      parent[k] =
        currentKey;


      queue.push(
        next
      );

    }

  }


  if(
    !found
  ){

    return null;

  }


  const path =
    [];


  let current =
    targetKey;


  while(current){

    const parts =
      current
        .split(",")
        .map(Number);


    path.push({
      r:parts[0],
      c:parts[1]
    });


    if(
      current ===
      startKey
    ){

      break;

    }


    current =
      parent[current];

  }


  path.reverse();


  return path;

}


/* =========================
   PATH TO PLAYER SIDE
========================= */

function pathTowardPlayer(){

  const aroundBlue = [

    {
      r:blue.r-1,
      c:blue.c
    },

    {
      r:blue.r+1,
      c:blue.c
    },

    {
      r:blue.r,
      c:blue.c-1
    },

    {
      r:blue.r,
      c:blue.c+1
    }

  ];


  let bestPath =
    null;


  for(
    const target
    of aroundBlue
  ){

    if(
      !isInside(
        target.r,
        target.c
      )
    ){

      continue;

    }


    if(
      target.r === blue.r &&
      target.c === blue.c
    ){

      continue;

    }


    const path =
      shortestPathToCellAvoidPlayer(
        red,
        target,
        blue
      );


    if(
      !path
    ){

      continue;

    }


    if(
      !bestPath ||
      path.length <
      bestPath.length
    ){

      bestPath =
        path;

    }

  }


  return bestPath;

}


function shortestPathLength(
  start,
  target
){

  const path =
    shortestPath(
      start,
      target
    );


  return path
    ?
    path.length-1
    :
    Infinity;

}


function bothPlayersHavePath(){

  return (

    Number.isFinite(
      shortestPathLength(
        blue,
        0
      )
    )

    &&

    Number.isFinite(
      shortestPathLength(
        red,
        SIZE-1
      )
    )

  );

}


/* =========================
   PLAYER TURN
========================= */

function preparePlayerTurn(){

  if(gameOver){

    return;

  }


  cancelEndTurnHold();


  turn =
    "blue";


  actionsLeft =
    MAX_ENERGY;


  closeWallMode();


  botCard.classList.remove(
    "active"
  );


  botCard.classList.add(
    "inactive"
  );


  botState.textContent =
    "Waiting...";


  renderEnergy(
    botEnergy,
    0
  );


  playerCard.classList.remove(
    "inactive"
  );


  playerCard.classList.add(
    "active"
  );


  playerState.textContent =
    "YOUR TURN";


  renderEnergy(
    playerEnergy,
    MAX_ENERGY
  );


  controlsPanel.classList.remove(
    "disabled-view"
  );


  disableGameControls(
    false
  );


  soundTurn();

}


/* =========================
   PLAYER MOVE
========================= */

moveButtons.forEach(
  button=>{

    button.addEventListener(
      "click",
      ()=>{

        if(
          gameOver ||
          turn !== "blue" ||
          actionsLeft <= 0
        ){

          return;

        }


        closeWallMode();


        const direction =
          button.dataset.dir;


        let nr =
          blue.r;


        let nc =
          blue.c;


        if(
          direction === "up"
        ){
          nr--;
        }


        if(
          direction === "down"
        ){
          nr++;
        }


        if(
          direction === "left"
        ){
          nc--;
        }


        if(
          direction === "right"
        ){
          nc++;
        }


        if(
          !isInside(
            nr,
            nc
          )
          ||
          blocked(
            blue.r,
            blue.c,
            nr,
            nc
          )
        ){

          soundError();

          return;

        }


        if(
          nr === red.r &&
          nc === red.c
        ){

          soundError();

          return;

        }


        blue.r =
          nr;


        blue.c =
          nc;


        soundMove();


        positionPawn(
          bluePawn,
          blue,
          true
        );


        usePlayerAction();


        if(
          blue.r === 0
        ){

          playFinalAnimation(
            "blue"
          );

        }

      }
    );

  }
);


/* =========================
   WALL MODE
========================= */

wallModeBtn.addEventListener(
  "click",
  ()=>{

    if(
      gameOver ||
      turn !== "blue" ||
      actionsLeft <= 0
    ){

      return;

    }


    if(
      blueWalls <= 0
    ){

      soundError();

      return;

    }


    wallMode =
      !wallMode;


    wallModeBtn
      .classList
      .toggle(
        "active",
        wallMode
      );


    renderWallSlots();

  }
);


horizontalBtn.addEventListener(
  "click",
  ()=>{

    wallOrientation =
      "h";


    horizontalBtn
      .classList
      .add(
        "selected"
      );


    verticalBtn
      .classList
      .remove(
        "selected"
      );


    renderWallSlots();

  }
);


verticalBtn.addEventListener(
  "click",
  ()=>{

    wallOrientation =
      "v";


    verticalBtn
      .classList
      .add(
        "selected"
      );


    horizontalBtn
      .classList
      .remove(
        "selected"
      );


    renderWallSlots();

  }
);


function closeWallMode(){

  wallMode =
    false;


  wallModeBtn
    .classList
    .remove(
      "active"
    );


  slotLayer.innerHTML =
    "";

}


/* =========================
   PLAYER WALL
========================= */

function tryPlayerWall(
  type,
  r,
  c
){

  if(
    gameOver ||
    turn !== "blue" ||
    actionsLeft <= 0 ||
    blueWalls <= 0
  ){

    return;

  }


  if(
    !canPlaceWallBasic(
      type,
      r,
      c
    )
  ){

    soundError();

    return;

  }


  const walls =
    type === "h"
    ?
    hWalls
    :
    vWalls;


  const k =
    key(
      r,
      c
    );


  walls.set(
    k,
    "blue"
  );


  if(
    !bothPlayersHavePath()
  ){

    walls.delete(
      k
    );


    soundError();

    return;

  }


  blueWalls--;


  newestWall = {

    type:type,
    r:r,
    c:c

  };


  closeWallMode();


  soundWall();


  renderWalls();


  blueWallsText.textContent =
    blueWalls;


  usePlayerAction();

}


/* =========================
   PLAYER ACTION
========================= */

function usePlayerAction(){

  actionsLeft--;


  if(
    actionsLeft < 0
  ){

    actionsLeft =
      0;

  }


  soundEnergy();


  animateEnergyUse(
    playerEnergy,
    actionsLeft
  );


  if(
    actionsLeft > 0
  ){

    return;

  }


  finishPlayerTurn();

}


/* =========================
   FINISH PLAYER
========================= */

function finishPlayerTurn(){

  cancelEndTurnHold();


  closeWallMode();


  disableGameControls(
    true
  );


  controlsPanel.classList.add(
    "disabled-view"
  );


  playerCard.classList.remove(
    "active"
  );


  playerCard.classList.add(
    "inactive"
  );


  playerState.textContent =
    "WAITING";


  setTimeout(
    startBotTurn,
    600
  );

}


/* =========================
   BOT TURN
========================= */

function startBotTurn(){

  if(gameOver){

    return;

  }


  turn =
    "red";


  actionsLeft =
    MAX_ENERGY;


  botCard.classList.remove(
    "inactive"
  );


  botCard.classList.add(
    "active"
  );


  botState.textContent =
    "PLAYING";


  renderEnergy(
    botEnergy,
    MAX_ENERGY
  );


  soundTurn();


  setTimeout(
    botAction,
    700
  );

}


/* =========================
   BOT ACTION
========================= */

function botAction(){

  if(
    gameOver ||
    turn !== "red" ||
    actionsLeft <= 0
  ){

    return;

  }


  botState.textContent =
    "THINKING...";


  const blueBefore =
    shortestPathLength(
      blue,
      0
    );


  const redBefore =
    shortestPathLength(
      red,
      SIZE-1
    );


  let bestWall =
    null;


  if(
    redWalls > 0
  ){

    bestWall =
      findBestBotWall(
        blueBefore,
        redBefore
      );

  }


  let useWall =
    false;


  if(bestWall){

    if(
      blueBefore <= 3 &&
      bestWall.hurtBlue > 0 &&
      bestWall.score > 0
    ){

      useWall =
        true;

    }

    else if(
      blueBefore <
      redBefore &&
      bestWall.score >= 2
    ){

      useWall =
        true;

    }

    else if(
      bestWall.score >= 4
    ){

      useWall =
        true;

    }

  }


  if(
    useWall &&
    bestWall
  ){

    setTimeout(
      ()=>{

        const walls =
          bestWall.type === "h"
          ?
          hWalls
          :
          vWalls;


        walls.set(
          key(
            bestWall.r,
            bestWall.c
          ),
          "red"
        );


        redWalls--;


        newestWall = {

          type:
            bestWall.type,

          r:
            bestWall.r,

          c:
            bestWall.c

        };


        soundWall();


        renderWalls();


        redWallsText.textContent =
          redWalls;


        actionsLeft--;


        soundEnergy();


        animateEnergyUse(
          botEnergy,
          actionsLeft
        );


        botState.textContent =
          "PLACED WALL";


        scheduleNextBotAction();

      },
      470
    );


    return;

  }


  setTimeout(
    ()=>{

      const moveResult =
        botSmartMove();


      if(
        moveResult ===
        "moved"
        ||
        moveResult ===
        "approached"
      ){

        soundMove();


        positionPawn(
          redPawn,
          red,
          true
        );


        actionsLeft--;


        soundEnergy();


        animateEnergyUse(
          botEnergy,
          actionsLeft
        );


        if(
          moveResult ===
          "approached"
        ){

          botState.textContent =
            "APPROACHING";

        }

        else{

          botState.textContent =
            "MOVED";

        }


        if(
          red.r === SIZE-1
        ){

          playFinalAnimation(
            "red"
          );


          return;

        }


        scheduleNextBotAction();


        return;

      }


      botState.textContent =
        "BLOCKED";


      actionsLeft =
        0;


      renderEnergy(
        botEnergy,
        0
      );


      setTimeout(
        scheduleNextBotAction,
        450
      );

    },
    470
  );

}


/* =========================
   BOT TIMING
========================= */

function scheduleNextBotAction(){

  if(gameOver){

    return;

  }


  if(
    actionsLeft > 0
  ){

    botState.textContent =
      "THINKING...";


    setTimeout(
      botAction,
      900
    );

  }

  else{

    botState.textContent =
      "DONE";


    setTimeout(
      preparePlayerTurn,
      800
    );

  }

}


/* =========================
   BOT WALL AI
========================= */

function findBestBotWall(
  blueBefore,
  redBefore
){

  let best =
    null;


  for(
    let r=0;
    r<SIZE-1;
    r++
  ){

    for(
      let c=0;
      c<SIZE-1;
      c++
    ){

      for(
        const type
        of ["h","v"]
      ){

        if(
          !canPlaceWallBasic(
            type,
            r,
            c
          )
        ){

          continue;

        }


        const walls =
          type === "h"
          ?
          hWalls
          :
          vWalls;


        const k =
          key(
            r,
            c
          );


        walls.set(
          k,
          "red"
        );


        const blueAfter =
          shortestPathLength(
            blue,
            0
          );


        const redAfter =
          shortestPathLength(
            red,
            SIZE-1
          );


        if(
          !Number.isFinite(
            blueAfter
          )
          ||
          !Number.isFinite(
            redAfter
          )
        ){

          walls.delete(
            k
          );


          continue;

        }


        const hurtBlue =
          blueAfter -
          blueBefore;


        const hurtBot =
          redAfter -
          redBefore;


        let score =
          hurtBlue * 4
          -
          hurtBot * 3;


        const distanceToBlue =
          Math.abs(
            r-blue.r
          )
          +
          Math.abs(
            c-blue.c
          );


        if(
          distanceToBlue <= 3
        ){

          score += .6;

        }


        if(
          blueBefore <= 4 &&
          hurtBlue > 0
        ){

          score += 2;

        }


        if(
          hurtBlue <= 0
        ){

          score -= 2;

        }


        walls.delete(
          k
        );


        if(
          best === null ||
          score > best.score
        ){

          best = {

            type:type,

            r:r,

            c:c,

            score:score,

            hurtBlue:
              hurtBlue

          };

        }

      }

    }

  }


  return best;

}


/* =========================
   BOT SMART MOVE
========================= */

function botSmartMove(){

  const goalPath =
    shortestPathAvoidPlayer(
      red,
      SIZE-1,
      blue
    );


  if(
    goalPath &&
    goalPath.length > 1
  ){

    const next =
      goalPath[1];


    red.r =
      next.r;


    red.c =
      next.c;


    return "moved";

  }


  const approachPath =
    pathTowardPlayer();


  if(
    approachPath &&
    approachPath.length > 1
  ){

    const next =
      approachPath[1];


    red.r =
      next.r;


    red.c =
      next.c;


    return "approached";

  }


  return "stuck";

}


/* =========================
   CONTROLS
========================= */

function disableGameControls(
  disabled
){

  moveButtons.forEach(
    button=>{

      button.disabled =
        disabled;

    }
  );


  wallModeBtn.disabled =
    disabled;


  horizontalBtn.disabled =
    disabled;


  verticalBtn.disabled =
    disabled;

}


/* =========================
   FINAL
========================= */

function playFinalAnimation(
  winner
){

  gameOver =
    true;


  cancelEndTurnHold();


  closeWallMode();


  disableGameControls(
    true
  );


  const pawn =
    winner === "blue"
    ?
    bluePawn
    :
    redPawn;


  pawn.classList.add(
    "final"
  );


  board.classList.add(
    winner === "blue"
    ?
    "blue-finish"
    :
    "red-finish"
  );


  const targetRow =
    winner === "blue"
    ?
    0
    :
    SIZE-1;


  for(
    let c=0;
    c<SIZE;
    c++
  ){

    cells[targetRow][c]
      .classList
      .add(
        winner === "blue"
        ?
        "goal-flash-blue"
        :
        "goal-flash-red"
      );

  }


  soundWin();


  setTimeout(
    ()=>{

      showResult(
        winner
      );

    },
    1150
  );

}


/* =========================
   RESULT
========================= */

function showResult(
  winner
){

  resultOverlay
    .classList
    .remove(
      "hidden"
    );


  if(
    winner === "blue"
  ){

    resultIcon.textContent =
      "🏆";


    resultTitle.textContent =
      "YOU WIN!";


    resultText.textContent =
      "وصلتي لجهة الخصم قبلو 🔥";

  }

  else{

    resultIcon.textContent =
      "😈";


    resultTitle.textContent =
      "BOT WINS";


    resultText.textContent =
      "وصل لجهتك قبلك 😂";

  }

}


/* =========================
   RESET
========================= */

document
.getElementById(
  "restartBtn"
)
.addEventListener(
  "click",
  ()=>{


    cancelEndTurnHold();


    blue = {
      r:8,
      c:4
    };


    red = {
      r:0,
      c:4
    };


    blueWalls =
      10;


    redWalls =
      10;


    actionsLeft =
      MAX_ENERGY;


    turn =
      "blue";


    wallMode =
      false;


    wallOrientation =
      "h";


    gameOver =
      false;


    hWalls.clear();


    vWalls.clear();


    newestWall =
      null;


    bluePawn.className =
      "pawn blue";


    redPawn.className =
      "pawn red";


    board.className =
      "";


    for(
      let r=0;
      r<SIZE;
      r++
    ){

      for(
        let c=0;
        c<SIZE;
        c++
      ){

        cells[r][c]
          .classList
          .remove(
            "goal-flash-blue",
            "goal-flash-red"
          );

      }

    }


    horizontalBtn
      .classList
      .add(
        "selected"
      );


    verticalBtn
      .classList
      .remove(
        "selected"
      );


    resultOverlay
      .classList
      .add(
        "hidden"
      );


    renderAll();


    preparePlayerTurn();

  }
);


/* =========================
   RESIZE
========================= */

window.addEventListener(
  "resize",
  ()=>{

    requestAnimationFrame(
      renderAll
    );

  }
);


/* =========================
   START
========================= */

buildBoard();
