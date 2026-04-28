let recognition;
let currentText = "";
let timerInterval;
let alarmAudio;

// ---------- SPEECH ----------
const recordBtn = document.getElementById("recordBtn");
const liveText = document.getElementById("liveText");

recordBtn.onclick = () => {
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
};

// ---------- TIMER ----------
const countdownEl = document.getElementById("countdown");
const doneScreen = document.getElementById("doneScreen");
const finalTask = document.getElementById("finalTask");

function startTimer(seconds) {
  clearInterval(timerInterval);

  let remaining = seconds;
  countdownEl.innerText = remaining;
  doneScreen.classList.add("hidden");

  timerInterval = setInterval(() => {
    remaining--;
    countdownEl.innerText = remaining;

    if (remaining <= 0) {
      clearInterval(timerInterval);
      triggerAlarm();
    }
  }, 1000);
}

// ---------- ALARM ----------
function triggerAlarm() {
  finalTask.innerText = currentText || "Your task";

  doneScreen.classList.remove("hidden");

  alarmAudio = new Audio("https://www.soundjay.com/buttons/beep-01a.mp3");
  alarmAudio.loop = true;

  alarmAudio.play().catch(() => {
    document.body.addEventListener("click", () => {
      alarmAudio.play();
    }, { once: true });
  });
}

function stopAlarm() {
  if (alarmAudio) {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
  }
  doneScreen.classList.add("hidden");
  countdownEl.innerText = "";
}
