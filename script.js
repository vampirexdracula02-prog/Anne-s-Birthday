script.js
const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 150;

ctx.fillStyle = "#555";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.globalCompositeOperation = "destination-out";

let scratching = false;

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!scratching) return;

  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];

  ctx.beginPath();
  ctx.arc(
    touch.clientX - rect.left,
    touch.clientY - rect.top,
    20,
    0,
    Math.PI * 2
  );
  ctx.fill();

  checkReveal();
}, { passive: false });

  });
});

function scratch(e) {
  if (!scratching) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();

  checkReveal();
}
function checkReveal() {
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let cleared = 0;
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] === 0) cleared++;
  }

  if (cleared > pixels.length / 8) {
    canvas.style.display = "none";
    document.getElementById("instructions").style.display = "none";
    document.getElementById("message").classList.remove("hidden");

    setTimeout(() => {
      document.getElementById("blowSection").classList.remove("hidden");
      initMic();
    }, 4000);
  }
}

function initMic() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const audioContext = new AudioContext();
      const mic = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      mic.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);

      function detectBlow() {
        analyser.getByteFrequencyData(data);
        let volume = data.reduce((a, b) => a + b) / data.length;

        if (volume > 40) {
          document.getElementById("candle").textContent = "💨";
          setTimeout(() => {
            document.getElementById("blowSection").style.display = "none";
            document.getElementById("letter").classList.remove("hidden");
          }, 1000);
        } else {
          requestAnimationFrame(detectBlow);
        }
      }
      detectBlow();
    });
}
