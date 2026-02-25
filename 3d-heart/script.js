/* ── Celestial Heart · Vanilla Three.js ────────────────────── */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/* ─── Configuration ───────────────────────────────────────── */

const CONFIG = {
    heartParticles: 20000,
    starParticles: 2500,
    heartScale: 2.4,
    disperseRadius: 14,
    bloomStrength: 1.8,
    bloomRadius: 0.85,
    bloomThreshold: 0.12,
    rotationSpeed: 0.12,
    lerpSpeed: 0.04,
    disperseLerpSpeed: 0.025,
    colors: {
        core: new THREE.Color(1.0, 0.9, 0.95),        // bright white-pink
        mid: new THREE.Color(1.0, 0.35, 0.6),          // vibrant pink
        edge: new THREE.Color(0.75, 0.1, 0.4),         // deep rose
        star: new THREE.Color(0.9, 0.85, 1.0),         // cool blueish white
    },
};

/* ─── State ───────────────────────────────────────────────── */

let dispersed = false;
let disperseT = 0;           // 0 = converged, 1 = dispersed
let clock, scene, camera, renderer, composer;
let heartPoints, heartGeo;
let starPoints;
let heartTargets = [];        // converged positions
let heartDispersed = [];      // dispersed positions
let prevTime = 0;

// Camera orbit state
let orbitAngle = 0;           // horizontal angle (radians)
let orbitTilt = 0;            // vertical tilt (-1 to 1)
let orbitMomentumX = 0;       // horizontal momentum
let orbitMomentumY = 0;       // vertical momentum
let autoRotateSpeed = CONFIG.rotationSpeed;

// Touch / pointer drag state
let isDragging = false;
let pointerStart = { x: 0, y: 0 };
let pointerPrev = { x: 0, y: 0 };
let pointerStartTime = 0;
let totalDragDist = 0;
const TAP_THRESHOLD = 12;    // px — below this = tap, above = drag
const TAP_TIME = 300;        // ms — max time for a tap

// Mouse parallax (desktop only)
let mouseParallax = { x: 0, y: 0 };

// Visual feedback
let interactionGlow = 0;     // 0..1, pulses on interaction

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
        p.x += (Math.random() - 0.5) * 0.08;
        p.y += (Math.random() - 0.5) * 0.08;
        p.z += (Math.random() - 0.5) * 0.08;
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
            uSize: { value: 38.0 },
            uGlow: { value: 0.0 },
            uColorCore: { value: CONFIG.colors.core },
            uColorMid: { value: CONFIG.colors.mid },
            uColorEdge: { value: CONFIG.colors.edge },
        },
        vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uSize;
      uniform float uGlow;

      attribute float aRandom;
      attribute float aPhase;

      varying float vDist;
      varying float vRandom;
      varying float vGlow;

      void main() {
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);

        vDist = length(position.xy - vec2(0.0, 0.5));
        vRandom = aRandom;
        vGlow = uGlow;

        // Twinkle + interaction glow boost
        float twinkle = 0.7 + 0.3 * sin(uTime * 2.0 + aPhase * 6.2831);
        float glowBoost = 1.0 + uGlow * 0.3;
        float size = uSize * twinkle * (0.6 + aRandom * 0.4) * glowBoost;

        gl_PointSize = size * uPixelRatio * (1.0 / -mvPos.z);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
        fragmentShader: /* glsl */ `
      uniform vec3 uColorCore;
      uniform vec3 uColorMid;
      uniform vec3 uColorEdge;

      varying float vDist;
      varying float vRandom;
      varying float vGlow;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;

        float alpha = 1.0 - smoothstep(0.0, 0.5, d);
        alpha = pow(alpha, 1.5);

        float t = clamp(vDist / 3.0, 0.0, 1.0);
        vec3 color = mix(uColorCore, uColorMid, smoothstep(0.0, 0.4, t));
        color = mix(color, uColorEdge, smoothstep(0.4, 1.0, t));

        // Interaction glow — shift toward brighter white-pink
        color = mix(color, vec3(1.0, 0.7, 0.85), vGlow * 0.35);

        color *= 0.8 + vRandom * 0.4;
        gl_FragColor = vec4(color, alpha * (0.85 + vGlow * 0.15));
      }
    `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });
}

/* ─── Star Background ────────────────────────────────────── */

function createStars() {
    const count = CONFIG.starParticles;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const r = 30 + Math.random() * 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
        sizes[i] = 0.5 + Math.random() * 1.5;
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
        float twinkle = 0.5 + 0.5 * sin(uTime * 1.5 + position.x * 10.0);
        vAlpha = twinkle * 0.6;
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

/* ─── Init ───────────────────────────────────────────────── */

function init() {
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colors.bg || 0x050105);

    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 200);
    camera.position.set(0, 1.0, 8);
    camera.lookAt(0, 0.5, 0);

    renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
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

    createStars();
    createHeart();

    // Events
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);

    // Pointer events for drag/swipe + tap
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

    // ── Breathing ──
    const breathe = 1.0 + Math.sin(elapsed * 0.8) * 0.03;
    heartPoints.scale.setScalar(breathe);

    // ── Interaction glow decay ──
    interactionGlow *= 0.96;
    if (interactionGlow < 0.001) interactionGlow = 0;

    // ── Shader uniforms ──
    heartPoints.material.uniforms.uTime.value = elapsed;
    heartPoints.material.uniforms.uGlow.value = interactionGlow;
    starPoints.material.uniforms.uTime.value = elapsed;

    // ── Camera: orbit with momentum ──
    if (!isDragging) {
        // Apply momentum with decay
        orbitAngle += orbitMomentumX * safeDt;
        orbitTilt += orbitMomentumY * safeDt;

        // Friction decay
        orbitMomentumX *= 0.95;
        orbitMomentumY *= 0.95;

        // Auto rotation (slows when there's momentum)
        const momentumMag = Math.abs(orbitMomentumX) + Math.abs(orbitMomentumY);
        const autoFactor = Math.max(0, 1 - momentumMag * 0.5);
        orbitAngle += autoRotateSpeed * safeDt * autoFactor;
    }

    // Clamp tilt
    orbitTilt = Math.max(-1.2, Math.min(1.2, orbitTilt));

    // Tilt decays gently back toward 0
    if (!isDragging && Math.abs(orbitMomentumY) < 0.1) {
        orbitTilt *= 0.995;
    }

    const camRadius = 8;
    camera.position.x = Math.sin(orbitAngle) * camRadius + mouseParallax.x * 0.5;
    camera.position.z = Math.cos(orbitAngle) * camRadius;
    camera.position.y = 1.0 + orbitTilt * 2.0 + mouseParallax.y * 0.3;
    camera.lookAt(0, 0.5, 0);

    // ── Star rotation ──
    starPoints.rotation.y = elapsed * 0.02;

    composer.render();
}

/* ─── Event Handlers ─────────────────────────────────────── */

function toggleDisperse() {
    dispersed = !dispersed;
    interactionGlow = 1.0;
    const hint = document.querySelector('.hint');
    if (hint) {
        hint.classList.remove('pulse');
        void hint.offsetWidth;
        hint.classList.add('pulse');
        hint.textContent = dispersed
            ? 'Tap to converge · Swipe to orbit'
            : 'Tap to disperse · Swipe to orbit';
    }
}

function onKey(e) {
    if (e.code === 'KeyD' || e.code === 'Space') {
        e.preventDefault();
        toggleDisperse();
    }
    // Arrow keys for orbit
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

    // Kill momentum on new touch
    orbitMomentumX = 0;
    orbitMomentumY = 0;

    // Subtle glow on touch
    interactionGlow = Math.max(interactionGlow, 0.3);
}

function onPointerMove(e) {
    // Desktop mouse parallax (when not dragging)
    if (e.pointerType === 'mouse' && !isDragging) {
        mouseParallax.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseParallax.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    }

    if (!isDragging) return;

    const dx = e.clientX - pointerPrev.x;
    const dy = e.clientY - pointerPrev.y;
    totalDragDist += Math.abs(dx) + Math.abs(dy);

    // Orbit: horizontal drag = rotate, vertical drag = tilt
    const sensitivity = 0.005;
    orbitAngle += dx * sensitivity;
    orbitTilt -= dy * sensitivity * 0.6;

    // Store velocity for momentum
    orbitMomentumX = dx * sensitivity * 60;
    orbitMomentumY = -dy * sensitivity * 0.6 * 60;

    // Visual feedback proportional to swipe speed
    const speed = Math.sqrt(dx * dx + dy * dy);
    interactionGlow = Math.min(1, interactionGlow + speed * 0.008);

    pointerPrev = { x: e.clientX, y: e.clientY };
}

function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;

    const elapsed = performance.now() - pointerStartTime;

    // If short duration + small distance → it's a TAP → toggle disperse
    if (elapsed < TAP_TIME && totalDragDist < TAP_THRESHOLD) {
        toggleDisperse();
        // Clear any accidental momentum
        orbitMomentumX = 0;
        orbitMomentumY = 0;
    }
    // Otherwise momentum continues from the last move values
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
}

/* ─── Boot ───────────────────────────────────────────────── */

init();
