import { Asteroid } from "../GameObjects/asteroid.js"

export class AsteroidManager {
    constructor(canvasWidth, canvasHeight, objectList, scene) {
        this.canvasHeight = canvasHeight;
        this.canvasWidth = canvasWidth;
        this.objectList = objectList;
        this.scene = scene;

        this.timeSinceLastSpawnCheck = 0;
        this.spawnInterval = 10;

        this.checkAndSpawn();
    }

    update(deltaTime) {
        this.timeSinceLastSpawnCheck += deltaTime;

        if (this.timeSinceLastSpawnCheck >= this.spawnInterval) {
            this.checkAndSpawn();
            this.timeSinceLastSpawnCheck = 0;
        }
    }

    checkAndSpawn() {
        const currentTimer = this.scene.gameTimer;
        const targetAmount = Math.floor(this.getAmountToSpawn(currentTimer));
        const currentAmount = this.objectList.getAsteroids().length;

        if (currentAmount < targetAmount) {
            const amountToSpawn = targetAmount - currentAmount;
            this.initAstroids(amountToSpawn);
        }
    }

    getAmountToSpawn(currentTime) {
        const growthRate = 0.5;
        const startAmount = 5;
        const maxAsteroids = 40;

        return Math.min(growthRate * currentTime + startAmount, maxAsteroids);
    }

    initAstroids(amount) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        const spawnMargin = 80;

        for (let i = 0; i < amount; i++) {
            let x, y;
            const side = Math.floor(Math.random() * 4);

            switch (side) {
                case 0: x = Math.random() * this.canvasWidth;  y = -spawnMargin; break;
                case 1: x = this.canvasWidth + spawnMargin;    y = Math.random() * this.canvasHeight; break;
                case 2: x = Math.random() * this.canvasWidth;  y = this.canvasHeight + spawnMargin; break;
                case 3: x = -spawnMargin;                      y = Math.random() * this.canvasHeight; break;
            }

            this.objectList.add(new Asteroid(x, y, 3, centerX, centerY));
        }
    }

    spawnNewAstroids(destroyedAsteroid) {
        if (this.scene && this.scene.game && this.scene.game.led) {
            const eventKey = destroyedAsteroid.size === 1 ? 'ast_small' : 'ast_large';
            this.scene.game.led.triggerEvent(eventKey);
        }

        const nextSize = destroyedAsteroid.size - 1;

        if (nextSize > 0) {
            const count = destroyedAsteroid.size === 3 ? 2 : 3;

            for (let i = 0; i < count; i++) {
                const spawnOffset = destroyedAsteroid.baseRadius * 0.5;
                const offsetX = (Math.random() - 0.5) * spawnOffset;
                const offsetY = (Math.random() - 0.5) * spawnOffset;
                this.objectList.add(new Asteroid(destroyedAsteroid.x + offsetX, destroyedAsteroid.y + offsetY, nextSize));
            }
        }
    }
}
