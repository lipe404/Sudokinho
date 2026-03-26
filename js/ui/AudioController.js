export class AudioController {
  constructor() {
    this.audioPlayer = document.getElementById("audio-player");
    this.playButton = document.getElementById("play-button");
    this.pauseButton = document.getElementById("pause-button");
  }

  setup() {
    this.playButton.addEventListener("click", () => this.play());
    this.pauseButton.addEventListener("click", () => this.pause());
    this.audioPlayer.addEventListener("play", () => this.setUIPlaying(true));
    this.audioPlayer.addEventListener("pause", () => this.setUIPlaying(false));
    this.updateInitialState();
  }

  play() {
    try {
      const p = this.audioPlayer.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          this.setUIPlaying(true);
        }).catch(() => {
          this.setUIPlaying(false);
        });
      } else {
        this.setUIPlaying(true);
      }
    } catch (_) {
      this.setUIPlaying(false);
    }
  }

  pause() {
    try {
      this.audioPlayer.pause();
      this.setUIPlaying(false);
    } catch (_) {
      this.setUIPlaying(false);
    }
  }

  updateInitialState() {
    if (this.audioPlayer.paused) {
      this.setUIPlaying(false);
    } else {
      this.setUIPlaying(true);
    }
  }

  setUIPlaying(isPlaying) {
    if (isPlaying) {
      this.playButton.style.display = "none";
      this.pauseButton.style.display = "block";
      this.playButton.setAttribute("aria-pressed", "true");
      this.pauseButton.setAttribute("aria-pressed", "false");
    } else {
      this.pauseButton.style.display = "none";
      this.playButton.style.display = "block";
      this.pauseButton.setAttribute("aria-pressed", "true");
      this.playButton.setAttribute("aria-pressed", "false");
    }
  }
}
