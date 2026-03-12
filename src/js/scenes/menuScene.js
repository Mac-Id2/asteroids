import { Scene } from '../core/scene.js';
import { Asteroid } from '../GameObjects/asteroid.js';
import { PlayScene } from './playScene.js';
import { HighscoreScene } from './highscoreScene.js';
import { StarBackground } from '../manager/background.js';

export class MenuScene extends Scene {
    constructor(game) {
        super(game);

        // --- 1. NEU: Auswahl-Status für Tastatur (0 = Start, 1 = Highscores) ---
        this.selectedOption = 0;

        try {
            this.background = new StarBackground(this.game.canvas.width, this.game.canvas.height, false);
        } catch (e) { this.background = null; }

        // --- BILDER LADEN ---
        this.planetImages = {};
        const imagesToLoad = [
            { key: 'Sun', path: 'assets/sonne.png' },
            { key: 'Mercury', path: 'assets/merkur.png' },
            { key: 'Venus', path: 'assets/venus.png' },
            { key: 'Earth', path: 'assets/erde.png' },
            { key: 'Mars', path: 'assets/mars.png' },
            { key: 'Jupiter', path: 'assets/jupiter.png' },
            { key: 'Uranus', path: 'assets/uranus.png' },
            { key: 'Neptune', path: 'assets/neptun.png' }
        ];

        imagesToLoad.forEach(imgDef => {
            const img = new Image();
            img.src = imgDef.path;
            this.planetImages[imgDef.key] = img;
        });

        // --- ORBIT BERECHNUNG ---
        const maxRadius = Math.max(this.game.canvas.width, this.game.canvas.height) / 2;
        const startBuffer = 80;
        const numberOfIntervals = 6;
        const step = (maxRadius - startBuffer) / numberOfIntervals;

        // --- ZENTRUM ---
        this.sun = {
            x: this.game.canvas.width / 2,
            y: this.game.canvas.height / 2,
            visualRadius: 0,
            name: 'Sun'
        };

        // --- PLANETEN KONFIGURATION (Deine Werte behalten) ---
        this.planets = [
            { name: 'Mercury', orbitRadius: startBuffer + step * 0, visualRadius: 25, speed: 0.48, angle: Math.random() * 6 },
            { name: 'Venus', orbitRadius: startBuffer + step * 1, visualRadius: 40, speed: 0.36, angle: Math.random() * 6 },
            { name: 'Earth', orbitRadius: startBuffer + step * 2, visualRadius: 42, speed: 0.30, angle: Math.random() * 6 },
            { name: 'Mars', orbitRadius: startBuffer + step * 3, visualRadius: 44, speed: 0.24, angle: Math.random() * 6 },
            { name: 'Jupiter', orbitRadius: startBuffer + step * 4, visualRadius: 110, speed: 0.12, angle: Math.random() * 6 },
            { name: 'Uranus', orbitRadius: startBuffer + step * 5, visualRadius: 95, speed: 0.09, angle: Math.random() * 6 },
            { name: 'Neptune', orbitRadius: startBuffer + step * 6, visualRadius: 95, speed: 0.06, angle: Math.random() * 6 }
        ];

        // Deko Asteroiden
        this.backgroundAsteroids = [];
        for (let i = 0; i < 8; i++) {
            this.backgroundAsteroids.push(
                new Asteroid(Math.random() * this.game.canvas.width, Math.random() * this.game.canvas.height, Math.random() > 0.5 ? 3 : 2)
            );
        }

        // --- 2. NEU: Tastatur Listener aktivieren ---
        this.keydownHandler = (e) => this.handleKeyboardInput(e);
        window.addEventListener('keydown', this.keydownHandler);
    }

    onDestroy() {
        // Wichtig: Listener sauber entfernen
        window.removeEventListener('keydown', this.keydownHandler);
    }

    // --- 3. NEU: Tasten-Logik ---
    handleKeyboardInput(e) {
        // Pfeil Hoch oder W
        if (e.key === 'ArrowUp' || e.key === 'w') {
            this.selectedOption = 0;
        }
        // Pfeil Runter oder S
        if (e.key === 'ArrowDown' || e.key === 's') {
            this.selectedOption = 1;
        }
        // Enter Taste
        if (e.key === 'Enter') {
            if (this.selectedOption === 0) {
                this.game.changeScene(new PlayScene(this.game));
            } else {
                this.game.changeScene(new HighscoreScene(this.game));
            }
        }
    }

    update(deltaTime) {
        if (this.background) this.background.update(deltaTime);

        // --- PLANETEN UPDATE ---
        this.planets.forEach(p => {
            p.angle += p.speed * deltaTime;
            p.x = this.sun.x + Math.cos(p.angle) * p.orbitRadius;
            p.y = this.sun.y + Math.sin(p.angle) * p.orbitRadius;
            p.currentVisualRadius = p.visualRadius;
        });

        // Asteroiden update
        this.backgroundAsteroids.forEach(asteroid => {
            asteroid.update(deltaTime);
            asteroid.rotation += 0.01 * deltaTime;
            this.screenWrap(asteroid);
        });
    }

    screenWrap(obj) {
        const buffer = obj.collisionRadius * 2;
        if (obj.x - buffer > this.game.canvas.width) obj.x = -buffer;
        if (obj.x + buffer < 0) obj.x = this.game.canvas.width + buffer;
        if (obj.y - buffer > this.game.canvas.height) obj.y = -buffer;
        if (obj.y + buffer < 0) obj.y = this.game.canvas.height + buffer;
    }

    draw(ctx) {
        // 1. Hintergrund
        if (this.background) this.background.draw(ctx);
        else { ctx.fillStyle = "black"; ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height); }

        // 2. ORBIT LINIEN
        this.drawOrbitLines(ctx);

        // 3. PLANETEN
        this.planets.forEach(p => {
            this.drawImagePlanet(ctx, p);
        });

        // 4. Asteroiden
        ctx.save();
        ctx.shadowBlur = 10; ctx.shadowColor = "#555";
        this.backgroundAsteroids.forEach(a => a.draw(ctx));
        ctx.restore();

        // 5. UI (Titel & Buttons)
        ctx.save();
        ctx.font = '14px "Segoe UI", "Verdana", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // Leicht transparentes Weiß
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText("developed by Kevin, Maik and Enis", 20, 20); // 20px Abstand vom Rand
        ctx.restore();
        // HINWEIS: drawMenuBackground wurde entfernt, damit der Schatten weg ist!

        this.drawTitle(ctx);

        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;

        // --- 4. ÄNDERUNG: Buttons leuchten je nach Keyboard-Auswahl ---
        this.drawNeonButton(ctx, "START", cx, cy - 30, this.selectedOption === 0);
        this.drawNeonButton(ctx, "HIGHSCORES", cx, cy + 60, this.selectedOption === 1, 25);
    }

    drawOrbitLines(ctx) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        this.planets.forEach(p => {
            ctx.beginPath();
            ctx.arc(this.sun.x, this.sun.y, p.orbitRadius, 0, Math.PI * 2);
            ctx.stroke();
        });
        ctx.restore();
    }

    drawImagePlanet(ctx, p) {
        ctx.save();
        ctx.translate(p.x, p.y);

        const img = this.planetImages[p.name];
        const r = p.currentVisualRadius;

        if (img && img.complete && img.naturalWidth !== 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, -r, -r, r * 2, r * 2);
            ctx.restore();
        } else {
            ctx.fillStyle = "gray";
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawTitle(ctx) {
        ctx.save();
        const yPos = this.game.canvas.height / 2 - 120;
        ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "80px monospace";
        ctx.shadowBlur = 30; ctx.shadowColor = "#00FFFF"; ctx.fillText("ASTEROIDS", this.game.canvas.width / 2, yPos);
        ctx.shadowBlur = 10; ctx.shadowColor = "white"; ctx.fillText("ASTEROIDS", this.game.canvas.width / 2, yPos);
        ctx.restore();
    }

    // --- 5. NEU: Verbesserte Button-Optik (Schriftart) ---
    drawNeonButton(ctx, text, x, y, isHovered, fontSize = 35) {
        const width = 240;
        const height = 60;
        const left = x - width / 2;

        ctx.save();

        if (isHovered) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#00FFFF";
            ctx.strokeStyle = "#00FFFF";
            ctx.fillStyle = "rgba(0, 255, 255, 0.1)";
        } else {
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        }

        ctx.lineWidth = 2; // Etwas dünner für schärfere Optik
        ctx.fillRect(left, y, width, height);
        ctx.strokeRect(left, y, width, height);

        // Text Styling: Kein Glow auf dem Text selbst, bessere Schriftart
        ctx.shadowBlur = 0;
        ctx.fillStyle = isHovered ? "white" : "#BBBBBB";

        // "Segoe UI" ist Standard auf Windows, "Verdana" als Fallback
        ctx.font = `bold ${fontSize}px "Segoe UI", "Verdana", sans-serif`;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // +2 Pixel Versatz damit es optisch mittig wirkt
        ctx.fillText(text, x, y + height / 2 + 2);

        ctx.restore();
    }
}