// main.js

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");



async function start() {
  const res = await fetch("koalas.json");
  const koalas = await res.json();
  const size = 5;      // square width and height
const gap = 1;       // space between squares
const pitch = size + gap;
const perRow = 150;  // squares per row
const rows = Math.ceil(koalas.length / perRow); 
  console.log(koalas.length); // console should print: 22919
canvas.width = perRow * pitch
canvas.height= rows * pitch;




  ctx.fillStyle = "#3D6B45";  // colour

for (let i = 0; i < koalas.length; i++) {
  const col = i % perRow;
  const row = Math.floor(i / perRow);
  ctx.fillRect(col * pitch, row * pitch,  size, size); 
}
}




start();
