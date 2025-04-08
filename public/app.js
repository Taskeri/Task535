
let count = 0;
let interval;
let prevFrame;
const BRIGHTNESS_THRESHOLD = 1000000;
const INTERVAL_MS = 3000;

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const countSpan = document.getElementById("count");
const materialSelect = document.getElementById("materialSelect");

navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then((stream) => (video.srcObject = stream));

function loadMaterials() {
  fetch("/materials")
    .then((res) => res.json())
    .then((data) => {
      materialSelect.innerHTML = "";
      data.materials.forEach((mat) => {
        const option = document.createElement("option");
        option.value = option.text = mat;
        materialSelect.appendChild(option);
      });
      start();
    });
}

function start() {
  interval = setInterval(detect, INTERVAL_MS);
}

function detect() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const curr = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (!prevFrame) {
    prevFrame = curr;
    return;
  }
  let diff = 0;
  for (let i = 0; i < curr.data.length; i += 4) {
    const b1 = (curr.data[i] + curr.data[i+1] + curr.data[i+2]) / 3;
    const b2 = (prevFrame.data[i] + prevFrame.data[i+1] + prevFrame.data[i+2]) / 3;
    diff += Math.abs(b1 - b2);
  }
  if (diff > BRIGHTNESS_THRESHOLD) {
    count++;
    countSpan.textContent = count;
    send();
  }
  prevFrame = curr;
}

function send() {
  const timestamp = new Date().toLocaleString("he-IL");
  const material = materialSelect.value;
  fetch("/send-to-sheet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp, material })
  }).then((res) => {
    if (!res.ok) alert("שגיאה בשליחה");
  });
}

loadMaterials();
    