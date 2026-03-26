import { Scene } from '../core/scene.js';
import { HighscoreScene } from './highscoreScene.js';

export class GameOverScene extends Scene {
    constructor(game, score, timeString) {
        super(game);
        this.score = score;
        this.timeString = timeString;
        this.playerName = "";

        // Definition der virtuellen Tastatur
        this.keys = [
            ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
            ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
            ['V', 'W', 'X', 'Y', 'Z','DEL', 'OK'] 
        ];

        this.cursorX = 0;
        this.cursorY = 0;
    }

    handleKeyDown(e) {
        // --- NAVIGATION (WASD / Pfeiltasten) ---
        if (e.key === "w" || e.key === "ArrowUp") {
            this.cursorY = (this.cursorY > 0) ? this.cursorY - 1 : this.keys.length - 1;
        }
        if (e.key === "s" || e.key === "ArrowDown") {
            this.cursorY = (this.cursorY < this.keys.length - 1) ? this.cursorY + 1 : 0;
        }
        if (e.key === "a" || e.key === "ArrowLeft") {
            this.cursorX = (this.cursorX > 0) ? this.cursorX - 1 : this.keys[this.cursorY].length - 1;
        }
        if (e.key === "d" || e.key === "ArrowRight") {
            this.cursorX = (this.cursorX < this.keys[this.cursorY].length - 1) ? this.cursorX + 1 : 0;
        }

        // --- AUSWAHL ---
        // Die Enter-Taste wurde hier entfernt. Nur die Leertaste wählt das Feld aus, auf dem der Cursor steht.
        if (e.key === " ") {
            this.processSelection();
        }

        // Backspace bleibt als bequeme Korrekturtaste erhalten
        if (e.key === "Backspace") {
            this.playerName = this.playerName.slice(0, -1);
        }
    }

    processSelection() {
        const char = this.keys[this.cursorY][this.cursorX];
        
        if (char === 'DEL') {
            this.playerName = this.playerName.slice(0, -1);
        } 
        else if (char === 'OK') {
            // Nur wenn ein Name eingegeben wurde, geht es weiter
            if (this.playerName.trim() !== "") {
                this.saveAndContinue();
            }
        } 
        else {
            // Zeichen zur Namensliste hinzufügen (Maximal 10 Zeichen)
            if (this.playerName.length < 10) {
                this.playerName += char;
            }
        }
    }

    saveAndContinue() {
        // Highscore über die Game-API speichern
        this.game.saveHighScore(this.playerName, this.score, this.timeString);
        // Zur Highscore-Szene wechseln
        this.game.changeScene(new HighscoreScene(this.game));
    }

    draw(ctx) {
        // Bildschirm schwarz füllen
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;

        // "Game Over" Titel und Statistiken zeichnen
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.font = "50px monospace";
        ctx.fillText("GAME OVER", cx, cy - 220);

        ctx.fillStyle = "white";
        ctx.font = "25px monospace";
        ctx.fillText(`Score: ${this.score} | Time: ${this.timeString}`, cx, cy - 170);

        // Aktuellen Namen mit blinkendem Cursor anzeigen
        ctx.fillStyle = "yellow";
        const cursorAnim = (Math.floor(Date.now() / 500) % 2 === 0) ? "_" : " ";
        ctx.fillText("Name: " + this.playerName + cursorAnim, cx, cy - 120);

        // --- Virtuelle Tastatur zeichnen ---
        const startKbdY = cy - 60; 
        const keySize = 45;        
        const padding = 10;        

        this.keys.forEach((row, y) => {
            row.forEach((char, x) => {
                const rowWidth = row.length * (keySize + padding);
                const posX = cx - rowWidth / 2 + x * (keySize + padding);
                const posY = startKbdY + y * (keySize + padding);

                // Highlight für das aktuell ausgewählte Feld
                if (this.cursorX === x && this.cursorY === y) {
                    ctx.fillStyle = "cyan";
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = "cyan";
                    ctx.fillRect(posX, posY, keySize, keySize);
                    ctx.fillStyle = "black"; 
                    ctx.shadowBlur = 0;
                } else {
                    ctx.strokeStyle = "white";
                    ctx.strokeRect(posX, posY, keySize, keySize);
                    ctx.fillStyle = "white";
                }

                ctx.font = "18px monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(char, posX + keySize / 2, posY + keySize / 2);
            });
        });

        // Hilfe-Text am unteren Rand
        ctx.textBaseline = "alphabetic";
        ctx.font = "15px monospace";
        ctx.fillStyle = "gray";
        ctx.fillText("Navigate: Joystick | Select: SPACE (Highlight OK to Save)", cx, this.game.canvas.height - 30);
    }

    handleInput(e) {
        // Maus-Interaktionen werden hier bewusst ignoriert
    }
}