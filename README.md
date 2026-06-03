# Asteroids

Ein Canvas-basiertes Asteroids-Spiel mit LED-Strip-Integration, entwickelt mit JavaScript und PyWebView.

Developed by Kevin, Maik and Enis.

---

## Inhaltsverzeichnis

- [Funktionsbeschreibung](#funktionsbeschreibung)
- [Projektstruktur](#projektstruktur)
- [Technologien](#technologien)
- [Installation](#installation)
- [Steuerung](#steuerung)
- [Parametrierung](#parametrierung)
- [LED-System](#led-system)
- [Audio / Volume](#audio--volume)

---

## Funktionsbeschreibung

### Spielablauf

Der Spieler steuert ein Raumschiff und muss Asteroiden abschießen. Asteroiden zerfallen beim Treffer in kleinere Bruchstücke. Ziel ist es, möglichst viele Punkte zu sammeln, bevor alle Leben aufgebraucht sind.

### Waffen-System

Es gibt 4 Waffen, die über Power-Ups aufgesammelt werden:

| Waffe    | Beschreibung                                   |
|----------|------------------------------------------------|
| Laser    | Einzelschuss, schnell, Standard-Waffe          |
| Pumpgun  | 5 Projektile gleichzeitig mit Streuung         |
| Rocket   | Langsam, aber mit Flächenschaden (50px Radius) |
| MP       | Sehr schnelle Feuerrate, geringer Einzelschaden|

### Asteroiden

| Größe | Radius | Geschwindigkeit | Zerfällt in  |
|-------|--------|-----------------|--------------|
| 3     | ~100px | ~36 px/s        | 2× Größe 2   |
| 2     | ~40px  | ~60 px/s        | 3× Größe 1   |
| 1     | ~20px  | ~120 px/s       | Nichts       |

### Wellen-System

- Welle startet mit 5 Asteroiden
- Jede weitere Welle: `5 + (Welle × 2)` Asteroiden
- Zwischen Wellen: 3,5 Sekunden Pause
- Adaptives Spawning: alle 10 Sekunden wird geprüft ob neue Asteroiden nachspawnen

### Power-Ups

- Erscheinen mit **10% Wahrscheinlichkeit** beim Zerstören eines Asteroiden
- Vergeben eine zufällige Waffe (nicht die aktuell ausgerüstete)
- Verschwinden nach **10 Sekunden**

### Scoring & Leben

- **100 Punkte** pro zerstörtem Asteroiden
- **Extra Leben** alle 10.000 Punkte
- **3 Leben** zu Spielbeginn
- **2 Sekunden Unverwundbarkeit** nach einem Treffer (gelbe Schiffsfarbe)
- **Top 10 Highscores** werden lokal gespeichert

### Szenen

```
Menü → Spielfeld → Game Over → Highscore → Menü
```

---

## Projektstruktur

```
asteroids/
├── src/
│   ├── index.html
│   ├── js/
│   │   ├── core/
│   │   │   ├── game.js              # Hauptspiel-Loop, Szenen-Verwaltung
│   │   │   ├── scene.js             # Basis-Klasse für alle Szenen
│   │   │   ├── gameObject.js        # Basis-Klasse für alle Spielobjekte
│   │   │   ├── gameObjectList.js    # Verwaltung aktiver Spielobjekte
│   │   │   ├── inputHandler.js      # Tastatur-Eingaben
│   │   │   ├── soundManager.js      # Audio-Verwaltung
│   │   │   └── ledManager.js        # LED-Strip-Steuerung via WebSocket
│   │   ├── config/
│   │   │   └── weaponConfig.js      # Waffen-Konfigurationen
│   │   ├── scenes/
│   │   │   ├── menuScene.js         # Hauptmenü
│   │   │   ├── playScene.js         # Spielszene
│   │   │   ├── gameOverScene.js     # Game-Over-Bildschirm
│   │   │   └── highscoreScene.js    # Highscore-Anzeige
│   │   ├── GameObjects/
│   │   │   ├── ship.js              # Spieler-Raumschiff
│   │   │   ├── asteroid.js          # Asteroiden
│   │   │   ├── laser.js             # Projektile
│   │   │   └── powerUp.js           # Waffen-Pickups
│   │   ├── manager/
│   │   │   ├── ui.js                # HUD (Score, Leben, Waffe, Zeit)
│   │   │   ├── bulletManager.js     # Projektil-Verwaltung
│   │   │   ├── asteroidsManager.js  # Asteroiden-Spawning
│   │   │   └── background.js        # Sternenhintergrund
│   │   ├── systems/
│   │   │   └── collision.js         # Kollisionserkennung
│   │   └── utils/
│   │       └── math.js              # Mathematik-Hilfsfunktionen
│   └── assets/
│       ├── sounds/                  # MP3-Audiodateien
│       └── *.png                    # Planeten-Bilder (Menü)
├── .github/workflows/
│   └── build.yml                    # CI/CD Build-Pipeline
└── docker-compose.yml               # LED-Server (optional)
```

---

## Technologien

| Technologie    | Verwendung                                |
|----------------|-------------------------------------------|
| JavaScript     | Spiellogik (ES6+ Module, kein Framework)  |
| Canvas 2D      | Rendering                                 |
| PyWebView      | Desktop-Wrapper (Python)                  |
| Python 3.10    | Backend für Highscore-Persistierung       |
| PyInstaller    | Build zu nativer Applikation              |
| WebSocket      | Verbindung zum LED-Server                 |
| Docker         | Optionaler LED-Server                     |
| GitHub Actions | Cross-Platform Build & Release            |

---

## Installation

### Voraussetzungen

- Python 3.10+
- pip

### Abhängigkeiten installieren

```bash
pip install pywebview pyinstaller bottle setuptools
```

### Entwicklungs-Modus (Browser)

```bash
# index.html direkt im Browser öffnen
# Empfohlen: Live Server Extension in VS Code
open src/index.html
```

> **Hinweis:** Einige Funktionen (Highscore-Speicherung, App-Beenden) erfordern PyWebView und sind im reinen Browser-Modus nicht verfügbar.

### Build (Executable)

Der Build läuft automatisch über GitHub Actions bei einem Push oder kann manuell ausgelöst werden.

```bash
pyinstaller --onefile game_wrapper.py
```

**Plattformen:**
- Windows → `game.exe`
- macOS → `game`
- Linux → `game`

### LED-Server (optional)

```bash
docker-compose up
```

---

## Steuerung

| Taste       | Aktion           |
|-------------|------------------|
| `W`         | Schub (vorwärts) |
| `A`         | Links drehen     |
| `D`         | Rechts drehen    |
| `Space`     | Schießen         |
| `Q` / `Esc` | Spiel beenden    |

Gamepad wird ebenfalls unterstützt.

---

## Parametrierung

### Waffen (`src/js/config/weaponConfig.js`)

```js
const WEAPON_CONFIG = {
    'Laser': {
        interval:     250,   // Feuer-Intervall in ms
        projectiles:  1,     // Anzahl Projektile pro Schuss
        speed:        660,   // Projektilgeschwindigkeit in px/s
        lifespan:     1.2,   // Lebensdauer in Sekunden
        damage:       1,     // Schaden pro Treffer
        color:        'red',
        lengthFactor: 6,     // Visuelle Länge des Lasers
        areaRadius:   0      // Flächenschaden-Radius (0 = kein)
    },
    'Pumpgun': {
        interval:    800,
        projectiles: 5,
        angleSpread: 0.3,    // Streuwinkel in Radiant
        speed:       600,
        // ...
    },
    'Rocket': {
        interval:   1200,
        speed:      300,
        areaRadius: 50,      // 50px Flächenschaden
        lifespan:   2.5,
        // ...
    },
    'MP': {
        interval: 80,        // Sehr schnell
        speed:    1260,
        damage:   0.2,
        // ...
    }
};
```

### Raumschiff (`src/js/GameObjects/ship.js`)

```js
this.health        = 3;    // Startleben
this.rotationSpeed = 4.0;  // Rotationsgeschwindigkeit in rad/s
this.acceleration  = 300;  // Beschleunigung in px/s²
this.friction      = 0.5;  // Reibung (0 = keine, 1 = sofort stop)
```

### Asteroiden-Spawning (`src/js/manager/asteroidsManager.js`)

```js
this.spawnInterval = 10;   // Spawn-Prüfung alle N Sekunden

const growthRate   = 0.5;  // Anstieg aktiver Asteroiden pro Sekunde Spielzeit
const startAmount  = 5;    // Startwert
const maxAsteroids = 40;   // Maximale gleichzeitige Asteroiden
const spawnMargin  = 80;   // Abstand vom Bildschirmrand in px
```

### Asteroiden-Eigenschaften (`src/js/GameObjects/asteroid.js`)

```js
const sizeMap   = { 3: 100, 2: 40, 1: 20 };  // Kollisionsradius je Größe
const speedMap  = { 3: 36, 2: 60, 1: 120 };  // Grundgeschwindigkeit in px/s
const vertexMap = { 3: 12, 2: 9, 1: 6 };     // Anzahl Ecken (Form)
```

### Wellen & Scoring (`src/js/scenes/playScene.js`)

```js
this.nextLifeScore      = 10000; // Erstes Extra-Leben bei N Punkten (+10000 pro weiteres)
this.levelTransitionTimer = 3.5; // Pause zwischen Wellen in Sekunden

// Asteroiden pro Welle
const spawnCount = 5 + (this.currentWave * 2);
```

### Power-Up-Wahrscheinlichkeit (`src/js/systems/collision.js`)

```js
if (Math.random() < 0.10) { ... } // 10% Chance pro zerstörtem Asteroiden
```

### AFK-Timeout (`src/js/core/game.js`)

```js
this.AFK_TIMEOUT_MS = 180000; // 3 Minuten Inaktivität → Spiel beendet (in ms)
```

---

## LED-System

Das LED-System verbindet sich via WebSocket mit einem LED-Server auf `ws://localhost:8765`. Die Verbindung ist optional – das Spiel läuft auch ohne LED-Server.

### Events

| Event           | Auslöser                   | Effekt            |
|-----------------|----------------------------|-------------------|
| `sys_start_ast` | Spielstart / Menü laden    | Cyan Wipe         |
| `ast_small`     | Kleiner Asteroid zerstört  | Weiße Sparkle     |
| `ast_large`     | Großer Asteroid zerstört   | Weiße Sparkle 4×  |
| `ast_life`      | Extra Leben erhalten       | Gold Chase        |
| `ast_level`     | Welle abgeschlossen        | Regenbogen        |
| `ast_gameover`  | Game Over                  | Rote Wipe         |
| `sys_end`       | Spiel beendet              | Reset             |
| `sys_highscore` | Highscore-Anzeige          | Regenbogen 3×     |

### WebSocket-Protokoll

```json
{
    "cmd": "effect",
    "chain": "A",
    "type": "wipe",
    "segment": 99,
    "color": { "r": 0, "g": 255, "b": 255 },
    "speed": 50,
    "length": 10,
    "repeat": 1,
    "priority": 3
}
```

Verfügbare Effekt-Typen: `wipe`, `chase`, `sparkle`, `pulse`, `rainbow`, `blink`, `fill`, `scanner`

Alle LED-Events werden in `src/js/core/ledManager.js` unter `EVENTS` konfiguriert.

---

## Audio / Volume

Die Lautstärke wird in `src/js/core/soundManager.js` im Constructor geregelt.

### Anpassen

```js
this.setVolume('thrust',     0.3);  // Schub-Sound
this.setVolume('fire',       0.5);  // Schuss-Sound
this.setVolume('bangSmall',  0.3);  // Kleine Explosion
this.setVolume('bangMedium', 0.3);  // Mittlere Explosion
this.setVolume('bangLarge',  0.3);  // Große Explosion
this.setVolume('damage',     0.5);  // Schaden-Sound
this.setVolume('gameover',   1.0);  // Game-Over-Sound
this.setVolume('menuMusic',  0.4);  // Menü-Hintergrundmusik
this.setVolume('gameMusic',  0.4);  // Spiel-Hintergrundmusik
```

### Wichtig

- Werte müssen zwischen `0.0` (stumm) und `1.0` (maximale Lautstärke) liegen
- Werte außerhalb dieses Bereichs führen zu einem Browser-Fehler
- Hintergrundmusik-Dateien (`menuMedlody.mp3`, `gamePlayMelodie.mp3`) müssen in `src/assets/sounds/` liegen
