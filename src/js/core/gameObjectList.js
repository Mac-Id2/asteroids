import { Asteroid } from "../GameObjects/asteroid.js";

export class GameObjectList {
    constructor() {
        this.items = [];
        this.player = null;
    }

    add(gameObject) {
        this.items.push(gameObject);
    }

    setPlayer(playerObject) {
        this.player = playerObject;
        this.add(playerObject);
    }

    update(deltaTime) {
        this.items.forEach(obj => obj.update(deltaTime));
        this.items = this.items.filter(obj => !obj.isDestroyed);
    }

    draw(ctx) {
        this.items.forEach(obj => obj.draw(ctx));
    }

    getAll() {
        return this.items;
    }

    getAsteroids() {
        return this.items.filter(item => item instanceof Asteroid);
    }
}
