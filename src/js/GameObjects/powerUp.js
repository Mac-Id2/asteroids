import { GameObject } from "../core/gameObject.js";
import { WEAPON_CONFIG } from "../config/weaponConfig.js";

export class PowerUp extends GameObject {
    constructor(x, y, excludedWeapon = null) {
        super(x, y, 18);

        // Erstelle ein veränderliches Array
        let weapons = Object.keys(WEAPON_CONFIG);

        // Entferne das ausgeschlossene PowerUp
        if (excludedWeapon) {
            weapons = weapons.filter(w => w !== excludedWeapon);
        }

        // Wähle zufällig eine Waffe aus
        this.weaponType = weapons[Math.floor(Math.random() * weapons.length)];

        // Optische Effekte
        this.pulse = 0;
        this.glowColor = "#ff00ff";

        // Bewegung
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2;
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };

        // Zeitpunkt der Erstellung speichern
        this.spawnTime = Date.now();
        this.lifetime = 10000; // 10 Sekunden in Millisekunden
    }

    update(deltaTime) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.pulse = Math.sin(Date.now() * 0.005) * 3;

        // PowerUp despawnen nach 5 Sekunden
        if (Date.now() - this.spawnTime > this.lifetime) {
            this.isDestroyed = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.glowColor;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.collisionRadius + this.pulse, 0, Math.PI * 2);

        const grad = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, this.collisionRadius);
        grad.addColorStop(0, "white");
        grad.addColorStop(0.4, this.glowColor);
        grad.addColorStop(1, "rgba(255,0,255,0)");

        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "black";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.weaponType[0].toUpperCase(), this.x, this.y);

        ctx.restore();
    }
}
