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
  { name: "Other injury", color: "#C9A982" },
];
const causeOrder = ["Vehicle strike", "Dog attack", "Sick", "Other injury", "No cause recorded"];


const views = {
  all: {
    layout: layoutAll,
    caption: "Every admission recorded between 2012 and 2025: 22,919 koalas, one square each.",
    key: [{ name: "One admission", color: "#3D6B45" }],
    
  },
  cause: {
    layout: layoutByCause,
    caption: "About 30% of admissions have no recorded cause. Vehicle strikes account for 4,123 admissions, or 18%. Each admission is counted once, under the first cause that applies: vehicle strike, dog attack, sick, then other injury.",
 key: causes,
 
  },
  month: {
    layout: layoutByMonth,
    caption: "August to October is the busiest stretch, with 8,296 admissions (36% of the total in a quarter of the year), all years combined. This aligns with the start of koala breeding season.",
  key: [{ name: "August to October", color: "#B5443A" }, { name: "Other months", color: "#3D6B45" }],
  
  
  },

   outcomes: {
    layout: layoutByOutcomes,
    caption: "More than half of admissions (13,093, or 57%) have no recorded outcome, so these figures can't show how many koalas survive. Of the rest, 7,106 were released and 2,720 were found dead.",
  key: outcomes,
  
  
  
  },

  council: {
    layout: layoutByCouncil,
    caption: "Ordered from the least to the most densely populated council area, the share of admissions caused by vehicle strikes rises: 15.0% in Moreton Bay, 16.3% in Redland, 18.9% on the Gold Coast and 27.6% in Brisbane. Four council areas cannot prove a cause, and population density only stands in for roads and traffic, which this data does not include.",
 key: causes,
 
 
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


  const ordered = [...squares].sort(
  (a, b) => causeOrder.indexOf(a.koala.cause) - causeOrder.indexOf(b.koala.cause)
);
ordered.forEach((sq) => {
    const council = sq.koala.lga;
  const found = councils.findIndex((o) => o.lga === council);
  const g = found === -1 ? councils.length - 1 : found;
  const k = counts[g] || 0;
  counts[g] = k + 1;
  

  


    const col = k % barCols;
    const row = Math.floor(k / barCols);
const ci = causes.findIndex((c) => c.name === sq.koala.cause);
    sq.x = g * (barCols * pitch + barGap) + col * pitch;
    sq.y = bottom - (row + 1) * pitch;
    
sq.color = causes[ci].color;   });

  labels = councils.map((o, g) => ({
    name: o.name,
    count: counts[g],
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

function showView(name) {
  views[name].layout();
  const t0 = performance.now();
  draw();
  console.log("draw took", Math.round(performance.now() - t0), "ms");
  drawLabels();
  document.getElementById("caption").textContent = views[name].caption;
drawKey(views[name].key)


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


async function start() {
  const res = await fetch("koalas.json");
  const koalas = await res.json();
  console.log(koalas.length);

  canvas.width = 5 * (50 * pitch) + 4 * 24;
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