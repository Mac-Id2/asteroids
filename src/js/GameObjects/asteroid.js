import { GameObject } from '../core/gameObject.js';
import { MathUtils } from '../utils/math.js';

export class Asteroid extends GameObject {
    constructor(x, y, size, movementTargetX = null, movementTargetY = null) {
        // ... (Dein Code unverändert) ...
        //console.log(`Asteroid erstellt mit Size: ${size}`);

        const sizeMap = { 3: 100, 2: 40, 1: 20 };
        const baseValue = sizeMap[size] || 30;
        const variation = MathUtils.getRandomArbitrary(-(baseValue * 0.1), (baseValue * 0.1));
        const finalRadius = baseValue + variation;

        super(x, y, finalRadius);

        this.size = size;
        this.baseRadius = finalRadius;

        // Wir speichern das Ziel temporär für initMovement
        this.movementTargetX = movementTargetX;
        this.movementTargetY = movementTargetY;

        this.initMovement();
        this.generateShape();
    }

    initMovement() {
        // 1. Lineare Geschwindigkeit (Pixel pro Sekunde)
        const speedMap = { 3: 36, 2: 60, 1: 120 };
        const baseSpeed = speedMap[this.size] || 60;
        const speed = baseSpeed + (Math.random() * 30);

        let angle;

        if (this.movementTargetX !== null && this.movementTargetY !== null) {
            // Berechne Winkel zur Mitte
            const dx = this.movementTargetX - this.x;
            const dy = this.movementTargetY - this.y;
            const angleToCenter = Math.atan2(dy, dx);

            // Füge etwas Variation hinzu (+/- 45 Grad), damit sie nicht alle exakt durch die Mitte fliegen
            angle = angleToCenter + (Math.random() - 0.5) * (Math.PI / 2);
        } else {
            // Standard: Zufällige Richtung (für Trümmerteile nach Zerstörung)
            angle = Math.random() * Math.PI * 2;
        }

        this.velocityX = Math.cos(angle) * speed;
        this.velocityY = Math.sin(angle) * speed;

        // --- HIER DIE ROTATION EINBAUEN ---

        // Startwinkel zufällig setzen, damit nicht alle Asteroiden gleich ausgerichtet spawnen
        this.rotation = Math.random() * Math.PI * 2;

        // Drehgeschwindigkeit festlegen (Radiant pro Sekunde)
        // Wir nehmen deine Logik: Kleine (Size 1) drehen schneller als Große (Size 3)
        const baseRotation = this.size === 1 ? 3.0 : 1.2;

        // (Math.random() - 0.5) sorgt dafür, dass sie sich mal links, mal rechts herum drehen
        this.rotationSpeed = (Math.random() - 0.5) * baseRotation;
    }

    generateShape() {
        // ... (Dein Code unverändert) ...
        const vertexMap = { 3: 12, 2: 9, 1: 6 };
        this.vertexCount = vertexMap[this.size] || 8;

        this.jaggednessOffsets = [];
        for (let i = 0; i < this.vertexCount; i++) {
            const intensity = this.size === 1 ? 0.5 : 0.3;
            this.jaggednessOffsets.push(1 + (Math.random() * intensity - intensity / 2));
        }
    }

    update(deltaTime) {
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
        // --- ÄNDERUNG 2: Rotation hochzählen ---
        this.rotation += this.rotationSpeed * deltaTime;
    }

    onDestroy() {
        // ... (Dein Code unverändert) ...
        const fragments = [];
        const nextSize = this.size - 1;

        if (nextSize > 0) {
            const count = this.size === 3 ? 2 : 3;
            for (let i = 0; i < count; i++) {
                const spawnOffset = this.baseRadius * 0.5;
                const offsetX = (Math.random() - 0.5) * spawnOffset;
                const offsetY = (Math.random() - 0.5) * spawnOffset;
                fragments.push(new Asteroid(this.x + offsetX, this.y + offsetY, nextSize));
            }
        }
        return fragments;
    }

    draw(ctx) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = this.size;
        ctx.beginPath();
        ctx.fillStyle = "black";

        for (let i = 0; i < this.vertexCount; i++) {
            // --- ÄNDERUNG 3: Hier "+ this.rotation" hinzufügen ---
            // Das dreht jeden Eckpunkt um den Mittelpunkt
            const angle = (Math.PI * 2 / this.vertexCount) * i + this.rotation;

            const currentRadius = this.baseRadius * this.jaggednessOffsets[i];

            const px = this.x + currentRadius * Math.cos(angle);
            const py = this.y + currentRadius * Math.sin(angle);

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}