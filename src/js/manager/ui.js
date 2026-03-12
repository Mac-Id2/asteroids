export class GameUI {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.score = 0;
        this.highScore = localStorage.getItem('asteroids_highscore') || 0;
        this.lives = 3;
        this.fontSize = 20;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    addScore(points) {
        this.score += points;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('asteroids_highscore', this.highScore);
        }
    }

    takeDamage(amount) {
        // Optionaler Shake
    }

    update(deltaTime) {
        // UI zählt NICHTS mehr selbst.
    }

    // Hilfsfunktion: Macht aus Sekunden eine schöne Uhrzeit (MM:SS)
    formatTime(totalSeconds) {
        // Da totalSeconds jetzt deltaTime-Werte sind (z.B. 124.53),
        // runden wir sie einfach ab.
        const roundedSeconds = Math.floor(totalSeconds);

        const minutes = Math.floor(roundedSeconds / 60);
        const seconds = roundedSeconds % 60;

        const minStr = String(minutes).padStart(2, '0');
        const secStr = String(seconds).padStart(2, '0');

        return `${minStr}:${secStr}`;
    }

    // NEU: Nimmt 'currentTime' als Parameter entgegen
    // NEU: Nimmt 'currentTime' als Parameter entgegen
    draw(ctx, activeWeapon = "Laser", currentTime) {
        ctx.save();

        // Standard Schrift-Einstellungen
        ctx.font = `${this.fontSize}px "Courier New", Courier, monospace`;
        ctx.textBaseline = "top";

        // --- 1. HIGHSCORE (Oben Links) ---
        // Wir machen ihn Gold/Gelb, damit er "edel" aussieht
        ctx.textAlign = "left";
        ctx.fillStyle = "#FFD700"; // Gold
        ctx.fillText(`HIGHSCORE: ${this.highScore}`, 20, 20);


        // --- 2. SCORE (Oben Mitte) ---
        // Der Score soll leuchten und größer sein!
        ctx.textAlign = "center";

        // Glow Effekt an
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00FFFF"; // Cyan leuchten

        ctx.fillStyle = "white";
        ctx.font = "bold 30px 'Courier New', monospace"; // Etwas größer & fetter
        ctx.fillText(`${this.score}`, this.width / 2, 15);

        // Glow Effekt wieder aus (wichtig für Performance & andere Texte)
        ctx.shadowBlur = 0;
        ctx.font = `${this.fontSize}px "Courier New", Courier, monospace`; // Reset Font


        // --- 3. LEBEN (Oben Rechts - bleibt gleich) ---
        this.drawLives(ctx);


        // --- UNTEN ---
        ctx.textBaseline = "bottom";

        // 4. WAFFE (Unten Links)
        ctx.fillStyle = "lime";
        ctx.textAlign = "left";
        ctx.fillText(`WEAPON: ${activeWeapon}`, 20, this.height - 20);

        // 5. ZEIT (Unten Rechts)
        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        const timeString = this.formatTime(currentTime);


        //console.log("UI - GameTime: " + currentTime);
        //console.log("UI - GameTime String: " + timeString);

        ctx.fillText(`TIME: ${timeString}`, this.width - 20, this.height - 20);

        ctx.restore();
    }

    drawLives(ctx) {
        const startX = this.width - 30;
        const startY = 30;
        const size = 12;

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;

        for (let i = 0; i < this.lives; i++) {
            const x = startX - (i * 35);
            const y = startY;

            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.lineTo(x - size * 0.8, y + size);
            ctx.lineTo(x + size * 0.8, y + size);
            ctx.closePath();
            ctx.stroke();
        }
    }
}