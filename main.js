// main.js

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

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
    el.style.left = (l.x / canvas.width) * 100 + "%";
    el.style.top = (l.y / canvas.height) * 100 + "%";
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




// Each view is a layout function
const views = {
  all: layoutAll,
  cause: layoutByCause,
};

function showView(name) {
  views[name]();
  draw();
  drawLabels();
}

document
  .getElementById("btn-all")
  .addEventListener("click", () => showView("all"));
document
  .getElementById("btn-cause")
  .addEventListener("click", () => showView("cause"));

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

start();