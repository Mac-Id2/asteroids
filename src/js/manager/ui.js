export class GameUI {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.score = 0;
        
        // --- FIX: Sicherer Zugriff auf localStorage ---
        this.highScore = 0;
        try {
            if (window.localStorage) {
                this.highScore = localStorage.getItem('asteroids_highscore') || 0;
            }
        } catch(e) {
            console.warn("LocalStorage nicht verfügbar", e);
        }

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
            // --- FIX: Sicherer Speicherzugriff ---
            try {
                if (window.localStorage) {
                    localStorage.setItem('asteroids_highscore', this.highScore);
                }
            } catch(e) {}
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
        const roundedSeconds = Math.floor(totalSeconds);
        const minutes = Math.floor(roundedSeconds / 60);
        const seconds = roundedSeconds % 60;

        const minStr = String(minutes).padStart(2, '0');
        const secStr = String(seconds).padStart(2, '0');

        return `${minStr}:${secStr}`;
    }

    draw(ctx, activeWeapon = "Laser", currentTime) {
        ctx.save();

        ctx.font = `${this.fontSize}px "Courier New", Courier, monospace`;
        ctx.textBaseline = "top";

        // --- 1. HIGHSCORE (Oben Links) ---
        ctx.textAlign = "left";
        ctx.fillStyle = "#FFD700"; // Gold
        ctx.fillText(`HIGHSCORE: ${this.highScore}`, 20, 20);

        // --- 2. SCORE (Oben Mitte) ---
        ctx.textAlign = "center";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00FFFF"; // Cyan leuchten
        ctx.fillStyle = "white";
        ctx.font = "bold 30px 'Courier New', monospace"; 
        ctx.fillText(`${this.score}`, this.width / 2, 15);

        ctx.shadowBlur = 0;
        ctx.font = `${this.fontSize}px "Courier New", Courier, monospace`; 

        // --- 3. LEBEN (Oben Rechts) ---
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
