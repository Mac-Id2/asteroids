export class LedManager {
    constructor(url = 'ws://localhost:8765', options = {}) {
        this._url = url;
        this._ws = null;
        this._reconnectDelay = options.reconnectDelay || 3000;

        this.onConnect = options.onConnect || (() => {});
        this.onDisconnect = options.onDisconnect || (() => {});
        this.onError = options.onError || (() => {});
        this.onMessage = options.onMessage || (() => {});
    }

    connect() {
        try {
            console.log(`[LedManager] Versuche Verbindung zu ${this._url} aufzubauen...`);
            this._ws = new WebSocket(this._url);

            this._ws.onopen = () => {
                console.log('%c[LedManager] 🌐 VERBUNDEN mit ' + this._url, 'color: #00ff88; font-weight: bold;');
                this.onConnect();
            };

            this._ws.onmessage = (event) => {
                this.onMessage(event.data);
            };

            this._ws.onclose = () => {
                console.warn('[LedManager] 🔌 Verbindung getrennt. Reconnect in 3s...');
                this._ws = null;
                this.onDisconnect();
                setTimeout(() => this.connect(), this._reconnectDelay);
            };

            this._ws.onerror = (error) => {
                console.error('[LedManager] ❌ WebSocket Fehler:', error);
                this.onError(error);
            };
        } catch (e) {
            console.error('[LedManager] ❌ Verbindungsaufbau fehlgeschlagen:', e);
            this.onError(e);
            setTimeout(() => this.connect(), this._reconnectDelay);
        }
    }

    /**
     * Sendet Daten an den Server und loggt den Status in die Konsole
     */
    send(payload) {
        if (!this._ws) {
            console.error('%c[LedManager] 🔴 FEHLER: connect() wurde noch nicht aufgerufen!', 'color: #ff3333;');
            return false;
        }

        if (this._ws.readyState === WebSocket.OPEN) {
            const json = JSON.stringify(payload);
            this._ws.send(json);
            console.log(`%c[LedManager] 🟢 GESENDET: ${json}`, 'color: #00e5ff;');
            return true;
        } else {
            const states = ["CONNECTING (Verbindet...)", "OPEN", "CLOSING", "CLOSED (Geschlossen)"];
            const currentState = states[this._ws.readyState] || this._ws.readyState;
            console.warn(`%c[LedManager] 🔴 BLOCKIERT: Konnte Daten nicht senden. Server-Status ist: ${currentState}`, 'color: #ffcc00;');
            return false;
        }
    }

    sendAttract(state) {
        this.send({ cmd: 'attract', state });
    }

    sendEffect(params = {}) {
        const defaultParams = {
            cmd: 'effect',
            chain: 'A',
            type: 'chase',
            segment: 99,
            color: { r: 255, g: 0, b: 255 },
            speed: 50,
            length: 5,
            repeat: 1,
            dir: 1,
            priority: 2
        };
        this.send({ ...defaultParams, ...params });
    }

    triggerEvent(eventKey) {
        const commands = LedManager.EVENTS[eventKey];
        if (commands) {
            commands.forEach(cmd => this.send(cmd));
            return true;
        }
        console.warn(`[LedManager] ⚠️ Event Key "${eventKey}" nicht in EVENTS definiert.`);
        return false;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ABWÄRTSKOMPATIBILITÄT
    // ─────────────────────────────────────────────────────────────────────────

    clearAll() {
        for (let seg = 0; seg <= 5; seg++) this.sendEffect({ chain: 'A', type: 'solid', segment: seg, color: { r: 0, g: 0, b: 0 }, priority: 3 });
        for (let seg = 0; seg <= 2; seg++) this.sendEffect({ chain: 'B', type: 'solid', segment: seg, color: { r: 0, g: 0, b: 0 }, priority: 3 });
    }

    onGameStart() {
        this.triggerEvent('sys_start_ast');
    }

    onAsteroidDestroyed(size) {
        if (size === 1) this.triggerEvent('ast_small');
        else this.triggerEvent('ast_large');
    }

    onShipDamaged() {
        this.triggerEvent('ast_death');
    }

    onGameOver() {
        this.triggerEvent('ast_gameover');
    }
}

LedManager.EVENTS = {
    pacman_pill: [{ cmd: 'effect', chain: 'A', type: 'chase', segment: 1, color: {r:255,g:215,b:0}, speed: 40, length: 5, repeat: 1, priority: 2 }],
    pacman_powerpill: [{ cmd: 'effect', chain: 'A', type: 'pulse', segment: 99, color: {r:0,g:0,b:255}, speed: 15, repeat: -1, priority: 2 }],
    pacman_ghost: [{ cmd: 'effect', chain: 'A', type: 'sparkle', segment: 99, color: {r:255,g:255,b:255}, speed: 50, repeat: 3, priority: 2 }],
    pacman_fruit: [{ cmd: 'effect', chain: 'A', type: 'sparkle', segment: 0, color: {r:255,g:140,b:0}, speed: 50, repeat: 5, priority: 2 }],
    pacman_level: [{ cmd: 'effect', chain: 'A', type: 'wipe', segment: 99, color: {r:255,g:215,b:0}, speed: 30, repeat: 1, priority: 3 }],
    pacman_death: [{ cmd: 'effect', chain: 'A', type: 'blink', segment: 99, color: {r:255,g:0,b:0}, speed: 150, repeat: 3, priority: 3 }],
    pacman_gameover: [{ cmd: 'effect', chain: 'A', type: 'fill', segment: 99, color: {r:255,g:0,b:0}, speed: 100, repeat: 1, priority: 3 }],
    si_alien: [{ cmd: 'effect', chain: 'A', type: 'sparkle', segment: 99, color: {r:0,g:255,b:0}, speed: 50, repeat: 5, priority: 2 }],
    si_ufo_appear: [{ cmd: 'effect', chain: 'A', type: 'chase', segment: 0, color: {r:0,g:255,b:255}, speed: 30, length: 6, repeat: 3, priority: 2 }],
    si_ufo_hit: [{ cmd: 'effect', chain: 'A', type: 'sparkle', segment: 0, color: {r:0,g:255,b:255}, speed: 50, repeat: 8, priority: 2 }],
    si_bunker: [{ cmd: 'effect', chain: 'A', type: 'pulse', segment: 5, color: {r:255,g:140,b:0}, speed: 40, repeat: 2, priority: 2 }],
    si_wave: [{ cmd: 'effect', chain: 'A', type: 'wipe', segment: 99, color: {r:0,g:255,b:0}, speed: 30, repeat: 1, priority: 3 }],
    si_death: [{ cmd: 'effect', chain: 'A', type: 'blink', segment: 99, color: {r:255,g:0,b:0}, speed: 150, repeat: 2, priority: 3 }],
    si_gameover: [{ cmd: 'effect', chain: 'A', type: 'fill', segment: 99, color: {r:255,g:0,b:0}, speed: 100, repeat: 1, priority: 3 }],
    ast_small: [{ cmd: 'effect', chain: 'A', type: 'sparkle', segment: 99, color: {r:255,g:255,b:255}, speed: 50, repeat: 2, priority: 2 }],
    ast_life: [{ cmd: 'effect', chain: 'A', type: 'chase', segment: 99, color: {r:255,g:215,b:0}, speed: 40, length: 10, repeat: 1, priority: 3 }],
    ast_large: [{ cmd: 'effect', chain: 'A', type: 'sparkle', segment: 99, color: {r:255,g:255,b:255}, speed: 50, repeat: 4, priority: 2 }],
    ast_level: [{ cmd: 'effect', chain: 'A', type: 'rainbow', segment: 99, color: {r:0,g:0,b:0}, speed: 20, repeat: 2, priority: 3 }],
    ast_death: [{ cmd: 'effect', chain: 'A', type: 'blink', segment: 99, color: {r:255,g:0,b:0}, speed: 150, repeat: 3, priority: 3 }],
    ast_gameover: [{ cmd: 'effect', chain: 'A', type: 'wipe', segment: 99, color: {r:255,g:0,b:0}, speed: 100, repeat: 1, priority: 3 }],
    sys_start_pacman: [{ cmd: 'effect', chain: 'A', type: 'scanner', segment: 99, color: {r:255,g:215,b:0}, speed: 20, repeat: 1, priority: 3 }],
    sys_start_si: [{ cmd: 'effect', chain: 'A', type: 'wipe', segment: 99, color: {r:0,g:255,b:0}, speed: 20, repeat: 1, priority: 3 }],
    sys_start_ast: [{ cmd: 'effect', chain: 'A', type: 'wipe', segment: 99, color: {r:0,g:255,b:255}, speed: 20, repeat: 1, priority: 3 }],
    sys_end: [{ cmd: 'attract', state: 'resume' }],
    sys_highscore: [{ cmd: 'effect', chain: 'A', type: 'rainbow', segment: 99, color: {r:0,g:0,b:0}, speed: 15, repeat: 3, priority: 3 }],
    sys_coin: [{ cmd: 'effect', chain: 'A', type: 'sparkle', segment: 0, color: {r:255,g:215,b:0}, speed: 60, repeat: 5, priority: 2 }]
};