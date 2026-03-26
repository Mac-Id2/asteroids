import { Scene } from '../core/scene.js';
import { MenuScene } from './menuScene.js';

export class HighscoreScene extends Scene {
    constructor(game) {
        super(game);
        this.highscores = [];

        // Läd die komplette JSON von Python
        const loadScores = () => {
            if (window.pywebview && window.pywebview.api) {
                // 100ms warten, damit das Speichern der vorherigen Szene sicher abgeschlossen ist
                setTimeout(() => {
                    window.pywebview.api.get_highscores().then(scores => {
                        this.highscores = scores || [];
                    });
                }, 100);
            }
        };

        if (window.pywebview) loadScores();
        else window.addEventListener('pywebviewready', loadScores);

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

        ctx.fillStyle = "white";
        ctx.font = "20px monospace"; 

        for (let i = 0; i < this.highscores.length; i++) {
            const s = this.highscores[i];
            const y = 180 + (i * 35); 
            
            const rank = (i + 1).toString().padStart(2, ' ');
            const nameStr = s.name ? s.name.toString() : "Unknown";
            const name = nameStr.padEnd(10, ' ').substring(0, 10); 
            
            const scoreVal = (s.score || 0).toString().padStart(6, ' ');
            const timeVal = s.time || "00:00";

            ctx.fillText(`${rank}.   ${name}  ${scoreVal}   ${timeVal}`, cx, y);
        }

        if (this.highscores.length === 0) {
            ctx.fillStyle = "gray";
            ctx.fillText("Loading Scores...", cx, 200);
        }

        ctx.fillStyle = "yellow";
        ctx.font = "15px monospace";
        ctx.fillText("Press ENTER or CLICK to return", cx, this.game.canvas.height - 50);
    }

    handleKeyDown(e) {
        if (e.key === ' '|| e.key === "Escape" || e.key === "Backspace") {
            this.game.changeScene(new MenuScene(this.game));
        }
    }

    handleInput(e) {
        this.game.changeScene(new MenuScene(this.game));
    }
}
