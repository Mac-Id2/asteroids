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
        // Das funktioniert weiterhin, weil wir es oben importiert haben:
        this.weaponList = Object.keys(WEAPON_CONFIG);
        this.currentWeaponIndex = 0;

        this.rotationSpeed = 4.0;  // Statt 0.05
        this.acceleration = 300;   // Statt 1 (Pixel pro Sekunde^2)
        this.friction = 0.5;       // Reibung (50% Verlust pro Sekunde)
    }

    setWeapon(weaponName) {
    this.activeWeapon = weaponName;
    this.currentWeaponIndex = this.weaponList.indexOf(weaponName);
    //console.log("weapon changed to:", weaponName);
}


    switchWeapon() {
        this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.weaponList.length;
        this.activeWeapon = this.weaponList[this.currentWeaponIndex];
        //console.log(`Waffe gewechselt zu: ${this.activeWeapon}`);
    }

    get muzzlePosition() {
        const noseLength = 20;
        return {
            x: this.x + noseLength * Math.cos(this.angle),
            y: this.y - noseLength * Math.sin(this.angle),
            angle: this.angle
        };
    }

    rotate(dir, deltaTime) {
        // dir ist 1 oder -1
        this.angle += dir * this.rotationSpeed * deltaTime;
    }

    accelerate(isThrusting, deltaTime) {
        this.thrusting = isThrusting;

        if (isThrusting) {
            // Wir addieren Beschleunigung * Zeit
            this.thrust.x += Math.cos(this.angle) * this.acceleration * deltaTime;
            this.thrust.y -= Math.sin(this.angle) * this.acceleration * deltaTime;
        } else {
            // Reibung: Wir ziehen einen Prozentsatz pro Sekunde ab
            this.thrust.x -= this.thrust.x * this.friction * deltaTime;
            this.thrust.y -= this.thrust.y * this.friction * deltaTime;
        }
    }

    hitShip() { this.health -= 1; }

    triggerInvulnerability(time) {
        this.isInvincible = true;
        setTimeout(() => this.isInvincible = false, 2000);
    }

    update(deltaTime) {
        this.x += this.thrust.x * deltaTime;
        this.y += this.thrust.y * deltaTime;
    }

    draw(ctx) {
        // ... (Dein Zeichen-Code hier einfügen) ...


        if (this.thrusting) {

            const tailX = this.x - 10 * Math.cos(this.angle);
            const tailY = this.y + 10 * Math.sin(this.angle);




            ctx.save();


            const flicker = 0.8 + Math.random() * 0.4;
            const flameTipX = this.x - (10 + 25 * flicker) * Math.cos(this.angle);
            const flameTipY = this.y + (10 + 25 * flicker) * Math.sin(this.angle);

            const FlameLeftX = this.x - 8 * Math.cos(this.angle) + 5 * Math.sin(this.angle);
            const FlameLeftY = this.y + 8 * Math.sin(this.angle) + 5 * Math.cos(this.angle);
            const FlameRightX = this.x - 8 * Math.cos(this.angle) - 5 * Math.sin(this.angle);
            const FlameRightY = this.y + 8 * Math.sin(this.angle) - 5 * Math.cos(this.angle);

            const gradient = ctx.createLinearGradient(tailX, tailY, flameTipX, flameTipY);
            gradient.addColorStop(0, 'yellow');
            gradient.addColorStop(0.5, 'orange');
            gradient.addColorStop(1, 'rgba(255,0,0,0)');

            ctx.fillStyle = gradient;
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'orange';

            ctx.beginPath();
            ctx.moveTo(FlameLeftX, FlameLeftY);
            ctx.lineTo(flameTipX, flameTipY);
            ctx.lineTo(FlameRightX, FlameRightY);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }







        ctx.strokeStyle = this.isInvincible ? "yellow" : "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        const noseX = this.x + 20 * Math.cos(this.angle);
        const noseY = this.y - 20 * Math.sin(this.angle);
        const leftX = this.x - 15 * (2 / 3 * Math.cos(this.angle) + Math.sin(this.angle));
        const leftY = this.y + 15 * (2 / 3 * Math.sin(this.angle) - Math.cos(this.angle));
        const rightX = this.x - 15 * (2 / 3 * Math.cos(this.angle) - Math.sin(this.angle));
        const rightY = this.y + 15 * (2 / 3 * Math.sin(this.angle) + Math.cos(this.angle));

        ctx.moveTo(noseX, noseY);
        ctx.lineTo(leftX, leftY);
        ctx.lineTo(rightX, rightY);
        ctx.closePath();
        ctx.stroke();

    }
}