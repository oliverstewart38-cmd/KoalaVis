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
  { name: "Found dead", color: "#B5443A" },
  { name: "No recorded outcome", color: "#B9B4A8" },
];



const views = {
  all: {
    layout: layoutAll,
    caption: "Every admission recorded between 2012 and 2025: 22,919 koalas, one square each.",
  },
  cause: {
    layout: layoutByCause,
    caption: "About 30% of admissions have no recorded cause. Vehicle strikes account for 4,123 admissions, or 18%. Each admission is counted once, under the first cause that applies: vehicle strike, dog attack, sick, then other injury.",
  },
  month: {
    layout: layoutByMonth,
    caption: "August to October is the busiest stretch, with 8,296 admissions (36% of the total in a quarter of the year), all years combined. This aligns with the start of koala breeding season.",
  },

  outcomes: {
    layout: layoutByOutcomes,
caption: "More than half of admissions (13,093, or 57%) have no recorded outcome, so these figures can't show how many koalas survive. Of the rest, 7,106 were released and 2,720 were found dead.",  },




};

const size = 3;
const gap = 1;
const pitch = size + gap;
const perRow = 150;

let squares = [];
let labels = [];

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  squares.forEach((sq) => {
    ctx.fillStyle = sq.color;
    ctx.fillRect(sq.x, sq.y, size, size);
  });
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
    labelBox.appendChild(el);
  });
}

// The names must match the cause text in koalas.json exactly.
const causes = [
  { name: "Sick", color: "#C68A2E" },
  { name: "No cause recorded", color: "#B9B4A8" },
  { name: "Vehicle strike", color: "#B5443A" },
  { name: "Dog attack", color: "#4F6B7A" },
  { name: "Other injury", color: "#C9A982" },
];


// Different modes:


// BY CAUSE
function layoutByCause() {
  const barCols = 50;
  const barGap = 24;

  // The floor of every bar. Sick is the tallest (9875 squares, 50 per row).
  const bottom = Math.ceil(9875 / barCols) * pitch;

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

  // "No recorded outcome" is the tallest bar (13,093 squares, 70 per row).
  const bottom = Math.ceil(13093 / barCols) * pitch;

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
    sq.y = Math.floor(i / perRow) * pitch;
    sq.color = "#3D6B45";
  });

 const rows = Math.ceil(squares.length / perRow);
  labels = [
    { name: "All admissions", count: squares.length, x: (perRow * pitch) / 2, y: rows * pitch + 8 },
  ];
}


// BY MONTH

function layoutByMonth() {
  const barCols = 20;
  const barGap = 12;
  const bottom = Math.ceil(2935 / barCols) * pitch;     // step 3
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


function showView(name) {
  views[name].layout();
  const t0 = performance.now();
  draw();
  console.log("draw took", Math.round(performance.now() - t0), "ms");
  drawLabels();
  document.getElementById("caption").textContent = views[name].caption;



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

async function start() {
  const res = await fetch("koalas.json");
  const koalas = await res.json();
  console.log(koalas.length);

  canvas.width = 5 * (50 * pitch) + 4 * 24;
  canvas.height = Math.ceil(9875 / 50) * pitch + 50;

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
  const rect = canvas.getBoundingClientRect();
  // Convert from screen pixels to canvas pixels. This stays correct even if CSS resizes the canvas.
  const x = (event.clientX - rect.left) * (canvas.width / rect.width);
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);

  const hit = squares.find((sq) =>
    x >= sq.x && x < sq.x + pitch && y >= sq.y && y < sq.y + pitch
  );
  if (hit) showCard(hit.koala);
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





// SCALLING
window.addEventListener("resize", drawLabels);

start();