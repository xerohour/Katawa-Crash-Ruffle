// ponytail: game.js - ActionScript 3.0 complete port engine for Katawa Crash V1.

class AssetManager {
    constructor() {
        this.images = {};
        this.loaded = 0;
        this.total = 0;
    }

    loadImage(key, src) {
        this.total++;
        const img = new Image();
        img.src = src;
        img.onload = () => { this.loaded++; };
        img.onerror = () => { this.loaded++; console.warn('Failed to load image:', src); };
        this.images[key] = img;
    }

    loadAll() {
        const imgMap = {
            hisao: 'assets/images/hisao.png',
            emi: 'assets/images/emi.png',
            rin: 'assets/images/rin.png',
            lilly: 'assets/images/lilly.png',
            hanako: 'assets/images/hanako.png',
            shizune: 'assets/images/shizune.png',
            misha: 'assets/images/misha.png',
            mutou: 'assets/images/mutou.png',
            nurse: 'assets/images/nurse.png',
            kenji: 'assets/images/kenji.png',
            akira: 'assets/images/akira.png',
            kubo: 'assets/images/kubo.png',
            chiharu: 'assets/images/chiharu.png',
            natsume: 'assets/images/natsume.png',
            sharktopus1: 'assets/images/sharktopus1.png',
            shoryuken1: 'assets/images/shoryuken1.png',
            shoryuken2: 'assets/images/shoryuken2.png',
            shoryuken3: 'assets/images/shoryuken3.png',
            aed_zap: 'assets/images/aed_zap.png',
            misha_drill1: 'assets/images/misha_drill1.png',
            misha_drill2: 'assets/images/misha_drill2.png',
            starting_bg: 'assets/images/starting_bg.jpg',
            field_bg1: 'assets/images/field_bg1.png',
            field_bg2: 'assets/images/field_bg2.png',
            field_bg3: 'assets/images/field_bg3.png',
            skyline1: 'assets/images/skyline1.png',
            skyline2: 'assets/images/skyline2.png',
            cloud1: 'assets/images/cloud1.png',
            cloud2: 'assets/images/cloud2.png',
            grass_tile: 'assets/images/grass_tile.png',
            sky_bg: 'assets/images/sky_bg.jpg',
            planet_earth: 'assets/images/planet_earth.png',
            big_earth: 'assets/images/big_earth.png',
            starfield: 'assets/images/starfield.png',
            help_bg: 'assets/images/help_bg.jpg',
            arrow1: 'assets/images/arrow1.png',
            arrow2: 'assets/images/arrow2.png',
            logo: 'assets/images/logo.png',
            snow_bg: 'assets/images/snow_bg.jpg'
        };

        for (const [key, src] of Object.entries(imgMap)) {
            this.loadImage(key, src);
        }
    }

    getImage(key) {
        return this.images[key] && this.images[key].complete ? this.images[key] : null;
    }
}

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.sfxEnabled = true;
        this.bgmEnabled = true;
        this.audioCache = {};
        this.bgm = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playSoundFile(filename, fallbackFreq = 440) {
        if (!this.sfxEnabled) return;
        try {
            if (!this.audioCache[filename]) {
                this.audioCache[filename] = new Audio(`assets/audio/${filename}`);
            }
            const sound = this.audioCache[filename].cloneNode();
            sound.volume = 0.75;
            sound.play().catch(() => this.synthHit(fallbackFreq));
        } catch (e) {
            this.synthHit(fallbackFreq);
        }
    }

    playLaunch() { this.playSoundFile('11_takeride.mp3', 300); }
    playBounce() { this.playSoundFile('65_floorbump.mp3', 180); }
    playHit(type) {
        const soundMap = {
            emi: '57_shoryuk.mp3',
            rin: '26_combofx.mp3',
            hanako: '10_explosion1.mp3',
            misha: '12_mishacresc.mp3',
            kenji: '16_stompsound.mp3',
            mutou: '16_stompsound.mp3',
            nurse: '25_shorthit1.mp3',
            yuuko: '62_yuukobump.mp3',
            akira: '63_punch.mp3',
            chiharu: '28_chiharuscream.mp3',
            fire: '38_onfirefx.mp3',
            aed: '38_onfirefx.mp3',
            stuka: '24_stukafx.mp3',
            cameo: '28_chiharuscream.mp3'
        };
        this.playSoundFile(soundMap[type] || '25_shorthit1.mp3', 440);
    }
    playAch() { this.playSoundFile('35_goldbgm.mp3', 880); }

    playBGM() {
        if (!this.bgmEnabled) return;
        try {
            if (!this.bgm) {
                this.bgm = new Audio('assets/audio/59_rumbabg.mp3');
                this.bgm.loop = true;
                this.bgm.volume = 0.5;
            }
            this.bgm.play().catch(() => {});
        } catch (e) {}
    }

    stopBGM() { if (this.bgm) this.bgm.pause(); }

    toggleBGM() {
        this.bgmEnabled = !this.bgmEnabled;
        if (!this.bgmEnabled) this.stopBGM();
        else this.playBGM();
        return this.bgmEnabled;
    }

    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }

    synthHit(freq = 440) {
        if (!this.sfxEnabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.8, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.2);
    }
}

const assets = new AssetManager();
assets.loadAll();
const audio = new SoundEngine();

const STATE_MENU = 'MENU';
const STATE_ANGLE = 'ANGLE';
const STATE_POWER = 'POWER';
const STATE_FLIGHT = 'FLIGHT';
const STATE_GAMEOVER = 'GAMEOVER';

class KatawaCrashEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = STATE_MENU;

        this.gravity = 0.38;
        this.airDrag = 0.9935;
        this.bounceFriction = 0.78;
        this.minBounceVel = 2.0;

        this.angle = 45;
        this.angleDir = 1;
        this.power = 50;
        this.powerDir = 1;

        this.hisao = { x: 80, y: 320, vx: 0, vy: 0, rot: 0, rotVel: 0, radius: 20 };
        this.cameraX = 0;
        this.cameraY = 0;
        this.targetCameraX = 0;
        this.targetCameraY = 0;

        this.distance = 0;
        this.maxAltitude = 0;
        this.topSpeed = 0;
        this.combos = 0;
        this.comboMultiplier = 1;
        this.aedCharge = 0;
        this.mishaBoosts = 3;

        this.fireStatus = false;
        this.fireTimer = 0;
        this.lastHitKey = null;
        this.consecutiveHits = 0;
        this.extraLife = false;

        this.maxSpawnedX = 120;
        this.characters = [];

        this.particles = [];
        this.popups = [];
        this.screenShake = 0;
        this.effects = [];

        this.bestRecord = parseFloat(localStorage.getItem('kc_best') || 0);
        this.unlockedAch = JSON.parse(localStorage.getItem('kc_ach') || '[]');

        this.initDOM();
        this.updateAchUI();
        this.updateMenuOverlayState();
        requestAnimationFrame(() => this.loop());
    }

    initDOM() {
        document.getElementById('hud-best').textContent = `${this.bestRecord.toFixed(2)} m`;
        
        const mainBtn = document.getElementById('btn-main-action');
        const resetBtn = document.getElementById('btn-reset');
        const aedBtn = document.getElementById('aed-trigger-btn');
        const sndBtn = document.getElementById('btn-sound-toggle');

        const handleAction = () => {
            audio.init();
            audio.playBGM();
            if (this.state === STATE_MENU || this.state === STATE_GAMEOVER) {
                this.startAnglePhase();
            } else if (this.state === STATE_ANGLE) {
                this.state = STATE_POWER;
                audio.playBounce();
            } else if (this.state === STATE_POWER) {
                this.launch();
            } else if (this.state === STATE_FLIGHT) {
                if (this.aedCharge >= 100) {
                    this.triggerAED();
                } else if (this.hisao.vy > 0 && this.mishaBoosts > 0) {
                    this.triggerMishaBoost();
                }
            }
        };

        mainBtn.addEventListener('click', handleAction);
        aedBtn.addEventListener('click', () => {
            audio.init();
            if (this.state === STATE_FLIGHT && this.aedCharge >= 100) this.triggerAED();
        });
        resetBtn.addEventListener('click', () => this.resetMenu());

        sndBtn.addEventListener('click', () => {
            audio.enabled = !audio.enabled;
            sndBtn.textContent = audio.enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
            const sfxEl = document.getElementById('menu-sfx');
            if (sfxEl) sfxEl.textContent = audio.enabled ? 'Sfx: ON' : 'Sfx: OFF';
        });

        document.getElementById('menu-start').addEventListener('click', () => handleAction());
        document.getElementById('menu-how').addEventListener('click', () => {
            document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
        });
        document.getElementById('menu-ach').addEventListener('click', () => {
            document.getElementById('ach-container').scrollIntoView({ behavior: 'smooth' });
        });
        document.getElementById('menu-dev').addEventListener('click', () => {
            window.open('https://github.com/xerohour/Katawa-Crash-Ruffle', '_blank');
        });
        document.getElementById('menu-bgm').addEventListener('click', (e) => {
            audio.init();
            const active = audio.toggleBGM();
            e.target.textContent = active ? 'Bgm: ON' : 'Bgm: OFF';
        });
        document.getElementById('menu-sfx').addEventListener('click', (e) => {
            audio.init();
            const active = audio.toggleSFX();
            e.target.textContent = active ? 'Sfx: ON' : 'Sfx: OFF';
            sndBtn.textContent = active ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        });
        document.getElementById('menu-url').addEventListener('click', () => {
            window.open('http://www.katawa-shoujo.com', '_blank');
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.state === STATE_GAMEOVER) {
                const rect = this.canvas.getBoundingClientRect();
                const mx = (e.clientX - rect.left) * (700 / rect.width);
                const my = (e.clientY - rect.top) * (400 / rect.height);
                if (mx >= 220 && mx <= 480 && my >= 275 && my <= 325) {
                    this.resetMenu();
                }
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleAction();
            }
        });
    }

    updateMenuOverlayState() {
        const overlay = document.getElementById('menu-overlay');
        if (overlay) {
            overlay.style.display = (this.state === STATE_MENU) ? 'flex' : 'none';
        }
    }

    startAnglePhase() {
        this.state = STATE_ANGLE;
        this.angle = 45;
        this.power = 50;
        document.getElementById('btn-main-action').textContent = '🎯 Lock Angle';
        const hudEl = document.getElementById('hud-overlay');
        if (hudEl) hudEl.style.display = 'none';
        this.updateMenuOverlayState();
    }

    launch() {
        this.state = STATE_FLIGHT;
        document.getElementById('btn-main-action').textContent = '⚡ In Flight...';
        const hudEl = document.getElementById('hud-overlay');
        if (hudEl) hudEl.style.display = 'none';
        this.updateMenuOverlayState();

        const rad = (this.angle * Math.PI) / 180;
        let speed = 13 + (this.power / 100) * 30;

        if (Math.abs(this.angle - 45) <= 3 && this.power >= 95) {
            speed *= 1.28;
            this.addPopup('🔥 PERFECT SKILL SHOT BOOST!', '#f7b731');
            this.screenShake = 12;
        }

        this.hisao.vx = Math.cos(rad) * speed;
        this.hisao.vy = -Math.sin(rad) * speed;
        this.hisao.x = 80;
        this.hisao.y = 320;
        this.hisao.rot = -rad;
        this.hisao.rotVel = 0.09;

        this.cameraX = 0;
        this.cameraY = 0;
        this.targetCameraX = 0;
        this.targetCameraY = 0;

        this.distance = 0;
        this.maxAltitude = 0;
        this.topSpeed = speed;
        this.combos = 0;
        this.comboMultiplier = 1;
        this.aedCharge = 20;
        this.mishaBoosts = 3;

        this.fireStatus = false;
        this.fireTimer = 0;
        this.lastHitKey = null;
        this.consecutiveHits = 0;
        this.extraLife = false;

        this.maxSpawnedX = 120;
        this.characters = [];
        this.generateBoostsUpTo(2500);

        audio.playLaunch();
        this.unlockAch('ach-1');
    }

    generateBoostsUpTo(targetX) {
        const launcherPool = [
            { name: 'Emi', key: 'emi', title: 'SHORYUKEN BOOST!', color: '#ff6b6b' },
            { name: 'Rin', key: 'rin', title: 'ART MULTIPLIER BOOST!', color: '#48dbfb' },
            { name: 'Lilly', key: 'lilly', title: 'HIGH ARC FLOAT!', color: '#feca57' }
        ];

        const midPool = [
            { name: 'Hanako', key: 'hanako', title: 'PANIC EXPLOSION!', color: '#ff9ff3' },
            { name: 'Shizune', key: 'shizune', title: 'STUDENT COUNCIL GET!', color: '#1dd1a1' },
            { name: 'Misha', key: 'misha', title: 'WAHAHA DRILL BOOST!', color: '#ff6b81' },
            { name: 'Mutou', key: 'mutou', title: 'HOMEWORK FLIP!', color: '#a55eea' },
            { name: 'Nurse', key: 'nurse', title: 'STRAIGHTEN UP AED!', color: '#2ed573' },
            { name: 'Kenji', key: 'kenji', title: 'CONSPIRACY CATAPULT!', color: '#fa8231' }
        ];

        const cameoPool = [
            { name: 'Akira', key: 'akira', title: 'SUPER BOOST!!!', color: '#fd9644' },
            { name: 'Chiharu', key: 'chiharu', title: 'SCREAMING SPEED BOOST!', color: '#eb4d4b' },
            { name: 'Kubo', key: 'kubo', title: 'KUBO MEGA BOUNCE!', color: '#6ab04c' },
            { name: 'Natsume', key: 'natsume', title: 'DO NOT WANT CHARGE!', color: '#be2edd' },
            { name: 'Sharktopus', key: 'sharktopus1', title: 'CTHULHU APOCALYPSE!', color: '#22a6b3' }
        ];

        while (this.maxSpawnedX < targetX) {
            const step = 85 + Math.random() * 130;
            this.maxSpawnedX += step;

            let pool = midPool;
            if (this.maxSpawnedX < 600) pool = launcherPool;
            else if (Math.random() < 0.32) pool = cameoPool;

            const c = pool[Math.floor(Math.random() * pool.length)];
            this.characters.push({
                x: this.maxSpawnedX, y: 320,
                radius: 22,
                key: c.key,
                name: c.name,
                title: c.title,
                color: c.color,
                hit: false
            });
        }
    }

    triggerAED() {
        if (this.aedCharge < 100) return;
        this.aedCharge = 0;
        this.hisao.vx += 18;
        this.hisao.vy = 20;
        this.hisao.rotVel += 0.4;
        audio.playHit('aed');

        this.screenShake = 10;
        this.addPopup('⚡ DEFIBRILLATOR SHOCK!', '#00d2d3');
        this.addParticles(this.hisao.x, this.hisao.y, '#00d2d3', 30);
        this.effects.push({ type: 'aed_zap', x: this.hisao.x, y: this.hisao.y, life: 18 });
        this.unlockAch('ach-3');
    }

    triggerMishaBoost() {
        if (this.mishaBoosts <= 0) return;
        this.mishaBoosts--;
        this.hisao.vx += 14;
        this.hisao.vy = -18;
        audio.playHit('misha');

        this.addPopup('🎀 MISHA MID-AIR BOOST!', '#ff6b81');
        this.addParticles(this.hisao.x, this.hisao.y, '#ff6b81', 20);
        this.effects.push({ type: 'misha_drill', x: this.hisao.x, y: this.hisao.y, frame: 0, life: 15 });
    }

    triggerRevival() {
        if (!this.extraLife) return;
        this.extraLife = false;
        this.hisao.vy = -24;
        this.hisao.vx += 18;
        audio.playHit('emi');
        this.addPopup('💖 EXTRA LIFE REVIVAL RELAUNCH!', '#ff758c');
        this.addParticles(this.hisao.x, 320, '#ff758c', 35);
        this.screenShake = 12;
    }

    updateAchUI() {
        this.unlockedAch.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('unlocked');
        });
    }

    unlockAch(id) {
        if (!this.unlockedAch.includes(id)) {
            this.unlockedAch.push(id);
            localStorage.setItem('kc_ach', JSON.stringify(this.unlockedAch));
            this.updateAchUI();
            audio.playAch();
        }
    }

    resetMenu() {
        this.state = STATE_MENU;
        document.getElementById('btn-main-action').textContent = '🚀 Launch Game';
        const hudEl = document.getElementById('hud-overlay');
        if (hudEl) hudEl.style.display = 'none';
        this.updateMenuOverlayState();
    }

    update() {
        if (this.state === STATE_ANGLE) {
            this.angle += this.angleDir * 1.9;
            if (this.angle >= 80) { this.angle = 80; this.angleDir = -1; }
            if (this.angle <= 10) { this.angle = 10; this.angleDir = 1; }
        } else if (this.state === STATE_POWER) {
            this.power += this.powerDir * 2.6;
            if (this.power >= 100) { this.power = 100; this.powerDir = -1; }
            if (this.power <= 5) { this.power = 5; this.powerDir = 1; }
        } else if (this.state === STATE_FLIGHT) {
            this.hisao.vy += this.gravity;
            this.hisao.vx *= this.airDrag;
            this.hisao.vy *= this.airDrag;

            if (this.fireStatus) {
                this.hisao.vx *= 1.002;
                this.fireTimer--;
                if (this.fireTimer <= 0) {
                    this.fireStatus = false;
                }
            }

            this.hisao.x += this.hisao.vx;
            this.hisao.y += this.hisao.vy;
            this.hisao.rot += this.hisao.rotVel;

            this.generateBoostsUpTo(this.hisao.x + 2000);

            this.distance = Math.max(0, (this.hisao.x - 80) / 10);
            const currentAlt = (320 - this.hisao.y) / 10;
            if (currentAlt > this.maxAltitude) this.maxAltitude = currentAlt;

            const curSpeed = Math.sqrt(this.hisao.vx ** 2 + this.hisao.vy ** 2) * 3.6;
            if (curSpeed > this.topSpeed) this.topSpeed = curSpeed;

            this.targetCameraX = Math.max(0, this.hisao.x - 200);
            this.targetCameraY = Math.min(0, (this.hisao.y - 200) * 0.4);
            this.cameraX += (this.targetCameraX - this.cameraX) * 0.16;
            this.cameraY += (this.targetCameraY - this.cameraY) * 0.16;

            if (this.aedCharge < 100) {
                this.aedCharge = Math.min(100, this.aedCharge + 0.28);
            }

            if (curSpeed > 45 || this.fireStatus) {
                this.particles.push({
                    x: this.hisao.x - this.hisao.vx * 1.5,
                    y: this.hisao.y - this.hisao.vy * 1.5,
                    vx: (Math.random() - 0.5) * 2 - this.hisao.vx * 0.3,
                    vy: (Math.random() - 0.5) * 2 - this.hisao.vy * 0.3,
                    color: this.fireStatus ? '#ff4757' : curSpeed > 75 ? '#ff7675' : '#74b9ff',
                    alpha: 0.85,
                    size: 2 + Math.random() * 4
                });
            }

            const groundY = 320;
            if (this.hisao.y >= groundY) {
                this.hisao.y = groundY;
                if (Math.abs(this.hisao.vy) > this.minBounceVel) {
                    this.hisao.vy = -this.hisao.vy * (this.fireStatus ? 0.86 : this.bounceFriction);
                    this.hisao.vx *= 0.90;
                    this.comboMultiplier = 1;
                    audio.playBounce();
                    this.addParticles(this.hisao.x, groundY, '#f7b731', 12);
                    this.screenShake = 4;
                } else {
                    this.hisao.vy = 0;
                    this.hisao.vx *= 0.84;

                    if (this.extraLife && Math.abs(this.hisao.vx) < 2.0) {
                        this.triggerRevival();
                    } else if (Math.abs(this.hisao.vx) < 0.2) {
                        this.endGame();
                    }
                }
            }

            this.characters.forEach(char => {
                if (!char.hit) {
                    const dx = this.hisao.x - char.x;
                    const dy = this.hisao.y - (char.y - 20);
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < this.hisao.radius + char.radius) {
                        char.hit = true;
                        this.combos++;
                        this.comboMultiplier++;
                        this.aedCharge = Math.min(100, this.aedCharge + 35);
                        audio.playHit(char.key);
                        this.screenShake = 8;

                        if (this.lastHitKey === char.key) {
                            this.consecutiveHits++;
                            if (this.consecutiveHits >= 3 && !this.fireStatus) {
                                this.fireStatus = true;
                                this.fireTimer = 450;
                                audio.playHit('fire');
                                this.addPopup('🔥 ON FIRE MODE ACTIVATED!', '#ff4757');
                            }
                        } else {
                            this.lastHitKey = char.key;
                            this.consecutiveHits = 1;
                        }

                        const mult = 1 + (this.comboMultiplier - 1) * 0.22;

                        if (char.key === 'emi') {
                            this.hisao.vx += 15 * mult; this.hisao.vy = -22 * mult;
                            this.effects.push({ type: 'shoryuken', x: char.x, y: char.y, frame: 0, life: 25 });
                            this.unlockAch('ach-4');
                        } else if (char.key === 'rin') {
                            this.hisao.vx += 24 * mult; this.hisao.vy = -10 * mult;
                            this.extraLife = true;
                            this.unlockAch('ach-5');
                        } else if (char.key === 'lilly') {
                            this.hisao.vx += 12 * mult; this.hisao.vy = -27 * mult;
                        } else if (char.key === 'hanako') {
                            this.hisao.vx += 20 * mult; this.hisao.vy = -16 * mult;
                        } else if (char.key === 'shizune') {
                            const curAngle = Math.atan2(-this.hisao.vy, this.hisao.vx);
                            const newAngle = (Math.PI / 2) - curAngle;
                            const speed = Math.sqrt(this.hisao.vx ** 2 + this.hisao.vy ** 2) * 1.1;
                            this.hisao.vx = Math.cos(newAngle) * speed;
                            this.hisao.vy = -Math.sin(newAngle) * speed;
                        } else if (char.key === 'misha') {
                            this.mishaBoosts = Math.min(5, this.mishaBoosts + 2);
                            this.hisao.vx += 16 * mult; this.hisao.vy = -16 * mult;
                        } else if (char.key === 'nurse') {
                            this.aedCharge = 100;
                            this.hisao.vx += 15 * mult; this.hisao.vy = -14 * mult;
                        } else if (char.key === 'chiharu' || char.key === 'sharktopus1' || char.key === 'kubo') {
                            this.hisao.vx += 28 * mult; this.hisao.vy = -24 * mult;
                            this.screenShake = 14;
                        } else {
                            this.hisao.vx += 14 * mult; this.hisao.vy = -14 * mult;
                        }

                        this.addPopup(`${char.name}: ${char.title} (${this.comboMultiplier}x)`, char.color);
                        this.addParticles(char.x, char.y, char.color, 28);
                    }
                }
            });

            if (this.distance > 500) this.unlockAch('ach-2');
            if (this.distance > 1000) this.unlockAch('ach-6');
        }

        if (this.screenShake > 0) this.screenShake *= 0.85;

        this.effects.forEach(e => e.life--);
        this.effects = this.effects.filter(e => e.life > 0);

        this.particles.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.alpha -= 0.022;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);

        this.popups.forEach(p => {
            p.y -= 0.95; p.alpha -= 0.014;
        });
        this.popups = this.popups.filter(p => p.alpha > 0);
    }

    endGame() {
        this.state = STATE_GAMEOVER;
        document.getElementById('btn-main-action').textContent = '🔁 Play Again';
        this.updateMenuOverlayState();

        if (this.distance > this.bestRecord) {
            this.bestRecord = this.distance;
            localStorage.setItem('kc_best', this.bestRecord.toString());
            document.getElementById('hud-best').textContent = `${this.bestRecord.toFixed(2)} m`;
            this.addPopup('🎉 NEW HIGH SCORE RECORD!', '#20bf6b');
        }
    }

    addParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 1.5 + Math.random() * 7.5;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                color, alpha: 1, size: 2.5 + Math.random() * 4.5
            });
        }
    }

    addPopup(text, color) {
        this.popups.push({
            text, color,
            x: this.hisao.x,
            y: this.hisao.y - 40,
            alpha: 1
        });
    }

    draw() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, 700, 400);

        const camOffsetY = this.cameraY;
        if (this.screenShake > 0.5) {
            const sx = (Math.random() - 0.5) * this.screenShake;
            const sy = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(sx, sy);
        }

        const altitude = Math.max(0, (320 - this.hisao.y) / 10);
        const skyBg = assets.getImage('sky_bg');
        const starfieldBg = assets.getImage('starfield');
        const bigEarthBg = assets.getImage('big_earth');
        const planetEarthBg = assets.getImage('planet_earth');
        const fBg1 = assets.getImage('field_bg1');
        const fBg2 = assets.getImage('field_bg2');
        const fBg3 = assets.getImage('field_bg3');
        const cloud1 = assets.getImage('cloud1');
        const cloud2 = assets.getImage('cloud2');

        if (altitude > 250 && starfieldBg) {
            this.ctx.drawImage(starfieldBg, 0, 0, 700, 400);
            if (bigEarthBg) {
                this.ctx.drawImage(bigEarthBg, 440 - (this.cameraX * 0.02) % 400, 40 - camOffsetY * 0.2, 220, 220);
            }
        } else {
            if (skyBg) {
                this.ctx.drawImage(skyBg, 0, 0 - camOffsetY * 0.3, 700, 340);
            } else {
                const skyGrad = this.ctx.createLinearGradient(0, 0, 0, 320);
                skyGrad.addColorStop(0, '#1da1f2');
                skyGrad.addColorStop(1, '#44bbff');
                this.ctx.fillStyle = skyGrad;
                this.ctx.fillRect(0, 0, 700, 320);
            }

            if (fBg1 && fBg2 && fBg3) {
                const hillWidth = 691;
                const scrollX = (this.cameraX * 0.65);
                const startIndex = Math.floor(scrollX / hillWidth);
                const endIndex = startIndex + 2;
                for (let i = startIndex; i <= endIndex; i++) {
                    const hillImg = (i % 3 === 0) ? fBg1 : (i % 3 === 1) ? fBg2 : fBg3;
                    const hx = i * hillWidth - scrollX;
                    this.ctx.drawImage(hillImg, hx, 185 - camOffsetY * 0.5);
                }
            }

            if (cloud1) {
                const c1X = 600 - (this.cameraX * 0.15) % 900;
                this.ctx.drawImage(cloud1, c1X, 40 - camOffsetY * 0.2);
            }
            if (cloud2) {
                const c2X = 300 - (this.cameraX * 0.2) % 800;
                this.ctx.drawImage(cloud2, c2X, 80 - camOffsetY * 0.25);
            }

            if (altitude > 90 && planetEarthBg) {
                this.ctx.drawImage(planetEarthBg, 510 - (this.cameraX * 0.03) % 400, 30 - camOffsetY * 0.25, 150, 150);
            }
        }

        const skyline1 = assets.getImage('skyline1');
        const skyline2 = assets.getImage('skyline2');

        if (skyline2) {
            const s2X = (this.cameraX * 0.25) % skyline2.width;
            for (let x = -s2X; x < 700; x += skyline2.width) {
                this.ctx.drawImage(skyline2, x, 175 - camOffsetY * 0.3);
            }
        }

        if (skyline1) {
            const s1X = (this.cameraX * 0.45) % skyline1.width;
            for (let x = -s1X; x < 700; x += skyline1.width) {
                this.ctx.drawImage(skyline1, x, 190 - camOffsetY * 0.35);
            }
        }

        const startBg = assets.getImage('starting_bg');
        if (startBg && this.cameraX < 700) {
            this.ctx.drawImage(startBg, -this.cameraX, 185 - camOffsetY);
        }

        const grassTile = assets.getImage('grass_tile');
        const groundY = 320 - camOffsetY;
        if (grassTile) {
            const gX = (this.cameraX) % grassTile.width;
            for (let x = -gX; x < 700; x += grassTile.width) {
                this.ctx.drawImage(grassTile, x, groundY);
            }
        } else {
            this.ctx.fillStyle = '#20bf6b';
            this.ctx.fillRect(0, groundY, 700, 12);
            this.ctx.fillStyle = '#3a2e2b';
            this.ctx.fillRect(0, groundY + 12, 700, 68);
        }

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        this.ctx.font = 'bold 11px "JetBrains Mono"';
        for (let m = 0; m < 50000; m += 100) {
            const screenX = (m * 10 + 80) - this.cameraX;
            if (screenX >= -50 && screenX <= 750) {
                this.ctx.fillRect(screenX, groundY, 2, 8);
                if (m % 500 === 0) {
                    this.ctx.fillText(`${m}m`, screenX - 12, groundY + 24);
                }
            }
        }

        if (this.state === STATE_FLIGHT || this.state === STATE_GAMEOVER) {
            this.characters.forEach(char => {
                const cx = char.x - this.cameraX;
                if (cx >= -50 && cx <= 750) {
                    const charImg = assets.getImage(char.key);
                    if (charImg) {
                        const dw = charImg.width * 0.75;
                        const dh = charImg.height * 0.75;
                        const cy = groundY - dh + 2;
                        if (char.hit) this.ctx.globalAlpha = 0.45;
                        this.ctx.drawImage(charImg, cx - dw / 2, cy, dw, dh);
                        this.ctx.globalAlpha = 1.0;
                    } else {
                        this.ctx.fillStyle = char.hit ? '#8e94a5' : char.color;
                        this.ctx.beginPath();
                        this.ctx.arc(cx, groundY - 15, char.radius, 0, Math.PI * 2);
                        this.ctx.fill();
                    }

                    // Characters rendered natively on ground matching Flash
                }
            });
        }

        this.effects.forEach(eff => {
            const ex = eff.x - this.cameraX;
            const ey = eff.y - camOffsetY;
            if (eff.type === 'shoryuken') {
                const sImg = assets.getImage('shoryuken1');
                if (sImg) this.ctx.drawImage(sImg, ex - sImg.width / 2, ey - sImg.height);
            } else if (eff.type === 'aed_zap') {
                const zImg = assets.getImage('aed_zap');
                if (zImg) this.ctx.drawImage(zImg, ex - zImg.width / 2, ey - zImg.height / 2);
            } else if (eff.type === 'misha_drill') {
                const dImg = assets.getImage('misha_drill1');
                if (dImg) this.ctx.drawImage(dImg, ex - dImg.width / 2, ey - dImg.height / 2);
            }
        });

        const hScreenX = this.hisao.x - this.cameraX;
        const hScreenY = this.hisao.y - camOffsetY;
        const hisaoImg = assets.getImage('hisao');

        if (this.extraLife) {
            this.ctx.strokeStyle = '#ff758c';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(hScreenX, hScreenY, 26 + Math.sin(Date.now() * 0.01) * 4, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        const shadowScale = Math.max(0.2, 1 - (320 - this.hisao.y) / 320);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
        this.ctx.beginPath();
        this.ctx.ellipse(hScreenX, groundY + 2, 20 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.save();
        this.ctx.translate(hScreenX, hScreenY);
        this.ctx.rotate(this.hisao.rot);

        if (hisaoImg) {
            const hw = hisaoImg.width * 0.75;
            const hh = hisaoImg.height * 0.75;
            this.ctx.drawImage(hisaoImg, -hw / 2, -hh / 2, hw, hh);
        } else {
            this.ctx.fillStyle = '#f7b731';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.hisao.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();

        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x - this.cameraX, p.y - camOffsetY, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;

        this.popups.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.font = '800 14px "Outfit"';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            this.ctx.shadowBlur = 4;
            this.ctx.fillText(p.text, p.x - this.cameraX, p.y - camOffsetY);
            this.ctx.shadowBlur = 0;
        });
        this.ctx.globalAlpha = 1.0;

        if (this.state === STATE_ANGLE || this.state === STATE_POWER) {
            const lx = 80 - this.cameraX;
            const ly = groundY - 10;

            const arrowImg = assets.getImage('arrow1');
            const rad = (this.angle * Math.PI) / 180;
            this.ctx.save();
            this.ctx.translate(lx, ly);
            this.ctx.rotate(-rad);
            if (arrowImg) {
                this.ctx.drawImage(arrowImg, 0, -arrowImg.height / 2, 65, arrowImg.height * 1.2);
            } else {
                this.ctx.strokeStyle = '#e94560';
                this.ctx.lineWidth = 6;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(65, 0);
                this.ctx.stroke();
            }
            this.ctx.restore();

            // Notebook paper entries in CatholicSchoolGirls BB font
            this.ctx.fillStyle = '#3b0906';
            this.ctx.font = '700 24px "CatholicSchoolGirls BB", sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`${Math.floor(this.angle)}°`, 215 - this.cameraX, 246);

            if (this.state === STATE_POWER) {
                this.ctx.fillText(`${Math.floor(this.power)}%`, 515 - this.cameraX, 246);

                // Animated Power Gauge Bar
                this.ctx.fillStyle = 'rgba(0,0,0,0.75)';
                this.ctx.fillRect(450 - this.cameraX, 215, 120, 14);
                this.ctx.fillStyle = '#e94560';
                this.ctx.fillRect(452 - this.cameraX, 217, (this.power / 100) * 116, 10);
            }
        }

        // -------------------------------------------------------------
        // AUTHENTIC FLASH IN-GAME FLIGHT HUD (1:1 matching Flash SWF)
        // -------------------------------------------------------------
        if (this.state === STATE_FLIGHT) {
            const curSpeed = Math.sqrt(this.hisao.vx ** 2 + this.hisao.vy ** 2) * 3.6;

            // 1. TOP-LEFT: Misha Boost & AED Charge Counters
            const mishaImg = assets.getImage('misha');
            if (mishaImg) {
                this.ctx.drawImage(mishaImg, 8, 8, 24, 24);
            }
            this.ctx.fillStyle = '#ff00ff';
            this.ctx.font = '700 20px "Impact", "Outfit", sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`x${this.mishaBoosts}`, 36, 26);

            // AED Icon + %
            this.ctx.fillStyle = '#00b894';
            this.ctx.fillRect(8, 36, 24, 24);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '700 14px sans-serif';
            this.ctx.fillText('⚡', 12, 53);

            const aedPct = Math.floor(this.aedCharge);
            this.ctx.fillStyle = aedPct >= 100 ? '#00ff00' : '#00ff00';
            this.ctx.font = '700 20px "Impact", "Outfit", sans-serif';
            this.ctx.fillText(`${aedPct}%`, 40, 56);

            // 2. PLAYER HISAO RED ARROW & ALTITUDE METER
            if (altitude > 0.5) {
                const arrowX = hScreenX;
                const arrowY = hScreenY - 50;

                this.ctx.save();
                this.ctx.fillStyle = '#ff0000';
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 3;

                this.ctx.beginPath();
                this.ctx.moveTo(arrowX - 15, arrowY + 40);
                this.ctx.lineTo(arrowX - 15, arrowY);
                this.ctx.lineTo(arrowX - 30, arrowY);
                this.ctx.lineTo(arrowX, arrowY - 35);
                this.ctx.lineTo(arrowX + 30, arrowY);
                this.ctx.lineTo(arrowX + 15, arrowY);
                this.ctx.lineTo(arrowX + 15, arrowY + 40);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();

                this.ctx.fillStyle = '#000000';
                this.ctx.font = '900 12px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('HISAO', arrowX, arrowY - 15);
                this.ctx.restore();

                this.ctx.fillStyle = '#000000';
                this.ctx.font = '700 18px "Outfit", sans-serif';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(`${altitude.toFixed(2)}m`, hScreenX + 35, hScreenY - 10);
            }

            // 3. TOP-RIGHT: Speedometer & SPECIAL Box
            const curSpeedMs = (curSpeed / 3.6).toFixed(2);
            this.ctx.save();
            this.ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
            this.ctx.shadowBlur = 4;
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '700 20px "Outfit", sans-serif';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${curSpeedMs}m/s`, 690, 24);
            this.ctx.restore();

            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(570, 30, 120, 10);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(570 + (this.power / 100) * 116, 28, 4, 14);

            // SPECIAL Box
            const spcX = 560, spcY = 44, spcW = 130;
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(spcX, spcY, spcW, 18);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '700 12px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('SPECIAL', spcX + spcW / 2, spcY + 14);

            const charIconsRow1 = [
                { key: 'shizune', bg: '#0033cc' },
                { key: 'emi', bg: '#cc0000' },
                { key: 'misha', bg: '#996600' },
                { key: 'lilly', bg: '#cc9900' }
            ];
            const charIconsRow2 = [
                { key: 'mutou', bg: '#0033cc' },
                { key: 'hanako', bg: '#660066' },
                { key: 'rin', bg: '#cc0000' }
            ];

            const itemW = 28, itemH = 28;
            charIconsRow1.forEach((c, idx) => {
                const ix = spcX + 5 + idx * (itemW + 3);
                const iy = spcY + 22;
                this.ctx.fillStyle = c.bg;
                this.ctx.fillRect(ix, iy, itemW, itemH);
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(ix, iy, itemW, itemH);
                const cImg = assets.getImage(c.key);
                if (cImg) this.ctx.drawImage(cImg, ix + 2, iy + 2, itemW - 4, itemH - 4);
            });

            charIconsRow2.forEach((c, idx) => {
                const ix = spcX + 20 + idx * (itemW + 3);
                const iy = spcY + 53;
                this.ctx.fillStyle = c.bg;
                this.ctx.fillRect(ix, iy, itemW, itemH);
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(ix, iy, itemW, itemH);
                const cImg = assets.getImage(c.key);
                if (cImg) this.ctx.drawImage(cImg, ix + 2, iy + 2, itemW - 4, itemH - 4);
            });
        }

        if (this.state === STATE_GAMEOVER) {
            // Authentic Flash YAMAKU H.S. BALLISTICS CLUB Summary Modal
            const bx = 100, by = 25, bw = 500, bh = 340;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(bx, by, bw, bh);
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(bx, by, bw, bh);

            // Header Title
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '700 22px "Outfit", sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('YAMAKU H.S. BALLISTICS CLUB', 350, by + 38);

            // Underline
            this.ctx.fillRect(bx + 15, by + 48, bw - 30, 2);

            // Rows
            const rows = [
                { label: 'Total Distance:', mid: 'Maximum', val: (this.distance * 10).toFixed(2) },
                { label: 'Height:', mid: 'Maximum', val: (this.maxAltitude * 10).toFixed(2) },
                { label: 'Speed:', mid: 'Objects', val: (this.topSpeed / 3.6 * 3).toFixed(2) },
                { label: 'Struck:', mid: 'Special', val: `${this.combos}` },
                { label: 'Events:', mid: 'Authentication', val: '0' }
            ];

            rows.forEach((r, idx) => {
                const ry = by + 88 + idx * 30;
                this.ctx.font = '700 16px "Outfit", sans-serif';

                this.ctx.fillStyle = '#000000';
                this.ctx.textAlign = 'right';
                this.ctx.fillText(r.label, 260, ry);

                this.ctx.textAlign = 'left';
                this.ctx.fillText(r.mid, 275, ry);

                this.ctx.fillStyle = '#800000';
                this.ctx.fillText(r.val, 400, ry);
            });

            // Main Menu Button
            const btnX = 220, btnY = by + 248, btnW = 260, btnH = 42;
            const grad = this.ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
            grad.addColorStop(0, '#00e5ff');
            grad.addColorStop(1, '#00b4d8');
            this.ctx.fillStyle = grad;

            this.ctx.beginPath();
            if (this.ctx.roundRect) {
                this.ctx.roundRect(btnX, btnY, btnW, btnH, 12);
            } else {
                this.ctx.rect(btnX, btnY, btnW, btnH);
            }
            this.ctx.fill();
            this.ctx.strokeStyle = '#0088cc';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.fillStyle = '#0000ff';
            this.ctx.font = '700 18px "Outfit", sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Main menu', 350, btnY + 27);
        }

        if (this.state === STATE_MENU) {
            const snowBg = assets.getImage('snow_bg');
            if (snowBg) {
                this.ctx.drawImage(snowBg, 0, 0, 700, 400);
            } else {
                this.ctx.fillStyle = '#eef2f7';
                this.ctx.fillRect(0, 0, 700, 400);
            }

            // Authentic SWF bottom right credits box
            const bx = 550, by = 295, bw = 145, bh = 100;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(bx, by, bw, bh);
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(bx, by, bw, bh);

            this.ctx.fillStyle = '#000000';
            this.ctx.font = '700 8px "Press Start 2P", monospace';
            this.ctx.textAlign = 'left';
            this.ctx.fillText('KATAWA CRASH', bx + 5, by + 12);

            this.ctx.font = '9px sans-serif';
            const lines = [
                'a Flash game by brent',
                'Thx to 4LS, Doomfest,',
                'nicol, SZS, #k-s, DJ',
                'Fresh, and whoever',
                'made Nanaca Crash',
                'twitter: @KatawaCrash'
            ];
            lines.forEach((line, idx) => {
                this.ctx.fillStyle = '#000000';
                this.ctx.fillText(line, bx + 5, by + 24 + idx * 11);
            });

            this.ctx.fillStyle = '#008800';
            this.ctx.fillText('!HaoVsu9Sz6', bx + 5, by + 24 + lines.length * 11);
        }

        this.ctx.restore();
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

window.addEventListener('load', () => {
    window.game = new KatawaCrashEngine();
});
