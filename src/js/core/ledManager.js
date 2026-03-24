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
            this._ws.send(JSON.stringify({ cmd: 'effect', ...payload }));
        }
    }

    // Game start: cyan CHASE across all segments
    onGameStart() {
        for (let seg = 0; seg <= 5; seg++) {
            this.sendEffect({ chain: 'A', type: 'chase', segment: seg, color: { r: 0, g: 255, b: 255 }, speed: 40, repeat: 2, priority: 2 });
        }
        for (let seg = 0; seg <= 2; seg++) {
            this.sendEffect({ chain: 'B', type: 'chase', segment: seg, color: { r: 255, g: 255, b: 255 }, speed: 40, repeat: 2, priority: 2 });
        }
    }

    // Asteroid destroyed: SPARKLE on monitor segments, intensity by size
    onAsteroidDestroyed(size) {
        const effects = {
            3: { color: { r: 0, g: 255, b: 255 }, speed: 30, repeat: 3, priority: 2 },
            2: { color: { r: 0, g: 200, b: 255 }, speed: 60, repeat: 2, priority: 2 },
            1: { color: { r: 0, g: 150, b: 255 }, speed: 80, repeat: 1, priority: 1 },
        };
        const e = effects[size] ?? effects[1];
        for (let seg = 1; seg <= 4; seg++) {
            this.sendEffect({ chain: 'A', type: 'sparkle', segment: seg, ...e });
        }
    }

    // Ship hit: red BLINK on marquee + control panel
    onShipDamaged() {
        for (const seg of [0, 5]) {
            this.sendEffect({ chain: 'A', type: 'blink', segment: seg, color: { r: 255, g: 0, b: 0 }, speed: 80, repeat: 3, priority: 3 });
        }
    }

    // Game over: red PULSE on everything
    onGameOver() {
        for (let seg = 0; seg <= 5; seg++) {
            this.sendEffect({ chain: 'A', type: 'pulse', segment: seg, color: { r: 255, g: 0, b: 0 }, speed: 50, repeat: 5, priority: 3 });
        }
        for (let seg = 0; seg <= 2; seg++) {
            this.sendEffect({ chain: 'B', type: 'pulse', segment: seg, color: { r: 255, g: 0, b: 0 }, speed: 50, repeat: 5, priority: 3 });
        }
    }
}
