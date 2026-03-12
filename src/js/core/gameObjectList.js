import { Asteroid } from "../GameObjects/asteroid.js";

export class GameObjectList {
    constructor() {
        this.items = [];   // Die eigentliche Liste aller Entities
        this.player = null; // Direkte Referenz auf den Spieler (für einfache Zugriffe)
    }

    add(gameObject) {
        this.items.push(gameObject);
    }

    // Speichert den Spieler separat für schnellen Zugriff
    setPlayer(playerObject) {
        this.player = playerObject;
        this.add(playerObject); // Spieler ist natürlich auch ein GameObject
    }

    update(deltaTime) {
        // Alle Objekte updaten
        this.items.forEach(obj => obj.update(deltaTime));

        // Aufräumen: Tote Objekte entfernen
        this.items = this.items.filter(obj => !obj.isDestroyed);
    }

    draw(ctx) {
        this.items.forEach(obj => obj.draw(ctx));
    }

    // Gibt die rohe Liste zurück (für das CollisionSystem)
    getAll() {
        return this.items;
    }

    getAstroids() {
        return this.items.filter(item => item instanceof Asteroid)
    }
}