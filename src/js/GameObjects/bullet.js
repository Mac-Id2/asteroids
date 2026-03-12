import { GameObject } from "../core/gameObject.js";


export class Laser extends GameObject {
    // Der Constructor ändert sich NICHT, er bekommt die Werte ja übergeben
    constructor(x, y, angle, speed, lifespan, damage, color, lengthFactor, areaRadius) {
        super(x, y, areaRadius > 0 ? 5 : 1);

        this.angle = angle;

        // WICHTIG: Da speed jetzt in Pixel pro Sekunde gerechnet wird,
        // musst du den Wert in deiner weaponConfig.js vermutlich verzehnfachen (z.B. von 10 auf 600).
        this.speed = speed;


        // lifespan sollte jetzt in Sekunden angegeben werden (z.B. 2.0 für 2 Sekunden)
        this.lifespan = lifespan;
        this.damage = damage;
        this.color = color;
        this.lengthFactor = lengthFactor;
        this.areaRadius = areaRadius;

        // Velocity wird hier einmal berechnet.
        // Da speed nun "pro Sekunde" ist, bleibt die Rechnung gleich.
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: -Math.sin(this.angle) * this.speed
        };
    }

    update(deltaTime) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;

        // NEU: Lebensdauer in Sekunden abziehen statt in Frames
        this.lifespan -= deltaTime;
        if (this.lifespan <= 0) this.isDestroyed = true;
    }

    draw(ctx) {
        ctx.strokeStyle = this.color;
        ctx.shadowColor = this.color;

        if (this.areaRadius > 0) ctx.lineWidth = 4;
        else if (this.speed > 15) ctx.lineWidth = 2;
        else ctx.lineWidth = 3;

        ctx.shadowBlur = 10;
        ctx.beginPath();

        ctx.moveTo(this.x, this.y);

        // Längenberechnung:
        // Damit der Laser bei Delta Time nicht "schrumpft",
        // nutzen wir einen festen Faktor oder passen ihn an.
        // Wenn lengthFactor z.B. 0.05 ist, entspricht das einer Länge von 5% der Sekundengeschwindigkeit.
        const endX = this.x - this.velocity.x * this.lengthFactor;
        const endY = this.y - this.velocity.y * this.lengthFactor;

        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        this.drawCollisionRadius(ctx);
    }
}