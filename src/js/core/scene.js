import { GameObjectList } from "./gameObjectList.js";

export class Scene {
    constructor(game) {
        this.game = game; // Referenz zum Hauptspiel, um Szenen zu wechseln

        this.objects = new GameObjectList();
    }

    update(deltaTime) {

        this.objects.update(deltaTime);
    }
    
    draw(ctx) {

        this.objects.draw(ctx);
    }

    handleInput(event) {} // Für Mausklicks oder Tasten
}