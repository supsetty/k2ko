let recognition;
let isRecording = false;
let currentText = "";
let timerInterval;
let alarmAudio;

// ---------- ELEMENTS ----------
const recordBtn = document.getElementById("recordBtn");
const liveText = document.getElementById("liveText");
const countdownEl = document.getElementById("countdown");

// ---------- RECORD ----------
recordBtn.onclick = () => {
  if (!isRecording) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      currentText = transcript;
      liveText.innerText = transcript;
    };

    recognition.start();
    recordBtn.innerText = "Stop Recording";
    isRecording = true;

  } else {
    recognition.stop();
    recordBtn.innerText = "Start Recording";
    isRecording = false;
  }
};

// ---------- TIMER ----------
function startTimer(seconds) {
  if (!currentText) {
    alert("Please record a reminder first");
    return;
  }

  const confirmSet = confirm(`Set reminder for ${seconds} seconds?`);
  if (!confirmSet) return;

  // RESET UI after confirmation
  resetUI();

  let remaining = seconds;
  countdownEl.innerText = remaining;

  timerInterval = setInterval(() => {
    remaining--;
    countdownEl.innerText = remaining;

    if (remaining <= 0) {
      clearInterval(timerInterval);
      triggerAlarm();
    }
  }, 1000);
}

// ---------- RESET ----------
function resetUI() {
  liveText.innerText = "Say your task...";
  currentText = "";
  countdownEl.innerText = "";
}

// ---------- ALARM ----------
function triggerAlarm() {
  showNotification(currentText);

  alarmAudio = new Audio("https://www.soundjay.com/buttons/beep-01a.mp3");
  alarmAudio.loop = true;

  alarmAudio.play().catch(() => {
    document.body.addEventListener("click", () => {
      alarmAudio.play();
    }, { once: true });
  });
}

// ---------- STOP ----------
function stopAlarm() {
  if (alarmAudio) {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
  }
  removeNotification();
}

// ---------- REMIND LATER ----------
function remindLater() {
  stopAlarm();
  startTimer(15);
}

// ---------- NOTIFICATION ----------
function showNotification(text) {
  removeNotification();

  const notif = document.createElement("div");
  notif.id = "notification";

  notif.innerHTML = `
    <div class="notif-title">Reminder</div>
    <div class="notif-text">${text || "Your task"}</div>
    <div class="notif-actions">
      <button onclick="stopAlarm()">Done</button>
      <button onclick="remindLater()">Remind later</button>
    </div>
  `;

  document.body.appendChild(notif);
}

function removeNotification() {
  const existing = document.getElementById("notification");
  if (existing) existing.remove();
}
