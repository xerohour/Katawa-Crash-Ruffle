// ponytail: v2_game.js - 1:1 ActionScript 3.0 complete port engine for Katawa Crash V2.
// Standard HTML5 canvas, Web Audio API, LocalStorage persistence, and exact AS3 physics.

class V2AssetManager {
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
            logo: 'assets/images/logo.png'
        };

        for (const [key, src] of Object.entries(imgMap)) {
            this.loadImage(key, src);
        }
    }

    getImage(key) {
        return this.images[key] && this.images[key].complete ? this.images[key] : null;
    }
}

class V2SoundEngine {
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

const v2Assets = new V2AssetManager();
v2Assets.loadAll();
const v2Audio = new V2SoundEngine();

const V2_STATE_MENU = 'MENU';
const V2_STATE_ANGLE = 'ANGLE';
const V2_STATE_POWER = 'POWER';
const V2_STATE_FLIGHT = 'FLIGHT';
const V2_STATE_GAMEOVER = 'GAMEOVER';

class KatawaCrashV2Engine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = V2_STATE_MENU;

        // ActionScript 3.0 Exact Constants
        this.gravity = 0.38;
        this.airDrag = 0.9935;
        this.bounceFriction = 0.78;
        this.minBounceVel = 2.0;

        // Launchers
        this.angle = 45;
        this.angleDir = 1;
        this.power = 50;
        this.powerDir = 1;

        // Player physics
        this.hisao = { x: 80, y: 320, vx: 0, vy: 0, rot: 0, rotVel: 0, radius: 20 };
        this.cameraX = 0;
        this.cameraY = 0;
        this.targetCameraX = 0;
        this.targetCameraY = 0;

        // Stats
        this.distance = 0;
        this.maxAltitude = 0;
        this.topSpeed = 0;
        this.combos = 0;
        this.comboMultiplier = 1;
        this.aedCharge = 0;
        this.mishaBoosts = 3;
        this.yuukoCharges = 0;

        // Flags & AS3 State
        this.fireStatus = false;
        this.fireTimer = 0;
        this.lastHitKey = null;
        this.consecutiveHits = 0;
        this.extraLife = false;
        this.kuboStatus = false;

        // Procedural generator
        this.maxSpawnedX = 120;
        this.characters = [];

        // Particles & Visuals
        this.particles = [];
        this.popups = [];
        this.screenShake = 0;
        this.effects = [];

        // Storage
        this.bestRecord = parseFloat(localStorage.getItem('kc_v2_best') || 0);
        this.unlockedAch = JSON.parse(localStorage.getItem('kc_v2_ach') || '[]');

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
            v2Audio.init();
            v2Audio.playBGM();
            if (this.state === V2_STATE_MENU || this.state === V2_STATE_GAMEOVER) {
                this.startAnglePhase();
            } else if (this.state === V2_STATE_ANGLE) {
                this.state = V2_STATE_POWER;
                v2Audio.playBounce();
            } else if (this.state === V2_STATE_POWER) {
                this.launch();
            } else if (this.state === V2_STATE_FLIGHT) {
                if (this.aedCharge >= 100) {
                    this.triggerAED();
                } else if (this.hisao.vy > 0 && this.mishaBoosts > 0) {
                    this.triggerMishaBoost();
                }
            }
        };

        mainBtn.addEventListener('click', handleAction);
        aedBtn.addEventListener('click', () => {
            v2Audio.init();
            if (this.state === V2_STATE_FLIGHT && this.aedCharge >= 100) this.triggerAED();
        });
        resetBtn.addEventListener('click', () => this.resetMenu());

        sndBtn.addEventListener('click', () => {
            v2Audio.enabled = !v2Audio.enabled;
            sndBtn.textContent = v2Audio.enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
            const sfxEl = document.getElementById('menu-sfx');
            if (sfxEl) sfxEl.textContent = v2Audio.enabled ? 'Sfx: ON' : 'Sfx: OFF';
        });

        // Interactive Flash Overlay Menu Handlers
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
            v2Audio.init();
            const active = v2Audio.toggleBGM();
            e.target.textContent = active ? 'Bgm: ON' : 'Bgm: OFF';
        });
        document.getElementById('menu-sfx').addEventListener('click', (e) => {
            v2Audio.init();
            const active = v2Audio.toggleSFX();
            e.target.textContent = active ? 'Sfx: ON' : 'Sfx: OFF';
            sndBtn.textContent = active ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        });
        document.getElementById('menu-url').addEventListener('click', () => {
            window.open('http://www.katawa-shoujo.com', '_blank');
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
            overlay.style.display = (this.state === V2_STATE_MENU) ? 'flex' : 'none';
        }
    }

    startAnglePhase() {
        this.state = V2_STATE_ANGLE;
        this.angle = 45;
        this.power = 50;
        document.getElementById('btn-main-action').textContent = '🎯 Lock Angle';
        document.getElementById('hud-overlay').style.display = 'none';
        this.updateMenuOverlayState();
    }

    launch() {
        this.state = V2_STATE_FLIGHT;
        document.getElementById('btn-main-action').textContent = '⚡ In Flight...';
        document.getElementById('hud-overlay').style.display = 'flex';
        this.updateMenuOverlayState();

        const rad = (this.angle * Math.PI) / 180;
        let speed = 13 + (this.power / 100) * 30;

        // ActionScript 3.0 Skill Shot Bonus
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
        this.yuukoCharges = 0;

        this.fireStatus = false;
        this.fireTimer = 0;
        this.lastHitKey = null;
        this.consecutiveHits = 0;
        this.extraLife = false;
        this.kuboStatus = false;

        this.maxSpawnedX = 120;
        this.characters = [];
        this.generateBoostsUpTo(2500);

        v2Audio.playLaunch();
        this.unlockAch('ach-1');
    }

    // Complete ActionScript 3 Character Mechanics Map
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
            { name: 'Kenji', key: 'kenji', title: 'CONSPIRACY CATAPULT!', color: '#fa8231' },
            { name: 'Yuuko', key: 'yuuko', title: 'GREASED PIGGY BOOST!', color: '#ff78e2' }
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
        v2Audio.playHit('aed');

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
        v2Audio.playHit('misha');

        this.addPopup('🎀 MISHA MID-AIR BOOST!', '#ff6b81');
        this.addParticles(this.hisao.x, this.hisao.y, '#ff6b81', 20);
        this.effects.push({ type: 'misha_drill', x: this.hisao.x, y: this.hisao.y, frame: 0, life: 15 });
    }

    triggerRevival() {
        if (!this.extraLife) return;
        this.extraLife = false;
        this.hisao.vy = -24;
        this.hisao.vx += 18;
        v2Audio.playHit('emi');
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
            localStorage.setItem('kc_v2_ach', JSON.stringify(this.unlockedAch));
            this.updateAchUI();
            v2Audio.playAch();
        }
    }

    resetMenu() {
        this.state = V2_STATE_MENU;
        document.getElementById('btn-main-action').textContent = '🚀 Launch Game';
        document.getElementById('hud-overlay').style.display = 'none';
        this.updateMenuOverlayState();
    }

    update() {
        if (this.state === V2_STATE_ANGLE) {
            this.angle += this.angleDir * 1.9;
            if (this.angle >= 80) { this.angle = 80; this.angleDir = -1; }
            if (this.angle <= 10) { this.angle = 10; this.angleDir = 1; }
        } else if (this.state === V2_STATE_POWER) {
            this.power += this.powerDir * 2.6;
            if (this.power >= 100) { this.power = 100; this.powerDir = -1; }
            if (this.power <= 5) { this.power = 5; this.powerDir = 1; }
        } else if (this.state === V2_STATE_FLIGHT) {
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
                    v2Audio.playBounce();
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

            // ActionScript 3 1:1 Character Hit Handlers
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
                        v2Audio.playHit(char.key);
                        this.screenShake = 8;

                        if (this.lastHitKey === char.key) {
                            this.consecutiveHits++;
                            if (this.consecutiveHits >= 3 && !this.fireStatus) {
                                this.fireStatus = true;
                                this.fireTimer = 450;
                                v2Audio.playHit('fire');
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
                        } else if (char.key === 'kenji') {
                            this.hisao.vx += 18 * mult; this.hisao.vy = -18 * mult;
                            this.addPopup('JUST ACCORDING TO KEIKAKU!', '#fa8231');
                        } else if (char.key === 'mutou') {
                            this.hisao.vx *= 0.5; this.hisao.vy = -20 * mult;
                        } else if (char.key === 'yuuko') {
                            this.yuukoCharges += 2;
                            this.hisao.vx += 16 * mult; this.hisao.vy = -15 * mult;
                        } else if (char.key === 'akira') {
                            this.hisao.vx += 35 * mult; this.hisao.vy = -25 * mult;
                            this.screenShake = 16;
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

            document.getElementById('hud-dist').textContent = `${this.distance.toFixed(2)} m`;
            document.getElementById('hud-speed').textContent = `${curSpeed.toFixed(1)} km/h`;
            document.getElementById('hud-combo').textContent = `${this.comboMultiplier}x`;
            document.getElementById('hud-misha').textContent = this.mishaBoosts;
            document.getElementById('hud-fire').textContent = this.fireStatus ? 'ON 🔥' : 'OFF';
            document.getElementById('hud-fire').style.color = this.fireStatus ? '#ff4757' : '#8e94a5';
            document.getElementById('aed-pct').textContent = Math.floor(this.aedCharge);
            document.getElementById('aed-trigger-btn').disabled = this.aedCharge < 100;
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
        this.state = V2_STATE_GAMEOVER;
        document.getElementById('btn-main-action').textContent = '🔁 Play Again';
        this.updateMenuOverlayState();

        if (this.distance > this.bestRecord) {
            this.bestRecord = this.distance;
            localStorage.setItem('kc_v2_best', this.bestRecord.toString());
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
        const skyBg = v2Assets.getImage('sky_bg');
        const starfieldBg = v2Assets.getImage('starfield');
        const bigEarthBg = v2Assets.getImage('big_earth');
        const planetEarthBg = v2Assets.getImage('planet_earth');

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
                skyGrad.addColorStop(0, '#0a1122');
                skyGrad.addColorStop(1, '#223354');
                this.ctx.fillStyle = skyGrad;
                this.ctx.fillRect(0, 0, 700, 320);
            }

            const fBg1 = v2Assets.getImage('field_bg1');
            const fBg2 = v2Assets.getImage('field_bg2');
            const fBg3 = v2Assets.getImage('field_bg3');
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

            const cloud1 = v2Assets.getImage('cloud1');
            const cloud2 = v2Assets.getImage('cloud2');
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

        const skyline1 = v2Assets.getImage('skyline1');
        const skyline2 = v2Assets.getImage('skyline2');

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

        const startBg = v2Assets.getImage('starting_bg');
        if (startBg && this.cameraX < 700) {
            this.ctx.drawImage(startBg, -this.cameraX, 185 - camOffsetY);
        }

        const grassTile = v2Assets.getImage('grass_tile');
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

        if (this.state === V2_STATE_FLIGHT || this.state === V2_STATE_GAMEOVER) {
            this.characters.forEach(char => {
                const cx = char.x - this.cameraX;
                if (cx >= -50 && cx <= 750) {
                    const charImg = v2Assets.getImage(char.key);
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

                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = 'bold 10px "Outfit"';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(char.name, cx, groundY - 48);
                }
            });
        }

        this.effects.forEach(eff => {
            const ex = eff.x - this.cameraX;
            const ey = eff.y - camOffsetY;
            if (eff.type === 'shoryuken') {
                const sImg = v2Assets.getImage('shoryuken1');
                if (sImg) this.ctx.drawImage(sImg, ex - sImg.width / 2, ey - sImg.height);
            } else if (eff.type === 'aed_zap') {
                const zImg = v2Assets.getImage('aed_zap');
                if (zImg) this.ctx.drawImage(zImg, ex - zImg.width / 2, ey - zImg.height / 2);
            } else if (eff.type === 'misha_drill') {
                const dImg = v2Assets.getImage('misha_drill1');
                if (dImg) this.ctx.drawImage(dImg, ex - dImg.width / 2, ey - dImg.height / 2);
            }
        });

        const hScreenX = this.hisao.x - this.cameraX;
        const hScreenY = this.hisao.y - camOffsetY;
        const hisaoImg = v2Assets.getImage('hisao');

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

        if (this.state === V2_STATE_ANGLE || this.state === V2_STATE_POWER) {
            const lx = 80 - this.cameraX;
            const ly = groundY - 10;

            const arrowImg = v2Assets.getImage('arrow1');
            const rad = (this.angle * Math.PI) / 180;
            this.ctx.save();
            this.ctx.translate(lx, ly);
            this.ctx.rotate(-rad);
            if (arrowImg) {
                this.ctx.drawImage(arrowImg, 0, -arrowImg.height / 2, 60, arrowImg.height);
            } else {
                this.ctx.strokeStyle = '#00d2d3';
                this.ctx.lineWidth = 5;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(60, 0);
                this.ctx.stroke();
            }
            this.ctx.restore();

            this.ctx.fillStyle = '#00d2d3';
            this.ctx.font = 'bold 14px "JetBrains Mono"';
            this.ctx.fillText(`ANGLE: ${Math.floor(this.angle)}°`, lx + 70, ly - 35);

            if (this.state === V2_STATE_POWER) {
                this.ctx.fillStyle = 'rgba(0,0,0,0.65)';
                this.ctx.fillRect(lx + 70, ly - 18, 120, 16);
                this.ctx.fillStyle = '#e94560';
                this.ctx.fillRect(lx + 72, ly - 16, (this.power / 100) * 116, 12);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 11px "JetBrains Mono"';
                this.ctx.fillText(`POWER: ${Math.floor(this.power)}%`, lx + 70, ly + 14);
            }
        }

        if (this.state === V2_STATE_GAMEOVER) {
            this.ctx.fillStyle = 'rgba(6, 8, 16, 0.92)';
            this.ctx.fillRect(140, 50, 420, 300);
            this.ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(140, 50, 420, 300);

            this.ctx.fillStyle = '#f7b731';
            this.ctx.font = '800 24px "Outfit"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('📋 REPORT CARD (V2.0)', 350, 90);

            let rank = 'C';
            if (this.distance > 1500) rank = 'RANK S (LEGENDARY)';
            else if (this.distance > 1000) rank = 'RANK A (EXCELLENT)';
            else if (this.distance > 600) rank = 'RANK B (GREAT)';
            else if (this.distance > 300) rank = 'RANK C (GOOD)';
            else rank = 'RANK D (TRY AGAIN)';

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '14px "JetBrains Mono"';
            this.ctx.fillText(`Total Distance: ${this.distance.toFixed(2)} m`, 350, 135);
            this.ctx.fillText(`Max Altitude: ${this.maxAltitude.toFixed(2)} m`, 350, 165);
            this.ctx.fillText(`Top Speed: ${this.topSpeed.toFixed(1)} km/h`, 350, 195);
            this.ctx.fillText(`Combos Struck: ${this.combos}`, 350, 225);
            this.ctx.fillText(`Peak Multiplier: ${this.comboMultiplier}x`, 350, 255);

            this.ctx.fillStyle = '#20bf6b';
            this.ctx.font = 'bold 16px "Outfit"';
            this.ctx.fillText(`GRADE: ${rank}`, 350, 290);

            this.ctx.fillStyle = '#8e94a5';
            this.ctx.font = '12px "Outfit"';
            this.ctx.fillText('Press SPACEBAR or click Play Again to launch again!', 350, 330);
        }

        if (this.state === V2_STATE_MENU) {
            const startBg = v2Assets.getImage('starting_bg');
            if (startBg) {
                this.ctx.drawImage(startBg, 0, 185);
            }
            const grassTile = v2Assets.getImage('grass_tile');
            if (grassTile) {
                for (let x = 0; x < 700; x += grassTile.width) {
                    this.ctx.drawImage(grassTile, x, 320);
                }
            }

            this.ctx.fillStyle = 'rgba(6, 8, 16, 0.45)';
            this.ctx.fillRect(0, 0, 700, 400);

            const logoImg = v2Assets.getImage('logo');
            if (logoImg) {
                this.ctx.drawImage(logoImg, 350 - logoImg.width / 2, 45);
            } else {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '800 36px "Outfit"';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('KATAWA CRASH V2', 350, 90);
            }
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
    window.game = new KatawaCrashV2Engine();
});
