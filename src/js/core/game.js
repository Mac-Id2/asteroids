// 1. IMPORTS: Wichtig, damit JS weiß, wo die anderen Dateien liegen
import { GameUI } from '../manager/ui.js';
import { MenuScene } from '../scenes/menuScene.js';
import { SoundManager } from './soundManager.js';

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

        // Sound
        this.sound = new SoundManager();

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

    // --- HIGHSCORE SYSTEM (NEU: DIREKT AN PYTHON / JSON) ---

    saveHighScore(name, score, timeString) {
        try {
            // Wir rufen die Python GameAPI (in der build.yml) auf.
            // Python übernimmt ab hier komplett das Sortieren und speichert es in die asteroids_highscores.json!
            if (window.pywebview && window.pywebview.api) {
                window.pywebview.api.save_highscore(name, score, timeString);
            } else {
                console.warn("Python API nicht gefunden - Spiele im reinen Browser-Modus?");
            }
        } catch (e) {
            console.error("Fehler bei der Kommunikation mit Python:", e);
        }
    }
    
    // HINWEIS: Die alten Funktionen getHighScoresList() und getHighScore() wurden hier entfernt. 
    // Sie werden in der game.js nicht mehr gebraucht, da die ui.js und highscoreScene.js
    // die Liste jetzt selbstständig direkt von Python aus der JSON-Datei laden!
}

new Game();
