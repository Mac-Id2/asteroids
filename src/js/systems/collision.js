import { Ship } from '../GameObjects/ship.js';
import { Asteroid } from '../GameObjects/asteroid.js';
import { Laser } from '../GameObjects/laser.js';
import { PowerUp } from '../GameObjects/powerUp.js';

export class CollisionSystem {

    constructor(game, astroidManager, objects, player) {
        this.game = game;
        this.astroidManager = astroidManager;
        this.objects = objects;
        this.player = player;
    }

    checkCollisions() {
        const list = this.objects.getAll();
        for (let i = 0; i < list.length; i++) {
            for (let j = i + 1; j < list.length; j++) {
                this.detect(list[i], list[j]);
            }
        }
    }

    detect(a, b) {
        if (a.isDestroyed || b.isDestroyed) return;

        const ship  = a instanceof Ship ? a : b instanceof Ship ? b : null;
        const other = ship === a ? b : a;

        if (ship) {
            const circles = ship.getCollisionCircles();
            for (const circle of circles) {
                const dx   = circle.x - other.x;
                const dy   = circle.y - other.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < circle.r + other.collisionRadius) {
                    this.resolve(a, b);
                    return;
                }
            }
        } else {
            const dx   = a.x - b.x;
            const dy   = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < a.collisionRadius + b.collisionRadius) {
                this.resolve(a, b);
            }
        }
    }

    resolve(a, b) {
        // Ship ↔ Asteroid
        if (
            (a instanceof Ship && b instanceof Asteroid) ||
            (b instanceof Ship && a instanceof Asteroid)
        ) {
            this.handleShipAsteroid(
                a instanceof Ship ? a : b,
                a instanceof Asteroid ? a : b
            );
        }

        // Laser ↔ Asteroid
        else if (
            (a instanceof Laser && b instanceof Asteroid) ||
            (b instanceof Laser && a instanceof Asteroid)
        ) {
            this.handleLaserAsteroid(
                a instanceof Laser ? a : b,
                a instanceof Asteroid ? a : b
            );
        }

        // Ship ↔ PowerUp
        else if (
            (a instanceof Ship && b instanceof PowerUp) ||
            (b instanceof Ship && a instanceof PowerUp)
        ) {
            this.handleShipPowerUp(
                a instanceof Ship ? a : b,
                a instanceof PowerUp ? a : b
            );
        }
    }

    handleShipPowerUp(ship, powerup) {
        if (ship.activeWeapon === powerup.weaponType) return;
        ship.setWeapon(powerup.weaponType);
        powerup.isDestroyed = true;
    }

    handleShipAsteroid(ship, asteroid) {
        if (ship.isInvincible) return;

        ship.hitShip();
        ship.triggerInvulnerability?.(2000);

        this.game.ui?.takeDamage(33);
        this.game.sound?.play('damage');
        this.game.led?.onShipDamaged();

        asteroid.isDestroyed = true;
    }

    handleLaserAsteroid(laser, asteroid) {
        laser.isDestroyed = true;
        asteroid.isDestroyed = true;

        this.game.ui?.addScore(100);

        const bangMap = { 3: 'bangLarge', 2: 'bangMedium', 1: 'bangSmall' };
        this.game.sound?.play(bangMap[asteroid.size] ?? 'bangSmall');
        this.game.led?.onAsteroidDestroyed(asteroid.size);

        if (Math.random() < 0.10) {
            const powerUp = new PowerUp(
                asteroid.x,
                asteroid.y,
                this.player.activeWeapon
            );
            this.objects.add(powerUp);
        }

        this.astroidManager?.spawnNewAstroids(asteroid);
    }
}
