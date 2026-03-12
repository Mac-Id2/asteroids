import { Scene } from '../core/scene.js';
import { MenuScene } from './menuScene.js';

export class HighscoreScene extends Scene {
    constructor(game) {
        super(game);

        // --- NEU: SICHERES LADEN (Fail-Safe) ---
        const storageKey = 'asteroids_highscores';
        
        try {
            // 1. Versuchen Daten zu laden
            const rawData = localStorage.getItem(storageKey);
            
            if (rawData) {
                this.highscores = JSON.parse(rawData);
            } else {
                this.highscores = [];
            }

            // Sicherheitscheck: Ist es ein Array?
            if (!Array.isArray(this.highscores)) {
                throw new Error("Daten sind kein Array");
            }

        } catch (e) {
            // 2. Fallback bei Fehler (Korrupte Daten oder Parse-Fehler)
            console.warn("Highscore-Daten fehlerhaft. Reset durchgeführt.", e);
            this.highscores = []; // Leere Liste setzen, damit das Spiel nicht abstürzt
            localStorage.setItem(storageKey, JSON.stringify([])); // Speicher bereinigen
        }

        // Sortieren: Höchste zuerst
        this.highscores.sort((a, b) => b.score - a.score);
        // Top 5 behalten (optional, falls gewünscht, sonst Zeile löschen)
        this.highscores = this.highscores.slice(0, 5);
        // ---------------------------------------

        // --- WICHTIG: Damit die Tastatur funktioniert ---
        this.keydownHandler = (e) => this.handleKeyDown(e);
        window.addEventListener('keydown', this.keydownHandler);
    }

    // Wichtig: Aufräumen, wenn wir die Szene verlassen
    onDestroy() {
        window.removeEventListener('keydown', this.keydownHandler);
    }

    draw(ctx) {
        // 1. Hintergrund schwarz
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        const cx = this.game.canvas.width / 2;
        
        // 2. Titel
        ctx.fillStyle = "lime";
        ctx.textAlign = "center";
        ctx.font = "40px monospace";
        ctx.fillText("HALL OF FAME", cx, 80);

        // 3. Tabellen-Header
        ctx.fillStyle = "gray";
        ctx.font = "20px monospace";
        ctx.fillText("RANK   NAME        SCORE    TIME", cx, 140);
        ctx.fillRect(cx - 250, 150, 500, 2); // Trennlinie

        // 4. Liste verwenden (Hier nutzen wir jetzt die sicher geladene Liste aus dem Constructor)
        const scores = this.highscores; 

        ctx.fillStyle = "white";
        ctx.font = "20px monospace"; 

        // 5. Einträge zeichnen
        for (let i = 0; i < scores.length; i++) {
            const s = scores[i];
            const y = 180 + (i * 35); // Abstand pro Zeile
            
            // Formatierung (Damit alles untereinander steht)
            const rank = (i + 1).toString().padStart(2, ' ');
            // Sicherheitscheck, falls Name/Score undefined sind
            const nameStr = s.name ? s.name.toString() : "Unknown";
            const name = nameStr.padEnd(10, ' ').substring(0, 10); 
            
            const scoreVal = (s.score || 0).toString().padStart(6, ' ');
            const timeVal = s.time || "00:00";

            ctx.fillText(`${rank}.   ${name}  ${scoreVal}   ${timeVal}`, cx, y);
        }

        // 6. Zurück Button Info
        ctx.fillStyle = "yellow";
        ctx.font = "15px monospace";
        ctx.fillText("Press ENTER or CLICK to return", cx, this.game.canvas.height - 50);
    }

    // Bei Tastendruck -> Menü
    handleKeyDown(e) {
        if (e.key === "Enter" || e.key === "Escape" || e.key === "Backspace") {
            this.game.changeScene(new MenuScene(this.game));
        }
    }

    // Bei Mausklick -> Menü
    handleInput(e) {
        // Einfach bei jedem Klick zurück
        this.game.changeScene(new MenuScene(this.game));
    }
}