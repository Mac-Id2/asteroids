import { Scene } from '../core/scene.js';
import { MenuScene } from './menuScene.js';

export class HighscoreScene extends Scene {
    constructor(game) {
        super(game);

        const storageKey = 'asteroids_highscores';
        
        try {
            // --- FIX: Sicherer Zugriff ---
            let rawData = null;
            if (window.localStorage) {
                rawData = localStorage.getItem(storageKey);
            }
            
            if (rawData) {
                this.highscores = JSON.parse(rawData);
            } else {
                this.highscores = [];
            }

            if (!Array.isArray(this.highscores)) {
                throw new Error("Daten sind kein Array");
            }

        } catch (e) {
            console.warn("Highscore-Daten fehlerhaft. Reset durchgeführt.", e);
            this.highscores = []; 
            // --- FIX: Sicherer Zugriff ---
            try {
                if (window.localStorage) {
                    localStorage.setItem(storageKey, JSON.stringify([])); 
                }
            } catch(err) {}
        }

        this.highscores.sort((a, b) => b.score - a.score);
        this.highscores = this.highscores.slice(0, 5);

        this.keydownHandler = (e) => this.handleKeyDown(e);
        window.addEventListener('keydown', this.keydownHandler);
    }

    onDestroy() {
        window.removeEventListener('keydown', this.keydownHandler);
    }

    draw(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        const cx = this.game.canvas.width / 2;
        
        ctx.fillStyle = "lime";
        ctx.textAlign = "center";
        ctx.font = "40px monospace";
        ctx.fillText("HALL OF FAME", cx, 80);

        ctx.fillStyle = "gray";
        ctx.font = "20px monospace";
        ctx.fillText("RANK   NAME        SCORE    TIME", cx, 140);
        ctx.fillRect(cx - 250, 150, 500, 2);

        const scores = this.highscores; 

        ctx.fillStyle = "white";
        ctx.font = "20px monospace"; 

        for (let i = 0; i < scores.length; i++) {
            const s = scores[i];
            const y = 180 + (i * 35); 
            
            const rank = (i + 1).toString().padStart(2, ' ');
            const nameStr = s.name ? s.name.toString() : "Unknown";
            const name = nameStr.padEnd(10, ' ').substring(0, 10); 
            
            const scoreVal = (s.score || 0).toString().padStart(6, ' ');
            const timeVal = s.time || "00:00";

            ctx.fillText(`${rank}.   ${name}  ${scoreVal}   ${timeVal}`, cx, y);
        }

        ctx.fillStyle = "yellow";
        ctx.font = "15px monospace";
        ctx.fillText("Press ENTER or CLICK to return", cx, this.game.canvas.height - 50);
    }

    handleKeyDown(e) {
        if (e.key === "Enter" || e.key === "Escape" || e.key === "Backspace") {
            this.game.changeScene(new MenuScene(this.game));
        }
    }

    handleInput(e) {
        this.game.changeScene(new MenuScene(this.game));
    }
}
