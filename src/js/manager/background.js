export class StarBackground {
    // NEU: 3. Parameter 'enablePlanets' (Standard: true)
    constructor(width, height, enablePlanets = true) {
        this.width = width;
        this.height = height;

        // --- 1. Sterne (Immer da) ---
        this.stars = [];
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2,
                speed: ((Math.random() * 0.5) + 0.1) * 60,
            });
        }

        // --- 2. Planeten (Nur wenn gewünscht) ---
        this.planets = [];
        if (enablePlanets) {
            this.planets = [
                { x: this.width * 0.2, y: this.height * 0.3, radius: 80, color1: '#4b0082', color2: '#0000ff', speed: 0.05 },
                { x: this.width * 0.8, y: this.height * 0.7, radius: 120, color1: '#8b0000', color2: '#ff4500', speed: 0.03 }
            ];
        }
    }

    update(deltaTime) {
        // Sterne bewegen
        this.stars.forEach(star => {
            star.y += star.speed * deltaTime;
            if (star.y > this.height) star.y = 0;
        });

        // Planeten bewegen (Liste ist leer, wenn enablePlanets = false)
        this.planets.forEach(planet => {
            planet.x -= planet.speed * deltaTime;
            if (planet.x + planet.radius < 0) planet.x = this.width + planet.radius;
        });
    }

    draw(ctx) {
        // 1. Hintergrund-Verlauf
        const bgGradient = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGradient.addColorStop(0, "#000005");
        bgGradient.addColorStop(1, "#0a0a2a");
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // 2. Sterne zeichnen
        ctx.fillStyle = "white";
        this.stars.forEach(star => {
            ctx.globalAlpha = star.size / 2;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        ctx.globalAlpha = 1.0;

        // 3. Planeten zeichnen (Nur wenn welche in der Liste sind)
        this.planets.forEach(p => {
            ctx.save();
            const gradient = ctx.createRadialGradient(p.x - p.radius / 3, p.y - p.radius / 3, p.radius / 10, p.x, p.y, p.radius);
            gradient.addColorStop(0, p.color2);
            gradient.addColorStop(1, p.color1);
            ctx.fillStyle = gradient;
            ctx.shadowBlur = 30;
            ctx.shadowColor = p.color1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}