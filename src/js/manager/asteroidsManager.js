import { Asteroid } from "../GameObjects/asteroid.js"




export class AstroidManager {
    constructor(canvasWidth, canvasHeight, objectList, scene) {
        this.canvasHeight = canvasHeight;
        this.canvasWidth = canvasWidth;
        this.objectList = objectList;
        this.scene = scene;

        // Timer für den Spawn-Intervall (statt setTimeout)
        this.spawnCheckTimer = 0;
        this.spawnInterval = 10;

        this.checkAndSpawn();
    }

    // Diese Methode wird JEDEN Frame von der PlayScene aufgerufen
    update(deltaTime) {
        this.spawnCheckTimer += deltaTime;


        //console.log("Time Checker: current - " + this.spawnCheckTimer + " -- to reach - " + this.spawnInterval);

        if (this.spawnCheckTimer >= this.spawnInterval) {
            this.checkAndSpawn();
            this.spawnCheckTimer = 0; // Timer zurücksetzen
        }
    }

    checkAndSpawn() {

        //console.warn("SPAWN ROTATION");

        const currentTimer = this.scene.gameTimer;
        const targetAmount = Math.floor(this.getAmountToSpawn(currentTimer));
        const currentAmount = this.objectList.getAstroids().length;

        if (currentAmount < targetAmount) {
            const amountToSpawn = targetAmount - currentAmount;
            //console.log(`Spawning ${amountToSpawn} new asteroids. Difficulty: ${targetAmount}. Current Amount: ${currentAmount}`);
            this.initAstroids(amountToSpawn);
        }
    }

    getAmountToSpawn(currentTime) {
        const m = 0.5; // Etwas langsamer steigend
        const b = 5;      // Wir starten immer mit mindestens 3
        const maxAstroids = 40; // Obergrenze, damit es spielbar bleibt

        const amount = m * currentTime + b;
        return Math.min(amount, maxAstroids);
    }

    initAstroids(amount) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;

        for (let i = 0; i < amount; i++) {
            let x, y;
            const side = Math.floor(Math.random() * 4);
            const margin = 80; // Etwas mehr Puffer

            switch (side) {
                case 0: x = Math.random() * this.canvasWidth; y = -margin; break; // Oben
                case 1: x = this.canvasWidth + margin; y = Math.random() * this.canvasHeight; break; // Rechts
                case 2: x = Math.random() * this.canvasWidth; y = this.canvasHeight + margin; break; // Unten
                case 3: x = -margin; y = Math.random() * this.canvasHeight; break; // Links
            }

            // Hier übergeben wir centerX und centerY als Ziel
            this.objectList.add(new Asteroid(x, y, 3, centerX, centerY));
        }
    }


    spawnNewAstroids(destroyedAstroid) {

        //console.log("ON ASTROID DESTROYED: SPAWN NEW ASTROIDS")

        const nextSize = destroyedAstroid.size - 1;

        if (nextSize > 0) {
            // Logik: Ein Großer gibt 2 Mittlere, ein Mittlerer gibt 3 Kleine
            const count = destroyedAstroid.size === 3 ? 2 : 3;

            for (let i = 0; i < count; i++) {
                // Versatz damit sie sich nicht überlagern
                const spawnOffset = destroyedAstroid.baseRadius * 0.5;
                const offsetX = (Math.random() - 0.5) * spawnOffset;
                const offsetY = (Math.random() - 0.5) * spawnOffset;
                this.objectList.add(new Asteroid(destroyedAstroid.x + offsetX, destroyedAstroid.y + offsetY, nextSize))
            }
        }
    }

}
