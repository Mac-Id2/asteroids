import { Scene } from '../core/scene.js';
import { HighscoreScene } from './highscoreScene.js'; 

export class GameOverScene extends Scene {
    constructor(game, score, timeString) {
        super(game);
        this.score = score;
        this.timeString = timeString;
        this.playerName = "";
        
        // Kleiner Sound-Effekt oder Logik hier möglich
    }

    handleKeyDown(e) {
        // Buchstaben & Zahlen zulassen
        if (e.key.length === 1 && /[a-zA-Z0-9 ]/.test(e.key)) {
            if (this.playerName.length < 10) { 
                this.playerName += e.key;
            }
        }
        // Löschen
        else if (e.key === "Backspace") {
            this.playerName = this.playerName.slice(0, -1);
        }
        // Bestätigen
        else if (e.key === "Enter") {
            if (this.playerName.trim() !== "") {
                this.saveAndContinue();
            }
        }
    }

    saveAndContinue() {
        // 1. Speichern
        this.game.saveHighScore(this.playerName, this.score, this.timeString);
        
        // 2. Weiterleiten zur Highscore-Liste (statt selbst anzuzeigen)
        this.game.changeScene(new HighscoreScene(this.game));
    }

    draw(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;

        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.font = "60px monospace";
        ctx.fillText("GAME OVER", cx, cy - 100);

        ctx.fillStyle = "white";
        ctx.font = "30px monospace";
        ctx.fillText(`Score: ${this.score}`, cx, cy - 40);
        ctx.fillText(`Time:  ${this.timeString}`, cx, cy);

        // Eingabefeld
        ctx.fillStyle = "yellow";
        ctx.fillText("Enter Name:", cx, cy + 80);
        
        ctx.font = "40px monospace";
        const cursor = (Math.floor(Date.now() / 500) % 2 === 0) ? "_" : " ";
        ctx.fillText(this.playerName + cursor, cx, cy + 130);
        
        ctx.font = "15px monospace";
        ctx.fillStyle = "gray";
        ctx.fillText("Type Name & Press ENTER", cx, cy + 200);
    }

    handleInput(e) {} // Maus wird hier ignoriert
}