import { GameUI } from '../manager/ui.js';
import { MenuScene } from '../scenes/menuScene.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.canvasContext = this.canvas.getContext('2d');

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('keydown', (e) => {
            if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape') {
                try {
                    if (window.pywebview && window.pywebview.api) {
                        window.pywebview.api.quit_game();
                    }
                } catch (err) {}
                window.close(); 
            }
            if (this.currentScene && this.currentScene.handleKeyDown) {
                this.currentScene.handleKeyDown(e);
            }
        });

        this.resize(); 
        this.ui = new GameUI(this.canvas.width, this.canvas.height);
        this.playerName = "Spieler";
        this.currentScene = null;
        this.lastTime = 0;

        this.canvas.addEventListener('mousedown', (e) => {
            if (this.currentScene) this.currentScene.handleInput(e);
        });

        this.changeScene(new MenuScene(this));
        requestAnimationFrame((timeStamp) => this.gameLoop(timeStamp));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.ui) {
            this.ui.resize(this.canvas.width, this.canvas.height);
        }
    }

    changeScene(newScene) {
        if (this.currentScene && this.currentScene.onDestroy) {
            this.currentScene.onDestroy();
        }
        this.currentScene = newScene;
    }

    gameLoop(timeStamp) {
        if (!timeStamp) timeStamp = performance.now();
        const uncheckedDeltaTime = (timeStamp - this.lastTime) / 1000;
        this.lastTime = timeStamp;
        const deltaTime = Math.min(uncheckedDeltaTime, 0.1);

        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvasContext.fillStyle = "black";
        this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.currentScene) {
            this.currentScene.update(deltaTime);
            this.currentScene.draw(this.canvasContext);
        }

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    saveHighScore(name, score, timeString) {
        if (window.pywebview && window.pywebview.api) {
            window.pywebview.api.save_highscore(name, score, timeString);
        }
    }
}

new Game();
