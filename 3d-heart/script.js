/* ── Trái Tim Của Em · Premium 3D Heart ──────────────────────── */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/* ─── Configuration ───────────────────────────────────────── */

const CONFIG = {
    heartParticles: 22000,
    starParticles: 3000,
    nebulaParticles: 800,
    heartScale: 2.6,
    disperseRadius: 16,
    bloomStrength: 2.0,
    bloomRadius: 0.9,
    bloomThreshold: 0.1,
    rotationSpeed: 0.1,
    lerpSpeed: 0.04,
    disperseLerpSpeed: 0.025,
    colors: {
        core: new THREE.Color(1.0, 0.92, 0.96),
        mid: new THREE.Color(1.0, 0.3, 0.55),
        edge: new THREE.Color(0.8, 0.08, 0.35),
        star: new THREE.Color(0.92, 0.88, 1.0),
        nebula1: new THREE.Color(0.6, 0.1, 0.4),
        nebula2: new THREE.Color(0.2, 0.05, 0.5),
    },
};

/* ─── Love Quotes ─────────────────────────────────────────── */

const LOVE_QUOTES = [
    '❝ Em là tất cả những gì anh cần ❞',
    '❝ Yêu em hơn cả ngàn vì sao ❞',
    '❝ Trái tim này chỉ đập vì em ❞',
    '❝ Anh sẽ yêu em đến tận cùng thời gian ❞',
    '❝ Em là giấc mơ đẹp nhất đời anh ❞',
    '❝ Bên em, thế giới như ngừng quay ❞',
    '❝ Mỗi nhịp tim là một lần nhớ em ❞',
    '❝ Em là ánh sáng giữa bầu trời đêm ❞',
    '❝ You are my forever and always ❞',
    '❝ Cả vũ trụ thu bé lại bằng nụ cười em ❞',
    '❝ Anh muốn nắm tay em đi qua mọi mùa ❞',
    '❝ Em khiến trái tim anh trở nên ấm áp ❞',
];

/* ─── State ───────────────────────────────────────────────── */

let dispersed = false;
let disperseT = 0;
let clock, scene, camera, renderer, composer;
let heartPoints, heartGeo;
let starPoints, nebulaPoints;
let heartTargets = [];
let heartDispersed = [];
let prevTime = 0;

// Camera orbit
let orbitAngle = 0;
let orbitTilt = 0;
let orbitMomentumX = 0;
let orbitMomentumY = 0;
let autoRotateSpeed = CONFIG.rotationSpeed;

// Pointer state
let isDragging = false;
let pointerStart = { x: 0, y: 0 };
let pointerPrev = { x: 0, y: 0 };
let pointerStartTime = 0;
let totalDragDist = 0;
const TAP_THRESHOLD = 12;
const TAP_TIME = 300;

// Mouse parallax
let mouseParallax = { x: 0, y: 0 };

// Visual feedback
let interactionGlow = 0;
let heartbeatPhase = 0;

/* ─── Heart Shape Maths ──────────────────────────────────── */

function heartPosition(u, v) {
    const t = u * Math.PI * 2;
    const s = v * Math.PI;
    const scale = CONFIG.heartScale;

    const x = scale * 16 * Math.pow(Math.sin(t), 3);
    const y = scale * (
        13 * Math.cos(t)
        - 5 * Math.cos(2 * t)
        - 2 * Math.cos(3 * t)
        - Math.cos(4 * t)
    );
    const z = scale * 8 * Math.cos(s) * Math.sin(t);

    return new THREE.Vector3(x * 0.06, y * 0.06 + 0.5, z * 0.06);
}

function generateHeartPositions(count) {
    const positions = [];
    const center = new THREE.Vector3(0, 0.5, 0);
    for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const p = heartPosition(u, v);
        const fill = Math.pow(Math.random(), 0.3);
        p.lerp(center, 1 - fill);
        p.x += (Math.random() - 0.5) * 0.06;
        p.y += (Math.random() - 0.5) * 0.06;
        p.z += (Math.random() - 0.5) * 0.06;
        positions.push(p);
    }
    return positions;
}

function generateDispersePositions(count) {
    const positions = [];
    for (let i = 0; i < count; i++) {
        const r = CONFIG.disperseRadius;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = r * (0.4 + Math.random() * 0.6);
        positions.push(new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi),
        ));
    }
    return positions;
}

/* ─── Particle Shader Material ───────────────────────────── */

function createHeartMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uSize: { value: 40.0 },
            uGlow: { value: 0.0 },
            uHeartbeat: { value: 0.0 },
            uColorCore: { value: CONFIG.colors.core },
            uColorMid: { value: CONFIG.colors.mid },
            uColorEdge: { value: CONFIG.colors.edge },
        },
        vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uSize;
      uniform float uGlow;
      uniform float uHeartbeat;

      attribute float aRandom;
      attribute float aPhase;

      varying float vDist;
      varying float vRandom;
      varying float vGlow;
      varying float vPhase;

      void main() {
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);

        vDist = length(position.xy - vec2(0.0, 0.5));
        vRandom = aRandom;
        vGlow = uGlow;
        vPhase = aPhase;

        // Twinkle + heartbeat pulse + interaction glow
        float twinkle = 0.65 + 0.35 * sin(uTime * 2.5 + aPhase * 6.2831);
        float beat = 1.0 + uHeartbeat * 0.15 * sin(aPhase * 3.14159);
        float glowBoost = 1.0 + uGlow * 0.4;
        float size = uSize * twinkle * beat * (0.55 + aRandom * 0.45) * glowBoost;

        gl_PointSize = size * uPixelRatio * (1.0 / -mvPos.z);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
        fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColorCore;
      uniform vec3 uColorMid;
      uniform vec3 uColorEdge;

      varying float vDist;
      varying float vRandom;
      varying float vGlow;
      varying float vPhase;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;

        // Soft circular gradient with glow halo
        float alpha = 1.0 - smoothstep(0.0, 0.5, d);
        alpha = pow(alpha, 1.3);

        // Color gradient from center to edge
        float t = clamp(vDist / 3.0, 0.0, 1.0);
        vec3 color = mix(uColorCore, uColorMid, smoothstep(0.0, 0.35, t));
        color = mix(color, uColorEdge, smoothstep(0.35, 1.0, t));

        // Subtle color shifting over time
        float shift = sin(uTime * 0.5 + vPhase * 6.28) * 0.08;
        color.r += shift;
        color.b -= shift * 0.5;

        // Interaction glow — white-pink bloom
        color = mix(color, vec3(1.0, 0.75, 0.88), vGlow * 0.4);

        color *= 0.82 + vRandom * 0.38;
        gl_FragColor = vec4(color, alpha * (0.88 + vGlow * 0.12));
      }
    `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });
}

/* ─── Nebula Background ──────────────────────────────────── */

function createNebula() {
    const count = CONFIG.nebulaParticles;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const r = 20 + Math.random() * 35;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
        sizes[i] = 2 + Math.random() * 6;

        // Mix between two nebula colors
        const mix = Math.random();
        const c1 = CONFIG.colors.nebula1;
        const c2 = CONFIG.colors.nebula2;
        colors[i * 3] = c1.r * (1 - mix) + c2.r * mix;
        colors[i * 3 + 1] = c1.g * (1 - mix) + c2.g * mix;
        colors[i * 3 + 2] = c1.b * (1 - mix) + c2.b * mix;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        },
        vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      attribute float aSize;
      attribute vec3 aColor;
      varying float vAlpha;
      varying vec3 vColor;

      void main() {
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        float pulse = 0.4 + 0.6 * sin(uTime * 0.3 + position.x * 2.0 + position.z);
        vAlpha = pulse * 0.25;
        vColor = aColor;
        gl_PointSize = aSize * uPixelRatio * pulse * (1.0 / -mvPos.z) * 80.0;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
        fragmentShader: /* glsl */ `
      varying float vAlpha;
      varying vec3 vColor;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.0, 0.5, d);
        alpha = pow(alpha, 2.0);
        gl_FragColor = vec4(vColor, alpha * vAlpha);
      }
    `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    nebulaPoints = new THREE.Points(geo, mat);
    scene.add(nebulaPoints);
}

/* ─── Star Background ────────────────────────────────────── */

function createStars() {
    const count = CONFIG.starParticles;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const r = 30 + Math.random() * 60;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
        sizes[i] = 0.4 + Math.random() * 1.8;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uColor: { value: CONFIG.colors.star },
        },
        vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      attribute float aSize;
      varying float vAlpha;

      void main() {
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        float twinkle = 0.4 + 0.6 * sin(uTime * 1.8 + position.x * 8.0 + position.y * 5.0);
        vAlpha = twinkle * 0.7;
        gl_PointSize = aSize * uPixelRatio * twinkle * (1.0 / -mvPos.z) * 60.0;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
        fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.0, 0.5, d);
        gl_FragColor = vec4(uColor, alpha * vAlpha);
      }
    `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    starPoints = new THREE.Points(geo, mat);
    scene.add(starPoints);
}

/* ─── Heart Particles ────────────────────────────────────── */

function createHeart() {
    const count = CONFIG.heartParticles;
    heartTargets = generateHeartPositions(count);
    heartDispersed = generateDispersePositions(count);

    heartGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const p = heartTargets[i];
        pos[i * 3] = p.x;
        pos[i * 3 + 1] = p.y;
        pos[i * 3 + 2] = p.z;
        randoms[i] = Math.random();
        phases[i] = Math.random();
    }

    heartGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    heartGeo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    heartGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    const mat = createHeartMaterial();
    heartPoints = new THREE.Points(heartGeo, mat);
    scene.add(heartPoints);
}

/* ─── Floating Petals ────────────────────────────────────── */

function initPetals() {
    const container = document.getElementById('petals');
    if (!container) return;

    const petalEmojis = ['🌸', '🌺', '💮', '🏵️', '✿'];

    function createPetal() {
        const el = document.createElement('div');
        el.className = 'petal';
        el.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.fontSize = (12 + Math.random() * 14) + 'px';
        el.style.animationDuration = (6 + Math.random() * 6) + 's';
        el.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(el);
        setTimeout(() => el.remove(), 14000);
    }

    // Initial burst
    for (let i = 0; i < 5; i++) {
        setTimeout(createPetal, i * 600);
    }

    // Continuous
    setInterval(createPetal, 2500);
}

/* ─── Love Quotes Rotator ────────────────────────────────── */

function initLoveQuotes() {
    const el = document.getElementById('love-quote');
    if (!el) return;

    let idx = Math.floor(Math.random() * LOVE_QUOTES.length);
    el.textContent = LOVE_QUOTES[idx];

    setInterval(() => {
        el.classList.add('changing');
        setTimeout(() => {
            idx = (idx + 1) % LOVE_QUOTES.length;
            el.textContent = LOVE_QUOTES[idx];
            el.classList.remove('changing');
        }, 800);
    }, 8000);
}

/* ─── Music Control ──────────────────────────────────────── */

function initMusic() {
    const btn = document.getElementById('music-btn');
    const audio = document.getElementById('bg-music');
    if (!btn || !audio) return;

    let playing = false;

    btn.addEventListener('click', () => {
        if (playing) {
            audio.pause();
            btn.classList.remove('playing');
        } else {
            audio.play().catch(() => { });
            btn.classList.add('playing');
        }
        playing = !playing;
    });

    // Auto-play on first interaction
    let autoInit = false;
    document.addEventListener('click', function autoPlay() {
        if (!autoInit) {
            audio.play().catch(() => { });
            playing = true;
            btn.classList.add('playing');
            autoInit = true;
        }
    }, { once: true });
}

/* ─── Init ───────────────────────────────────────────────── */

function init() {
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050008);

    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 200);
    camera.position.set(0, 1.0, 8);
    camera.lookAt(0, 0.5, 0);

    renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    document.body.appendChild(renderer.domElement);

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        CONFIG.bloomStrength,
        CONFIG.bloomRadius,
        CONFIG.bloomThreshold,
    );
    composer.addPass(bloom);

    createNebula();
    createStars();
    createHeart();

    // DOM features
    initPetals();
    initLoveQuotes();
    initMusic();

    // Events
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    tick();
}

/* ─── Animation Loop ─────────────────────────────────────── */

function tick() {
    requestAnimationFrame(tick);

    const elapsed = clock.getElapsedTime();
    const dt = Math.min(elapsed - prevTime, 0.05);
    prevTime = elapsed;
    const safeDt = Math.max(dt, 0.001);

    // ── Heartbeat simulation ──
    heartbeatPhase += safeDt * 1.2;
    const heartbeat = Math.pow(Math.abs(Math.sin(heartbeatPhase)), 3);

    // ── Disperse interpolation ──
    const targetT = dispersed ? 1 : 0;
    const dSpeed = dispersed ? CONFIG.disperseLerpSpeed : CONFIG.lerpSpeed;
    disperseT += (targetT - disperseT) * dSpeed * 60 * Math.max(dt, 0.016);
    disperseT = Math.max(0, Math.min(1, disperseT));

    // ── Lerp particles ──
    const posAttr = heartGeo.attributes.position;
    const posArr = posAttr.array;
    for (let i = 0; i < CONFIG.heartParticles; i++) {
        const i3 = i * 3;
        const ct = heartTargets[i];
        const cd = heartDispersed[i];
        posArr[i3] += ((ct.x + (cd.x - ct.x) * disperseT) - posArr[i3]) * 0.08;
        posArr[i3 + 1] += ((ct.y + (cd.y - ct.y) * disperseT) - posArr[i3 + 1]) * 0.08;
        posArr[i3 + 2] += ((ct.z + (cd.z - ct.z) * disperseT) - posArr[i3 + 2]) * 0.08;
    }
    posAttr.needsUpdate = true;

    // ── Breathing + heartbeat ──
    const breathe = 1.0 + Math.sin(elapsed * 0.8) * 0.025 + heartbeat * 0.02;
    heartPoints.scale.setScalar(breathe);

    // ── Interaction glow decay ──
    interactionGlow *= 0.95;
    if (interactionGlow < 0.001) interactionGlow = 0;

    // ── Shader uniforms ──
    heartPoints.material.uniforms.uTime.value = elapsed;
    heartPoints.material.uniforms.uGlow.value = interactionGlow;
    heartPoints.material.uniforms.uHeartbeat.value = heartbeat;
    starPoints.material.uniforms.uTime.value = elapsed;
    nebulaPoints.material.uniforms.uTime.value = elapsed;

    // ── Camera: orbit with momentum ──
    if (!isDragging) {
        orbitAngle += orbitMomentumX * safeDt;
        orbitTilt += orbitMomentumY * safeDt;

        orbitMomentumX *= 0.95;
        orbitMomentumY *= 0.95;

        const momentumMag = Math.abs(orbitMomentumX) + Math.abs(orbitMomentumY);
        const autoFactor = Math.max(0, 1 - momentumMag * 0.5);
        orbitAngle += autoRotateSpeed * safeDt * autoFactor;
    }

    orbitTilt = Math.max(-1.2, Math.min(1.2, orbitTilt));

    if (!isDragging && Math.abs(orbitMomentumY) < 0.1) {
        orbitTilt *= 0.995;
    }

    const camRadius = 8;
    camera.position.x = Math.sin(orbitAngle) * camRadius + mouseParallax.x * 0.5;
    camera.position.z = Math.cos(orbitAngle) * camRadius;
    camera.position.y = 1.0 + orbitTilt * 2.0 + mouseParallax.y * 0.3;
    camera.lookAt(0, 0.5, 0);

    // ── Background rotation ──
    starPoints.rotation.y = elapsed * 0.015;
    nebulaPoints.rotation.y = elapsed * 0.008;
    nebulaPoints.rotation.x = Math.sin(elapsed * 0.05) * 0.1;

    composer.render();
}

/* ─── Event Handlers ─────────────────────────────────────── */

function toggleDisperse() {
    dispersed = !dispersed;
    interactionGlow = 1.0;

    // Heartbeat spike
    heartbeatPhase = Math.PI * 0.5;

    const hint = document.querySelector('.hint');
    if (hint) {
        hint.classList.remove('pulse');
        void hint.offsetWidth;
        hint.classList.add('pulse');
        hint.textContent = dispersed
            ? 'Chạm để hội tụ · Vuốt để xoay'
            : 'Chạm để rung động · Vuốt để xoay';
    }
}

function onKey(e) {
    if (e.code === 'KeyD' || e.code === 'Space') {
        e.preventDefault();
        toggleDisperse();
    }
    const keySpeed = 2.0;
    if (e.code === 'ArrowLeft') orbitMomentumX -= keySpeed;
    if (e.code === 'ArrowRight') orbitMomentumX += keySpeed;
    if (e.code === 'ArrowUp') orbitMomentumY += keySpeed * 0.6;
    if (e.code === 'ArrowDown') orbitMomentumY -= keySpeed * 0.6;
}

function onPointerDown(e) {
    isDragging = true;
    totalDragDist = 0;
    pointerStart = { x: e.clientX, y: e.clientY };
    pointerPrev = { x: e.clientX, y: e.clientY };
    pointerStartTime = performance.now();

    orbitMomentumX = 0;
    orbitMomentumY = 0;
    interactionGlow = Math.max(interactionGlow, 0.3);
}

function onPointerMove(e) {
    if (e.pointerType === 'mouse' && !isDragging) {
        mouseParallax.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseParallax.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    }

    if (!isDragging) return;

    const dx = e.clientX - pointerPrev.x;
    const dy = e.clientY - pointerPrev.y;
    totalDragDist += Math.abs(dx) + Math.abs(dy);

    const sensitivity = 0.005;
    orbitAngle += dx * sensitivity;
    orbitTilt -= dy * sensitivity * 0.6;

    orbitMomentumX = dx * sensitivity * 60;
    orbitMomentumY = -dy * sensitivity * 0.6 * 60;

    const speed = Math.sqrt(dx * dx + dy * dy);
    interactionGlow = Math.min(1, interactionGlow + speed * 0.008);

    pointerPrev = { x: e.clientX, y: e.clientY };
}

function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;

    const elapsed = performance.now() - pointerStartTime;

    if (elapsed < TAP_TIME && totalDragDist < TAP_THRESHOLD) {
        toggleDisperse();
        orbitMomentumX = 0;
        orbitMomentumY = 0;
    }
}

function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    const pr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pr);
    heartPoints.material.uniforms.uPixelRatio.value = pr;
    starPoints.material.uniforms.uPixelRatio.value = pr;
    nebulaPoints.material.uniforms.uPixelRatio.value = pr;
}

/* ─── Boot ───────────────────────────────────────────────── */

init();
