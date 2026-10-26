// main.js

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const size = 3;      // square width and height
const gap = 1;       // space between squares
const pitch = size + gap;
const perRow = 150;  // squares per row

let squares = [];

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  squares.forEach((sq) => {
    ctx.fillStyle = sq.color;
    ctx.fillRect(sq.x, sq.y, size, size);
  });
}

const causes = [
  { name: "Sick", color: "#C68A2E" },
  { name: "No cause recorded", color: "#B9B4A8" },
  { name: "Vehicle strike", color: "#B5443A" },
  { name: "Dog attack", color: "#4F6B7A" },
  { name: "Other injury", color: "#C9A982" },
];

function layoutByCause() {
  const groupCols = 50;
  const groupGap = 24;
  const bottom = Math.ceil(9875 / groupCols) * pitch;
  const counts = {};

  squares.forEach((sq) => {
    const cause = sq.koala.cause;
    const g = causes.findIndex((c) => c.name === cause);
    const k = counts[cause] || 0;
    counts[cause] = k + 1;

    const col = k % groupCols;
    const row = Math.floor(k / groupCols);

    sq.x = g * (groupCols * pitch + groupGap) + col * pitch;
    sq.y = bottom - (row + 1) * pitch;
    sq.color = causes[g].color;
  });
  console.log(counts);
}

async function start() {
  const res = await fetch("koalas.json");
  const koalas = await res.json();
  console.log(koalas.length);

  canvas.width = 5 * (50 * pitch) + 4 * 24;
  canvas.height = Math.ceil(9875 / 50) * pitch;

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