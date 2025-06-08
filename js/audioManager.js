// js/audioManager.js
const audioPlayer = document.getElementById('audio-player');
const playButton = document.getElementById('play-button');
const pauseButton = document.getElementById('pause-button');

export function setupAudioControls() {
    if (!audioPlayer || !playButton || !pauseButton) return;

    playButton.addEventListener('click', () => {
        audioPlayer.play().catch(error => console.error("Erro ao tocar áudio:", error)); // Adicionar catch para política de autoplay
        playButton.style.display = 'none';
        pauseButton.style.display = 'block';
        playButton.setAttribute('aria-pressed', 'true');
        pauseButton.setAttribute('aria-pressed', 'false');
    });

    pauseButton.addEventListener('click', () => {
        audioPlayer.pause();
        pauseButton.style.display = 'none';
        playButton.style.display = 'block';
        pauseButton.setAttribute('aria-pressed', 'true');
        playButton.setAttribute('aria-pressed', 'false');
    });

    // Estado inicial dos botões
    if (audioPlayer.paused) {
        pauseButton.style.display = 'none';
        playButton.style.display = 'block';
        playButton.setAttribute('aria-pressed', 'false');
        pauseButton.setAttribute('aria-pressed', 'true');
    } else {
        pauseButton.style.display = 'block';
        playButton.style.display = 'none';
        playButton.setAttribute('aria-pressed', 'true');
        pauseButton.setAttribute('aria-pressed', 'false');
    }
}