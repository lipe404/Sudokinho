import { GameController } from './game/GameController.js';

document.addEventListener("DOMContentLoaded", () => {
    const gameController = new GameController();
    gameController.init();
});