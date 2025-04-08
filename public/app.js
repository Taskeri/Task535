
let count = 0;
let prevBrightness = null;
let interval = null;
const THRESHOLD = 25;
const INTERVAL_MS = 3000;

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const countEl = document.getElementById("count");
const materialSelect = document.getElementById("materialSelect");
const statusEl = document.getElementById("status");

navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } })
  .then(stream => video.srcObject = stream)
  .catch(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => video.srcObject = stream);
  });

function detectChange() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const current = getBrightness(imageData);
  if (prevBrightness !== null && Math.abs(current - prevBrightness) > THRESHOLD) {
    count++;
    countEl.innerText = count;
    sendData();
  }
  prevBrightness = current;
}
function getBrightness(imageData) {
  let total = 0;
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    total += 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
  }
  return total / (data.length / 4);
}
function sendData() {
  fetch("/send-to-sheet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      material: materialSelect.value
    })
  }).then(() => {
    statusEl.innerText = "✅ נשלח בהצלחה";
  }).catch(() => {
    statusEl.innerText = "❌ שגיאה בשליחה";
  });
}
function manualSend() {
  sendData();
}
function loadMaterials() {
  fetch("/materials")
    .then(res => res.json())
    .then(data => {
      materialSelect.innerHTML = "";
      data.materials.forEach(mat => {
        const option = document.createElement("option");
        option.value = mat;
        option.text = mat;
        materialSelect.appendChild(option);
      });
    });
}
loadMaterials();
interval = setInterval(detectChange, INTERVAL_MS);
