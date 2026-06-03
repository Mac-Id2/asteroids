import { GameObject } from '../core/gameObject.js';
import { MathUtils } from '../utils/math.js';

export class Asteroid extends GameObject {
    constructor(x, y, size, movementTargetX = null, movementTargetY = null) {
        const sizeMap = { 3: 100, 2: 40, 1: 20 };
        const baseValue = sizeMap[size] || 30;
        const variation = MathUtils.getRandomArbitrary(-(baseValue * 0.1), (baseValue * 0.1));
        const finalRadius = baseValue + variation;

        super(x, y, finalRadius);

        this.size = size;
        this.baseRadius = finalRadius;

        this.movementTargetX = movementTargetX;
        this.movementTargetY = movementTargetY;

        this.initMovement();
        this.generateShape();
    }

    initMovement() {
        const speedMap = { 3: 36, 2: 60, 1: 120 };
        const baseSpeed = speedMap[this.size] || 60;
        const speed = baseSpeed + (Math.random() * 30);

        let angle;

        if (this.movementTargetX !== null && this.movementTargetY !== null) {
            const dx = this.movementTargetX - this.x;
            const dy = this.movementTargetY - this.y;
            const angleToCenter = Math.atan2(dy, dx);
            angle = angleToCenter + (Math.random() - 0.5) * (Math.PI / 2);
        } else {
            angle = Math.random() * Math.PI * 2;
        }

        this.velocityX = Math.cos(angle) * speed;
        this.velocityY = Math.sin(angle) * speed;

        this.rotation = Math.random() * Math.PI * 2;

        const baseRotation = this.size === 1 ? 3.0 : 1.2;
        this.rotationSpeed = (Math.random() - 0.5) * baseRotation;
    }

    generateShape() {
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
        this.rotation += this.rotationSpeed * deltaTime;
    }

    onDestroy() {
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
