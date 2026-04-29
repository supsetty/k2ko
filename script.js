let recognition;
let isRecording = false;
let currentText = "";
let timerInterval;
let seconds = 0;
let timerDisplay;

const recordBtn = document.getElementById("recordBtn");
const liveText = document.getElementById("liveText");
const countdownEl = document.getElementById("countdown");

// Request notification permission immediately
Notification.requestPermission();

// ---------- WEB AUDIO ALARM (no file needed) ----------
function playAlarm() {
  const ctx = new AudioContext();
  const beep = (freq, start, duration) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration);
  };
  beep(880, 0, 0.3);
  beep(880, 0.4, 0.3);
  beep(1100, 0.8, 0.5);
}

// ---------- RECORD ----------
recordBtn.onclick = () => {
  if (!isRecording) {
    currentText = "";
    liveText.innerHTML = "";
    startRecordingTimer();

    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      currentText = final;
      liveText.innerHTML = 
        `<span style="color:#000">${final}</span>` +
        `<span style="color:#999">${interim}</span>`;
    };

    recognition.start();
    recordBtn.innerText = "Stop Recording";
    isRecording = true;

  } else {
    recognition.stop();
    stopRecordingTimer();
    recordBtn.innerText = "Start Recording";
    isRecording = false;
  }
};

// ---------- RECORDING TIMER ----------
function startRecordingTimer() {
  seconds = 0;
  if (countdownEl) countdownEl.innerText = "00:00:00";
  timerInterval = setInterval(() => {
    seconds++;
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    if (countdownEl) countdownEl.innerText = `${h}:${m}:${s}`;
  }, 1000);
}

function stopRecordingTimer() {
  clearInterval(timerInterval);
}

// ---------- SET REMINDER ----------
function startTimer(delaySeconds) {
  if (!currentText) {
    alert("Record something first");
    return;
  }

  const savedText = currentText; // save before reset
  const confirmSet = confirm(`Set reminder in ${delaySeconds} seconds?`);
  if (!confirmSet) return;

  resetUI();

  let remaining = delaySeconds;
  if (countdownEl) countdownEl.innerText = remaining;

  timerInterval = setInterval(() => {
    remaining--;
    if (countdownEl) countdownEl.innerText = remaining;
    if (remaining <= 0) {
      clearInterval(timerInterval);
      triggerAlarm(savedText); // pass saved text in
    }
  }, 1000);
}

// ---------- RESET ----------
function resetUI() {
  liveText.innerText = "Say your task...";
  currentText = "";
  if (countdownEl) countdownEl.innerText = "";
}

// ---------- ALARM ----------
function triggerAlarm(text) {
  playAlarm(); // Web Audio — no file, no CORS, no block
  showNotification(text);

  if (Notification.permission === "granted") {
    new Notification("k2k0 Reminder", { body: text || "Your task" });
  }
}

// ---------- STOP ALARM ----------
function stopAlarm() {
  removeNotification();
}

function remindLater() {
  stopAlarm();
  startTimer(15);
}

// ---------- NOTIFICATION DIV ----------
function showNotification(text) {
  removeNotification();
  const notif = document.createElement("div");
  notif.id = "notification";
  notif.innerHTML = `
    <div class="notif-title">k2k0 Reminder</div>
    <div class="notif-text">${text || "Your task"}</div>
    <div class="notif-actions">
      <button onclick="stopAlarm()">Done</button>
      <button onclick="remindLater()">Remind in 15s</button>
    </div>
  `;
  document.body.appendChild(notif);
}

function removeNotification() {
  const el = document.getElementById("notification");
  if (el) el.remove();
}
