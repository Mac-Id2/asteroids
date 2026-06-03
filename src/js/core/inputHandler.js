export class InputHandler {
    constructor() {
        this.keys = {}; // Speichert true/false für Tastencodes

        // Event Listener binden
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    // Prüft, ob eine Taste gerade gehalten wird
    isDown(code) {
        return !!this.keys[code]; // Gibt true zurück, wenn Taste gedrückt
    }
}