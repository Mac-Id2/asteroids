import { GameUI } from '../manager/ui.js';
import { MenuScene } from '../scenes/menuScene.js';
import { SoundManager } from './soundManager.js';
import { LedManager } from './ledManager.js';

export class Game {
    constructor() {
        // Zuerst Canvas holen, sonst knallt es beim Resize
        this.canvas = document.getElementById('gameCanvas');
        this.canvasContext = this.canvas.getContext('2d');

        this.lastInputTime = Date.now();
        this.AFK_TIMEOUT_MS = 180000;

        // LED initialisieren und verbinden (NUR HIER!)
        this.led = new LedManager();
        this.led.connect();

        // RESIZE SETUP
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('keydown', (e) => {
            this.lastInputTime = Date.now();
            
            // --- Sicherere Abfrage für Q und Escape ---
            if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape') {
                if (this.led) this.led.triggerEvent('sys_end');
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

            // Reicht die Tasten an die Szene weiter
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
            this.lastInputTime = Date.now();
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
        if (this.currentScene && this.currentScene.onDestroy) {
            this.currentScene.onDestroy();
        }
        
        this.currentScene = newScene;
    }

    gameLoop(timeStamp) {
        if (!timeStamp) timeStamp = performance.now();

        const now = Date.now();
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (let i = 0; i < gamepads.length; i++) {
            const gp = gamepads[i];
            if (gp) {
                for (let j = 0; j < gp.buttons.length; j++) {
                    if (gp.buttons[j].pressed) {
                        this.lastInputTime = now;
                    }
                }
                for (let j = 0; j < gp.axes.length; j++) {
                    if (Math.abs(gp.axes[j]) > 0.1) {
                        this.lastInputTime = now;
                    }
                }
            }
        }

        if (now - this.lastInputTime > this.AFK_TIMEOUT_MS) {
            try {
                if (window.pywebview && window.pywebview.api) {
                    window.pywebview.api.quit_game();
                }
            } catch (err) {
                console.error("Pywebview API nicht erreichbar", err);
            }
            window.close();
            return; 
        }

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
        try {
            if (window.pywebview && window.pywebview.api) {
                window.pywebview.api.save_highscore(name, score, timeString);
            } else {
                console.warn("Python API nicht gefunden - Spiele im reinen Browser-Modus?");
            }
        } catch (e) {
            console.error("Fehler bei der Kommunikation mit Python:", e);
        }
    }
}

new Game();