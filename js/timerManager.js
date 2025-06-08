// js/timerManager.js
let timerInterval;
let seconds = 0;
const timerDisplayElement = document.getElementById('timer');

function updateDisplay() {
    if (!timerDisplayElement) return;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timerDisplayElement.textContent =
        `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function startTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    updateDisplay();
    timerInterval = setInterval(() => {
        seconds++;
        updateDisplay();
    }, 1000);
}

export function stopTimer() {
    clearInterval(timerInterval);
}

export function resetTimerAndDisplay() {
    clearInterval(timerInterval);
    seconds = 0;
    updateDisplay();
}

export function getCurrentTimeValue() {
    return timerDisplayElement ? timerDisplayElement.textContent : "00:00";
}

export function getCurrentSeconds() {
    return seconds;
}