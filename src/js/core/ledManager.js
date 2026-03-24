const RECONNECT_DELAY_MS = 5000;

export class LedManager {
    constructor(url = 'ws://localhost:8765') {
        this._url = url;
        this._ws = null;
        this._connect();
    }

    _connect() {
        try {
            this._ws = new WebSocket(this._url);
            this._ws.onopen = () => console.log('[LedManager] Connected to', this._url);
            this._ws.onerror = () => {};
            this._ws.onclose = () => {
                this._ws = null;
                setTimeout(() => this._connect(), RECONNECT_DELAY_MS);
            };
        } catch (e) {
            setTimeout(() => this._connect(), RECONNECT_DELAY_MS);
        }
    }

    sendEffect(payload) {
        if (this._ws?.readyState === WebSocket.OPEN) {
            // Wir erzwingen hier eine Standard-Priorität, falls keine angegeben ist
            const data = { 
                cmd: 'effect', 
                priority: 5, 
                ...payload 
            };
            this._ws.send(JSON.stringify(data));
        }
    }

    /**
     * Stoppt alle laufenden Effekte auf allen Segmenten
     */
    clearAll() {
        // Kette A: Segmente 0 bis 5
        for (let seg = 0; seg <= 5; seg++) {
            this.sendEffect({ chain: 'A', type: 'solid', segment: seg, color: { r: 0, g: 0, b: 0 } });
        }
        // Kette B: Segmente 0 bis 2
        for (let seg = 0; seg <= 2; seg++) {
            this.sendEffect({ chain: 'B', type: 'solid', segment: seg, color: { r: 0, g: 0, b: 0 } });
        }
    }

    // Game start: cyan CHASE (Kette A) und weiß (Kette B)
    onGameStart() {
        // 1. Zuerst alles auf Schwarz setzen, um alte "Game Over" Effekte zu killen
        this.clearAll();

        // 2. Kurz warten (50ms), damit die Clear-Befehle verarbeitet werden
        setTimeout(() => {
            // Kette A (Monitor/Gehäuse)
            for (let seg = 0; seg <= 5; seg++) {
                this.sendEffect({ 
                    chain: 'A', 
                    type: 'chase', 
                    segment: seg, 
                    color: { r: 0, g: 255, b: 255 }, 
                    speed: 40, 
                    repeat: 2 
                });
            }
            // Kette B (Buttons/Zusatz)
            for (let seg = 0; seg <= 2; seg++) {
                this.sendEffect({ 
                    chain: 'B', 
                    type: 'chase', 
                    segment: seg, 
                    color: { r: 255, g: 255, b: 255 }, 
                    speed: 40, 
                    repeat: 2 
                });
            }
        }, 50);
    }

    // Asteroid zerstört: SPARKLE Effekt
    onAsteroidDestroyed(size) {
        const effects = {
            3: { color: { r: 0, g: 255, b: 255 }, speed: 30, repeat: 3 },
            2: { color: { r: 0, g: 200, b: 255 }, speed: 60, repeat: 2 },
            1: { color: { r: 0, g: 150, b: 255 }, speed: 80, repeat: 1 },
        };
        const e = effects[size] ?? effects[1];
        // Sparkle nur auf den inneren Segmenten (1-4)
        for (let seg = 1; seg <= 4; seg++) {
            this.sendEffect({ chain: 'A', type: 'sparkle', segment: seg, ...e });
        }
    }

    // Schiff getroffen: Rotes Blinken auf Marquee (0) und Control Panel (5)
    onShipDamaged() {
        for (const seg of [0, 5]) {
            this.sendEffect({ 
                chain: 'A', 
                type: 'blink', 
                segment: seg, 
                color: { r: 255, g: 0, b: 0 }, 
                speed: 80, 
                repeat: 3 
            });
        }
    }

    // Game over: Roter Puls auf allen LEDs
    onGameOver() {
        for (let seg = 0; seg <= 5; seg++) {
            this.sendEffect({ 
                chain: 'A', 
                type: 'pulse', 
                segment: seg, 
                color: { r: 255, g: 0, b: 0 }, 
                speed: 50, 
                repeat: 5 
            });
        }
        for (let seg = 0; seg <= 2; seg++) {
            this.sendEffect({ 
                chain: 'B', 
                type: 'pulse', 
                segment: seg, 
                color: { r: 255, g: 0, b: 0 }, 
                speed: 50, 
                repeat: 5 
            });
        }
    }
}