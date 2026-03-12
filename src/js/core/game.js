// 1. IMPORTS: Wichtig, damit JS weiß, wo die anderen Dateien liegen
import { GameUI } from '../manager/ui.js';
import { MenuScene } from '../scenes/menuScene.js';

export class Game {
    constructor() {
        // Zuerst Canvas holen, sonst knallt es beim Resize
        this.canvas = document.getElementById('gameCanvas');
        this.canvasContext = this.canvas.getContext('2d');

        // RESIZE SETUP
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('keydown', (e) => {
            
            // --- NEU: Sicherere Abfrage für Q und Escape ---
            if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape') {
                try {
                    // Versuche das Fenster über die Python-API zu "killen"
                    if (window.pywebview && window.pywebview.api) {
                        window.pywebview.api.quit_game();
                    }
                } catch (err) {
                    console.error("Pywebview API nicht erreichbar", err);
                }
                
                // Fallback: Normales Schließen immer zusätzlich aufrufen
                window.close(); 
            }
            // ----------------------------------------

            if (this.currentScene && this.currentScene.handleKeyDown) {
                this.currentScene.handleKeyDown(e);
            }
        });

        this.resize(); // Setzt Canvas auf Vollbild

        // Jetzt UI mit den korrekten Maßen erstellen
        this.ui = new GameUI(this.canvas.width, this.canvas.height);

        // Globale Variablen
        this.playerName = "Spieler";
        this.currentScene = null;

        // Speichert den Zeitstempel des letzten Frames
        this.lastTime = 0;

        // Input Listener
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.currentScene) this.currentScene.handleInput(e);
        });

        // Startet das Menü
        this.changeScene(new MenuScene(this));

        // Startet den Loop
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
        // WICHTIG: Die alte Szene aufräumen, bevor gewechselt wird!
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

        // Screen clearen
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Sicherstellen, dass Hintergrund schwarz ist
        this.canvasContext.fillStyle = "black";
        this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Szene zeichnen
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
            this.currentScene.draw(this.canvasContext);
        }

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    // --- HIGHSCORE SYSTEM (ANGEPASST & SICHER) ---

    saveHighScore(name, score, timeString) {
        // 1. Schlüssel muss exakt gleich sein wie in HighscoreScene.js
        const storageKey = 'asteroids_highscores'; 

        try {
            // Liste laden (nutzt unsere sichere get-Funktion von unten)
            let scores = this.getHighScoresList();

            // Neuen Eintrag hinzufügen
            scores.push({
                name: name,
                score: score,
                time: timeString,
                date: new Date().toLocaleDateString()
            });

            // Sortieren: Höchster Score zuerst
            scores.sort((a, b) => b.score - a.score);

            // Nur die Top 10 behalten
            scores = scores.slice(0, 10);

            // Speichern mit Fail-Safe
            localStorage.setItem(storageKey, JSON.stringify(scores));

        } catch (e) {
            console.error("Fehler beim Speichern des Highscores (Speicher voll oder blockiert):", e);
            // Hier stürzt das Spiel jetzt nicht mehr ab, es wird nur eine Warnung geloggt.
        }
    }

    getHighScoresList() {
        const storageKey = 'asteroids_highscores';
        
        try {
            const raw = localStorage.getItem(storageKey);
            // Wenn Daten da sind parsen, sonst leeres Array
            const list = raw ? JSON.parse(raw) : [];
            
            // Sicherheitscheck: Ist es wirklich ein Array?
            return Array.isArray(list) ? list : [];
            
        } catch (e) {
            console.warn("Konnte Highscore-Liste nicht lesen, gebe leere Liste zurück.", e);
            return [];
        }
    }

    getHighScore() {
        // Diese Funktion nutzt die sichere getHighScoresList von oben
        let scores = this.getHighScoresList();
        return scores.length > 0 ? scores[0].score : 0;
    }
}

new Game();