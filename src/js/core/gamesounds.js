export class AudioManager {
    constructor() {
        this.sounds = {
            fire: new Audio('./src/assets/sounds/fire.mp3'),
            thrust: new Audio('./src/assets/sounds/thurst.mp3'),
            explSmall: new Audio('./src/assets/sounds/bangSmall.mp3'),
            explMedium: new Audio('./src/assets/sounds/bangMedium.mp3'),
            explLarge: new Audio('./src/assets/sounds/bangLarge.mp3')
        };

        // Thrust soll loopen
        this.sounds.thrust.loop = true;
        this.sounds.thrust.volume = 0.5;
    }

    play(name) {
        const sound = this.sounds[name];
        if (!sound) return;

        // Für kurze Sounds (Schuss/Explosion): Überlappen erlauben
        if (name !== 'thrust') {
            const click = sound.cloneNode();
            click.play();
        } else if (sound.paused) {
            sound.play();
        }
    }

    stop(name) {
        const sound = this.sounds[name];
        if (sound && name === 'thrust') {
            sound.pause();
            sound.currentTime = 0;
        }
    }
}