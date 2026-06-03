import { GameObject } from "../core/gameObject.js";
import { WEAPON_CONFIG } from "../config/weaponConfig.js";

export class Ship extends GameObject {
    constructor(x = 0, y = 0) {
        super(x, y, 10);

        this.health = 3;
        this.thrust = { x: 0, y: 0 };
        this.isInvincible = false;
        this.thrusting = false;

        this.activeWeapon = 'Laser';
        this.weaponList = Object.keys(WEAPON_CONFIG);
        this.currentWeaponIndex = 0;

        this.rotationSpeed = 4.0;
        this.acceleration = 300;
        this.friction = 0.5;
    }

    setWeapon(weaponName) {
        this.activeWeapon = weaponName;
        this.currentWeaponIndex = this.weaponList.indexOf(weaponName);
    }

    switchWeapon() {
        this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.weaponList.length;
        this.activeWeapon = this.weaponList[this.currentWeaponIndex];
    }

    get muzzlePosition() {
        const noseLength = 20;
        return {
            x: this.x + noseLength * Math.cos(this.angle),
            y: this.y - noseLength * Math.sin(this.angle),
            angle: this.angle
        };
    }

    getShipVertices() {
        return {
            nose: {
                x: this.x + 20 * Math.cos(this.angle),
                y: this.y - 20 * Math.sin(this.angle)
            },
            left: {
                x: this.x - 15 * (2/3 * Math.cos(this.angle) + Math.sin(this.angle)),
                y: this.y + 15 * (2/3 * Math.sin(this.angle) - Math.cos(this.angle))
            },
            right: {
                x: this.x - 15 * (2/3 * Math.cos(this.angle) - Math.sin(this.angle)),
                y: this.y + 15 * (2/3 * Math.sin(this.angle) + Math.cos(this.angle))
            }
        };
    }

    getCollisionCircles() {
        const r = 10;
        const { nose, left, right } = this.getShipVertices();

        const midLeft  = { x: (nose.x + left.x)  / 2, y: (nose.y + left.y)  / 2 };
        const midRight = { x: (nose.x + right.x) / 2, y: (nose.y + right.y) / 2 };

        const calculateInsetCircle = (px, py) => {
            const dx = this.x - px;
            const dy = this.y - py;
            const len = Math.sqrt(dx * dx + dy * dy);
            return { x: px + r * dx / len, y: py + r * dy / len, r };
        };

        return [
            calculateInsetCircle(nose.x,    nose.y),
            calculateInsetCircle(midLeft.x,  midLeft.y),
            calculateInsetCircle(midRight.x, midRight.y),
            calculateInsetCircle(left.x,     left.y),
            calculateInsetCircle(right.x,    right.y),
        ];
    }

    rotate(dir, deltaTime) {
        this.angle += dir * this.rotationSpeed * deltaTime;
    }

    accelerate(isThrusting, deltaTime) {
        this.thrusting = isThrusting;

        if (isThrusting) {
            this.thrust.x += Math.cos(this.angle) * this.acceleration * deltaTime;
            this.thrust.y -= Math.sin(this.angle) * this.acceleration * deltaTime;
        } else {
            this.thrust.x -= this.thrust.x * this.friction * deltaTime;
            this.thrust.y -= this.thrust.y * this.friction * deltaTime;
        }
    }

    hitShip() { this.health -= 1; }

    triggerInvulnerability(durationMs) {
        this.isInvincible = true;
        setTimeout(() => this.isInvincible = false, durationMs);
    }

    update(deltaTime) {
        this.x += this.thrust.x * deltaTime;
        this.y += this.thrust.y * deltaTime;
    }

    draw(ctx) {
        if (this.thrusting) {
            ctx.save();

            const flicker = 0.8 + Math.random() * 0.4;
            const tailX = this.x - 10 * Math.cos(this.angle);
            const tailY = this.y + 10 * Math.sin(this.angle);
            const flameTipX = this.x - (10 + 25 * flicker) * Math.cos(this.angle);
            const flameTipY = this.y + (10 + 25 * flicker) * Math.sin(this.angle);
            const flameLeftX  = this.x - 8 * Math.cos(this.angle) + 5 * Math.sin(this.angle);
            const flameLeftY  = this.y + 8 * Math.sin(this.angle) + 5 * Math.cos(this.angle);
            const flameRightX = this.x - 8 * Math.cos(this.angle) - 5 * Math.sin(this.angle);
            const flameRightY = this.y + 8 * Math.sin(this.angle) - 5 * Math.cos(this.angle);

            const gradient = ctx.createLinearGradient(tailX, tailY, flameTipX, flameTipY);
            gradient.addColorStop(0, 'yellow');
            gradient.addColorStop(0.5, 'orange');
            gradient.addColorStop(1, 'rgba(255,0,0,0)');

            ctx.fillStyle = gradient;
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'orange';

            ctx.beginPath();
            ctx.moveTo(flameLeftX, flameLeftY);
            ctx.lineTo(flameTipX, flameTipY);
            ctx.lineTo(flameRightX, flameRightY);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        const { nose, left, right } = this.getShipVertices();

        ctx.strokeStyle = this.isInvincible ? "yellow" : "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(nose.x, nose.y);
        ctx.lineTo(left.x, left.y);
        ctx.quadraticCurveTo(
            this.x - 4 * Math.cos(this.angle),
            this.y + 4 * Math.sin(this.angle),
            right.x, right.y
        );
        ctx.closePath();
        ctx.stroke();
    }
}
