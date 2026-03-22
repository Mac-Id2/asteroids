export class SoundManager {
    constructor() {
        this.sounds = {
            fire:       this._load('fire.mp3'),
            thrust:     this._load('thrust.mp3'),
            bangSmall:  this._load('bangSmall.mp3'),
            bangMedium: this._load('bangMedium.mp3'),
            bangLarge:  this._load('bangLarge.mp3'),
            damage:     this._load('damage.mp3'),
            gameover:   this._load('gameover.mp3'),
        };
        this.sounds.thrust.loop = true;
    }

    _load(filename) {
        const url = new URL(`../../assets/sounds/${filename}`, import.meta.url).href;
        const audio = new Audio(url);
        audio.preload = 'auto';
        return audio;
    }

    play(name) {
        const sound = this.sounds[name];
        if (!sound) return;
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    playLoop(name) {
        const sound = this.sounds[name];
        if (!sound || !sound.paused) return;
        sound.play().catch(() => {});
    }

    stopLoop(name) {
        const sound = this.sounds[name];
        if (!sound) return;
        sound.pause();
        sound.currentTime = 0;
    }
}
