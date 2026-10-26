// main.js

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const size = 3;
const gap = 1;
const pitch = size + gap;
const perRow = 150;

let squares = [];

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  squares.forEach((sq) => {
    ctx.fillStyle = sq.color;
    ctx.fillRect(sq.x, sq.y, size, size);
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

function layoutByCause() {
  const barCols = 50;
  const barGap = 24;

  // The floor of every bar. Sick is the tallest (9875 squares, 50 per row).
  const bottom = Math.ceil(9875 / barCols) * pitch;

  // Tally of how many squares each bar has so far, e.g. { Sick: 12 }.
  const counts = {};

  squares.forEach((sq) => {
    const cause = sq.koala.cause;
    const g = causes.findIndex((c) => c.name === cause);  // bar number: Sick = 0, Vehicle strike = 2
    const k = counts[cause] || 0;                         // this square's place within its bar
    counts[cause] = k + 1;

    const col = k % barCols;
    const row = Math.floor(k / barCols);

    // Bar's left edge plus the column.
    sq.x = g * (barCols * pitch + barGap) + col * pitch;
    // Counts up from the floor, so all the bars sit flat on the bottom.
    sq.y = bottom - (row + 1) * pitch;
    sq.color = causes[g].color;
  });
  console.log(counts);
}

async function start() {
  const res = await fetch("koalas.json");
  const koalas = await res.json();
  console.log(koalas.length);

  // 5 bars of 50 squares plus 4 gaps, and tall enough for the Sick bar.
  canvas.width = 5 * (50 * pitch) + 4 * 24;
  canvas.height = Math.ceil(9875 / 50) * pitch;

  // One square per koala, starting as one block. layoutByCause() moves them into bars.
  squares = koalas.map((koala, i) => ({
    koala: koala,
    x: (i % perRow) * pitch,
    y: Math.floor(i / perRow) * pitch,
    color: "#3D6B45",
  }));

  layoutByCause();
  draw();
}

start();