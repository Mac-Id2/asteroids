export const MathUtils = {
    // Gibt eine zufällige Zahl zwischen min und max zurück
    randomRange: (min, max) => {
        return Math.random() * (max - min) + min;
    },

    // Grad in Radiant umrechnen (für Rotation)
    degToRad: (degrees) => {
        return degrees * (Math.PI / 180);
    },

    // Prüft Abstand zwischen zwei Punkten (Pythagoras)
    distance: (x1, y1, x2, y2) => {
        return Math.hypot(x2 - x1, y2 - y1);
    },

    /**
    * Returns a random number between min (inclusive) and max (exclusive)
    */
    getRandomArbitrary: (min, max) => {
        return Math.random() * (max - min) + min;
    }
};


