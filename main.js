// main.js

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const months = [

  

{ name: "Jan", color: "#3D6B45" },
  { name: "Feb", color: "#3D6B45" },
  { name: "Mar", color: "#3D6B45" },
  { name: "Apr", color: "#3D6B45" },
  { name: "May", color: "#3D6B45" },
  { name: "Jun", color: "#3D6B45" },
  { name: "Jul", color: "#3D6B45" },
  { name: "Aug", color: "#B5443A" },
  { name: "Sep", color: "#B5443A" },
  { name: "Oct", color: "#B5443A" },
 {name: "Nov", color: "#3D6B45" },
  { name: "Dec", color: "#3D6B45" },
]

const outcomes = [
  { name: "Released", color: "#3D6B45" },
{ name: "Recorded as dead", color: "#B5443A" },
  { name: "No recorded outcome", color: "#B9B4A8" },
];
const councils = [
  { name: "Moreton Bay", lga: "Moreton Bay Regional Council", density: 256 },
  { name: "Redland", lga: "Redland City Council", density: 317 },
  { name: "Gold Coast", lga: "Gold Coast City Council", density: 511 },
  { name: "Brisbane", lga: "Brisbane City Council", density: 992 },
  { name: "Other areas", lga: null, density: null },
];


// The names must match the cause text in koalas.json exactly.
const causes = [
  { name: "Sick", color: "#C68A2E" },
  { name: "No cause recorded", color: "#B9B4A8" },
  { name: "Vehicle strike", color: "#B5443A" },
  { name: "Dog attack", color: "#4F6B7A" },
  { name: "Under threat", color: "#2B2B28" },
  { name: "Other", color: "#C9A982" },
];
const causeOrder = ["Vehicle strike", "Dog attack", "Sick", "Under threat", "Other", "No cause recorded"];
const stackKey = [...causeOrder].reverse().map((n) => causes.find((c) => c.name === n));


const views = {
  all: {
    layout: layoutAll,
    caption: "Every admission recorded from January 2012 to June 2025: 22,919 admissions, one square each.",
    key: [{ name: "One admission", color: "#3D6B45" }],
    
  },
  cause: {
    layout: layoutByCause,
caption: "Causes as recorded when each koala was first assessed. Vehicle strikes account for 4,123 admissions, or 18%. 'Other' (1,984) covers koalas injured in another way, orphaned, that had a fall, or were recorded as dead. About 19% (4,290) have no cause recorded. Each admission is counted once, under the first cause that applies: vehicle strike, dog attack, sick, under threat, then other.", key: causes,
 
  },
  month: {
    layout: layoutByMonth,
    caption: "August to October is the busiest stretch, with 8,296 admissions (36% of the total in a quarter of the year), all years combined. This aligns with the start of koala breeding season.",
  key: [{ name: "August to October", color: "#B5443A" }, { name: "Other months", color: "#3D6B45" }],
  
  
  },

   outcomes: {
    layout: layoutByOutcomes,
    caption: "More than half of admissions (13,093, or 57%) have no recorded outcome, so these figures can't show how many koalas survive. Of the rest, 7,106 were released and 2,720 were recorded as dead when first assessed.",
  key: outcomes,
  
  
  
  },

  council: {
    layout: layoutByCouncil,
caption: "Council areas run from the least to the most densely populated, left to right. Vehicle strikes account for 15.0% of admissions in Moreton Bay, 16.3% in Redland, 18.9% on the Gold Coast and 27.6% in Brisbane, the densest area. The order of the first three is less certain, because 29% of Moreton Bay admissions have no recorded cause, against 10% to 14% elsewhere. 'Other areas' groups every other council and has no density figure, so it sits outside the comparison. Four areas show a pattern but cannot prove that density causes it, and density is only a stand-in for roads and traffic, which this data does not measure.", 
 
  },
};


const size = 3;
const gap = 1;
const pitch = size + gap;
const FLOOR = Math.ceil(9875 / 50) * pitch;  // the tallest any view gets (the Sick bar in the cause view)
const perRow = 150;

let squares = [];
let labels = [];

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  squares.forEach((sq) => {
    ctx.fillStyle = sq.color;
    ctx.fillRect(sq.x, sq.y, size, size);
  });

  if (hovered) highlight(hovered, "#6B6A66");    // grey outline on hover
if (selected) highlight(selected, "#2B2B28");  // dark outline once clicked
}

const labelBox = document.getElementById("labels");

function drawLabels() {
  labelBox.innerHTML = "";
  labels.forEach((l) => {
    const el = document.createElement("div");
    el.classList.add("label");
    el.style.left = canvas.offsetLeft + (l.x / canvas.width) * canvas.clientWidth + "px";
    el.style.top = canvas.offsetTop + (l.y / canvas.height) * canvas.clientHeight + "px";
    el.textContent = l.name;
    const count = document.createElement("span");
    count.classList.add("count");
    count.textContent = l.count.toLocaleString();
    el.appendChild(count);
    (l.notes || []).forEach((n) => {
      const note = document.createElement("span");
      note.classList.add("count");
      note.textContent = n;
      el.appendChild(note);
    });
    labelBox.appendChild(el);
  });
}


// Different modes:


// BY CAUSE
function layoutByCause() {
  const barCols = 50;
  const barGap = 24;

  // The floor of every bar, shared by all views.
  const bottom = FLOOR;

  // Tally of how many squares each bar has so far, 
  const counts = {};

  squares.forEach((sq) => {
    const cause = sq.koala.cause;
    const g = causes.findIndex((c) => c.name === cause); // bar number: Sick = 0, Vehicle strike = 2
    const k = counts[cause] || 0; // this square's place within its bar
    counts[cause] = k + 1;

    const col = k % barCols;
    const row = Math.floor(k / barCols);

    // Bar's left edge plus the column.
    sq.x = g * (barCols * pitch + barGap) + col * pitch;
    // Counts up from the floor, so all the bars sit flat on the bottom.
    sq.y = bottom - (row + 1) * pitch;
    sq.color = causes[g].color;
  });


   labels = causes.map((c, g) => ({
    name: c.name,
    count: counts[c.name],
    x: g * (barCols * pitch + barGap) + (barCols * pitch) / 2,
    y: bottom + 8,
  }));
  console.log(counts);
}

// BY OUTCOMES 

function layoutByOutcomes() {
  const barCols = 70;
  const barGap = 60;

  const bottom = FLOOR;

  const counts = {};

  squares.forEach((sq) => {
    const outcome = sq.koala.outcome;                         // singular, e.g. "Released"
    const g = outcomes.findIndex((o) => o.name === outcome);  // the global array
    const k = counts[outcome] || 0;
    counts[outcome] = k + 1;

    const col = k % barCols;
    const row = Math.floor(k / barCols);

    sq.x = g * (barCols * pitch + barGap) + col * pitch;
    sq.y = bottom - (row + 1) * pitch;
    sq.color = outcomes[g].color;
  });

  labels = outcomes.map((o, g) => ({
    name: o.name,
    count: counts[o.name],
    x: g * (barCols * pitch + barGap) + (barCols * pitch) / 2,
    y: bottom + 8,
  }));
  console.log(counts);
}

//BY ALL 

function layoutAll() {
  squares.forEach((sq, i) => {
    sq.x = (i % perRow) * pitch;
    sq.y = FLOOR - (Math.floor(i / perRow) + 1) * pitch;
    sq.color = "#3D6B45";
  });

  labels = [
    { name: "All admissions", count: squares.length, x: (perRow * pitch) / 2, y: FLOOR + 8 },
  ];
}


// BY MONTH

function layoutByMonth() {
  const barCols = 20;
  const barGap = 12;
  const bottom = FLOOR;
  const counts = {};

  squares.forEach((sq) => {
    const m = sq.koala.month;      // 1 to 12
    const g = sq.koala.month -1;                 
    const k = counts[m] || 0;
    counts[m] = k + 1;


    const col = k % barCols;
    const row = Math.floor(k / barCols);


        sq.x = g * (barCols * pitch + barGap) + col * pitch;
    sq.y = bottom - (row + 1) * pitch;
    sq.color = months[g].color; 
  });

  labels = months.map((m, g) => ({
    name: m.name,
    count: counts[g + 1],
    x: g * (barCols * pitch + barGap) + (barCols * pitch) / 2,
    y: bottom + 8,
  }));
}





// BY COUNCIL

function layoutByCouncil() {
  const barCols = 50;
  const barGap = 24;

  const bottom = FLOOR;
  const counts = {};
  const vehicle = {};


  const ordered = [...squares].sort(
  (a, b) => causeOrder.indexOf(a.koala.cause) - causeOrder.indexOf(b.koala.cause)
);
ordered.forEach((sq) => {
    const council = sq.koala.lga;
  const found = councils.findIndex((o) => o.lga === council);
  const g = found === -1 ? councils.length - 1 : found;
  const k = counts[g] || 0;
  counts[g] = k + 1;
  if (sq.koala.cause === "Vehicle strike") vehicle[g] = (vehicle[g] || 0) + 1;




    const col = k % barCols;
    const row = Math.floor(k / barCols);
const ci = causes.findIndex((c) => c.name === sq.koala.cause);
    sq.x = g * (barCols * pitch + barGap) + col * pitch;
    sq.y = bottom - (row + 1) * pitch;
    
sq.color = causes[ci].color;   });

  labels = councils.map((o, g) => ({
    name: o.name,
    count: counts[g],
    notes: [
      o.density ? o.density + " people per km²" : null,
      (((vehicle[g] || 0) / counts[g]) * 100).toFixed(1) + "% vehicle strikes",
    ].filter(Boolean),
    x: g * (barCols * pitch + barGap) + (barCols * pitch) / 2,
    y: bottom + 8,
  }));
  console.log(counts);
}




function drawKey(items) {
  const keyBox = document.getElementById("key");
  keyBox.innerHTML = "";
  items.forEach((item) => {
    const row = document.createElement("div");
    row.classList.add("key-row");

    const swatch = document.createElement("span");
    swatch.classList.add("swatch");
    swatch.style.background = item.color;
    const text = document.createElement("span");
    text.textContent = item.name          // the item's name

    row.appendChild(swatch);
    row.appendChild(text);
    keyBox.appendChild(row);
  });
}



let animating = false;

function animate() {
  const t0 = performance.now();
  let moving = false;

  squares.forEach((sq) => {
    const dx = sq.tx - sq.x;
    const dy = sq.ty - sq.y;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
sq.x = sq.x + dx / 5;
sq.y = sq.y + dy / 5;
      moving = true;
    } else {
      sq.x = sq.tx;   // close enough: snap to the destination
      sq.y = sq.ty;
    }
  });

  draw();
  console.log("frame took", Math.round(performance.now() - t0), "ms");

  if (moving) requestAnimationFrame(animate);
  else animating = false;
}

function startAnimation() {
  if (!animating) {          // stops two loops running if you click twice quickly
    animating = true;
    requestAnimationFrame(animate);
  }
}



function showView(name) {
  squares.forEach((sq) => { sq.px = sq.x; sq.py = sq.y; });   
  views[name].layout();                                       
  squares.forEach((sq) => {
    sq.tx = sq.x;  sq.ty = sq.y;                            
    sq.x = sq.px;  sq.y = sq.py;                
                  
  });

document.querySelectorAll("#buttons button").forEach((b) => b.classList.toggle("active", b.id === "btn-" + name));

  drawLabels();
  document.getElementById("caption").textContent = views[name].caption;
  drawKey(views[name].key);
  startAnimation();
}
document
  .getElementById("btn-all")
  .addEventListener("click", () => showView("all"));
document
  .getElementById("btn-cause")
  .addEventListener("click", () => showView("cause"));

  document
  .getElementById("btn-month")
  .addEventListener("click", () => showView("month"));

   document
  .getElementById("btn-outcomes")
  .addEventListener("click", () => showView("outcomes"));
     document
  .getElementById("btn-council")
  .addEventListener("click", () => showView("council"));
  
document.getElementById("btn-random").addEventListener("click", () => {
  const pick = squares[Math.floor(Math.random() * squares.length)];   // a random square: Math.random() times squares.length, rounded down
  selected = pick;             // it gets the dark outline, like a clicked square
  showCard(pick.koala);
  if (!animating) draw();
});

async function start() {
  const res = await fetch("koalas.json");
  const koalas = await res.json();
  console.log(koalas.length);

canvas.width = 6 * (50 * pitch) + 5 * 24;
  canvas.height = FLOOR + 90;

  squares = koalas.map((koala) => ({
    koala: koala,
    x: 0,
    y: 0,
    color: "#3D6B45",
  }));

  showView("all");
}


// CLICKING ON SQUARE
canvas.addEventListener("click", (event) => {
  const hit = nearestSquare(event);
  if (hit) {
    selected = hit;
    showCard(hit.koala);
    draw();
  }
});

canvas.addEventListener("mousemove", (event) => {
  const hit = nearestSquare(event);
  if (hit !== hovered) {              // only redraw when the hovered square changes
    hovered = hit;
    canvas.style.cursor = hit ? "pointer" : "default";
    if (!animating) draw();           // while animating, the animation redraws every frame anyway
  }
});

canvas.addEventListener("mouseleave", () => {
  hovered = null;
  canvas.style.cursor = "default";
  if (!animating) draw();
});



function showCard(koala) {
  const name = koala.name || "Unnamed koala";

  // filter(Boolean) drops any null parts, so a missing suburb or LGA just disappears.
  const parts = [koala.suburb, koala.lga].filter(Boolean);
  const place = parts.length ? parts.join(", ") : "Location not recorded";

  // Turns "2012-06-19" into "19 June 2012".
  const when = new Date(koala.date).toLocaleDateString("en-AU", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });

  document.getElementById("card").textContent =
    name + ". " + place + ". Cause: " + koala.cause + ". Outcome: " + koala.outcome + ". Admitted " + when + ".";
}


// HOVERRRINGGGG: 
let hovered = null;   // the square under the mouse
let selected = null;  // the square that was last clicked


// Finds the square nearest the mouse, if one is within a few pixels. Returns null if not.
function nearestSquare(event) {
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.width / rect.width;                // canvas pixels per screen pixel
  const x = (event.clientX - rect.left) * scale;
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);
  const maxDist = 10 * scale;                             // snap range: 10 screen pixels

  let best = null;
  let bestDist = maxDist;
  squares.forEach((sq) => {
    const dx = x - (sq.x + pitch / 2);   // the horizontal gap between the mouse and this square's centre
    const dy = y - (sq.y + pitch / 2);   // the vertical gap
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < bestDist) {
      best = sq;
      bestDist = dist;
    }
  });
  return best;
}



function highlight(sq, outline) {
  ctx.fillStyle = sq.color;
  ctx.fillRect(sq.x - 2, sq.y - 2, size + 4, size + 4);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = outline;
  ctx.strokeRect(sq.x - 2, sq.y - 2, size + 4, size + 4);
}
















// SCALLING
window.addEventListener("resize", drawLabels);

start();