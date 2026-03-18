// manager/ledManager.js
export class LedManager {
    constructor(url = "ws://localhost:8765") {
        this.url = url;
        this.socket = null;
        this.isConnected = false;
        this.connect();
    }

    connect() {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log("LED Bridge verbunden");
            this.isConnected = true;
            this.attractPause(); // Optional: Pausiere Standard-Animation beim Start
        };

        this.socket.onclose = () => {
            console.warn("LED Bridge getrennt. Reconnect in 5s...");
            this.isConnected = false;
            setTimeout(() => this.connect(), 5000);
        };

        this.socket.onerror = (err) => console.error("LED Fehler:", err);
    }

    sendEffect(chain, type, segment, r, g, b, speed = 50, repeat = 1) {
        if (!this.isConnected) return;

        const payload = {
            cmd: "effect",
            chain: chain,
            type: type,
            segment: segment,
            color: { r, g, b },
            speed: speed,
            repeat: repeat,
            priority: 2
        };
        this.socket.send(JSON.stringify(payload));
    }

    attractPause() {
        if (this.isConnected) this.socket.send(JSON.stringify({ cmd: "attract", state: "pause" }));
    }

    attractResume() {
        if (this.isConnected) this.socket.send(JSON.stringify({ cmd: "attract", state: "resume" }));
    }
}