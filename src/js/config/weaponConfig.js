export const WEAPON_CONFIG = {
    'Laser': {
        interval: 250,
        projectiles: 1,
        angleSpread: 0,
        speed: 660,       // (11 * 60)
        lifespan: 0.83,   // (50 / 60) Sekunde
        damage: 1,
        color: "#ff0000",
        lengthFactor: 0.04, // Kleiner Wert, da speed jetzt hoch ist
        areaRadius: 0
    },
    'Pumpgun': {
        interval: 800,
        projectiles: 5,
        angleSpread: 0.3,
        speed: 600,       // (10 * 60)
        lifespan: 0.58,   // (35 / 60) Sekunde
        damage: 1,
        color: "orange",
        lengthFactor: 0.03,
        areaRadius: 0
    },
    'Rocket': {
        interval: 1200,
        projectiles: 1,
        angleSpread: 0,
        speed: 300,       // (5 * 60)
        lifespan: 2.5,    // (150 / 60) Sekunden
        damage: 1,
        color: "blue",
        lengthFactor: 0.05,
        areaRadius: 50
    },
    'MP': {
        interval: 80,
        projectiles: 1,
        angleSpread: 0.0,
        speed: 1260,      // (21 * 60)
        lifespan: 0.5,    // (30 / 60) Sekunde
        damage: 0.2,
        color: "lime",
        lengthFactor: 0.01,
        areaRadius: 0
    }
};