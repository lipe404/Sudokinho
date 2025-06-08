export class AudioController {
  constructor() {
    this.audioPlayer = document.getElementById("audio-player");
    this.playButton = document.getElementById("play-button");
    this.pauseButton = document.getElementById("pause-button");
  }

  setup() {
    this.playButton.addEventListener("click", () => this.play());
    this.pauseButton.addEventListener("click", () => this.pause());
    this.updateInitialState();
  }

  play() {
    this.audioPlayer.play();
    this.playButton.style.display = "none";
    this.pauseButton.style.display = "block";
    this.playButton.setAttribute("aria-pressed", "true");
    this.pauseButton.setAttribute("aria-pressed", "false");
  }

  pause() {
    this.audioPlayer.pause();
    this.pauseButton.style.display = "none";
    this.playButton.style.display = "block";
    this.pauseButton.setAttribute("aria-pressed", "true");
    this.playButton.setAttribute("aria-pressed", "false");
  }

  updateInitialState() {
    if (this.audioPlayer.paused) {
      this.pauseButton.style.display = "none";
      this.playButton.style.display = "block";
    } else {
      this.pauseButton.style.display = "block";
      this.playButton.style.display = "none";
    }
  }
}
