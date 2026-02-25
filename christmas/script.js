import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

// --- CONFIGURATION ---
const IS_MOBILE = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && window.innerWidth < 1024);
const IS_LOW_END = navigator.hardwareConcurrency < 4 || (navigator.deviceMemory && navigator.deviceMemory < 4);
const GPU_INFO = {
    isHighEnd: !IS_MOBILE && !IS_LOW_END && navigator.hardwareConcurrency >= 8,
    isMobile: IS_MOBILE,
    hasWebGL2: !!document.createElement('canvas').getContext('webgl2'),
    memoryGB: navigator.deviceMemory || 4
};

const CONFIG = {
    colors: {
        bg: 0x0a0a1a,
        champagneGold: 0xffd966,
        deepGreen: 0x03180a,
        accentRed: 0xff0033,
        glowBlue: 0x4488ff,
        glowPurple: 0xaa44ff
    },
    particles: {
        count: IS_MOBILE ? 600 : (GPU_INFO.isHighEnd ? 2000 : 1200),
        dustCount: IS_MOBILE ? 500 : (GPU_INFO.isHighEnd ? 3000 : 2000),
        treeHeight: 24,
        treeRadius: 8
    },
    camera: {
        z: IS_MOBILE ? 55 : 50
    },
    performance: {
        maxPixelRatio: IS_MOBILE ? 1.5 : (GPU_INFO.isHighEnd ? 2.0 : 1.5),
        enableBloom: !IS_MOBILE,
        bloomResolution: GPU_INFO.isHighEnd ? 1.0 : 0.75,
        antialias: !IS_MOBILE && GPU_INFO.isHighEnd,
        enableFog: true
    }
};

// Hide webcam on mobile
if (IS_MOBILE) {
    const ww = document.getElementById('webcam-wrapper');
    if (ww) ww.style.display = 'none';
}

// Update hint text based on device
const hintEl = document.getElementById('hint-text');
if (hintEl) {
    hintEl.innerHTML = IS_MOBILE
        ? 'Kéo để xoay • Pinch để zoom<br>Nhấn ? để xem hướng dẫn'
        : "Nhấn 'H' ẩn giao diện • Kéo xoay • Scroll zoom<br>Nhấn ? để xem hướng dẫn";
}

// Hide keyboard section on mobile
if (IS_MOBILE) {
    const kbSection = document.getElementById('guide-keyboard-section');
    if (kbSection) kbSection.style.display = 'none';
}

const STATE = {
    mode: 'INTRO', // Start with intro animation
    focusIndex: -1,
    focusTarget: null,
    hand: { detected: false, x: 0, y: 0 },
    rotation: { x: 0, y: 0 },
    introProgress: 0 // 0 to 1 for intro animation
};

let scene, camera, renderer, composer;
let mainGroup;
let clock = new THREE.Clock();
let particleSystem = [];
let photoMeshGroup = new THREE.Group();
let handLandmarker, video, webcamCanvas, webcamCtx;
let caneTexture;
let controls; // OrbitControls for mouse interaction
let starField; // Background stars

async function init() {
    initThree();
    setupEnvironment();
    setupLights();
    createTextures();
    createStarField(); // Add twinkling stars
    createParticles();
    createDust();
    createDefaultPhotos();
    setupPostProcessing();
    setupMouseControls(); // Add mouse controls
    setupEvents();

    // Don't await MediaPipe - let it init in background so 3D tree renders immediately
    initMediaPipe().catch(e => console.warn('MediaPipe init error:', e));

    const loader = document.getElementById('loader');
    loader.style.opacity = 0;
    setTimeout(() => loader.remove(), 800);

    animate();
}

function initThree() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colors.bg);

    if (CONFIG.performance.enableFog) {
        scene.fog = new THREE.FogExp2(CONFIG.colors.bg, 0.01);
    }

    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, CONFIG.camera.z);

    renderer = new THREE.WebGLRenderer({
        antialias: CONFIG.performance.antialias,
        alpha: false,
        powerPreference: 'high-performance'
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.performance.maxPixelRatio));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.2;
    renderer.shadowMap.enabled = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    mainGroup = new THREE.Group();
    scene.add(mainGroup);

    console.log('🚀 Renderer initialized');
}

function createStarField() {
    const starCount = 800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const phases = new Float32Array(starCount); // For twinkling

    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;

        // Random position in a sphere
        const radius = 100 + Math.random() * 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        // Random colors (white, blue-white, yellow-white)
        const colorChoice = Math.random();
        if (colorChoice < 0.7) {
            colors[i3] = 1.0;
            colors[i3 + 1] = 1.0;
            colors[i3 + 2] = 1.0;
        } else if (colorChoice < 0.85) {
            colors[i3] = 0.8;
            colors[i3 + 1] = 0.9;
            colors[i3 + 2] = 1.0;
        } else {
            colors[i3] = 1.0;
            colors[i3 + 1] = 1.0;
            colors[i3 + 2] = 0.8;
        }

        sizes[i] = Math.random() * 2 + 0.5;
        phases[i] = Math.random() * Math.PI * 2; // Random phase for twinkling
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            attribute float phase;
            attribute vec3 color;
            varying vec3 vColor;
            varying float vAlpha;
            uniform float time;

            void main() {
                vColor = color;
                
                // Twinkling effect
                float twinkle = sin(time * 2.0 + phase) * 0.5 + 0.5;
                vAlpha = 0.3 + twinkle * 0.7;
                
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                // Circular star shape
                float dist = length(gl_PointCoord - vec2(0.5));
                if (dist > 0.5) discard;
                
                float alpha = (1.0 - dist * 2.0) * vAlpha;
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    starField = new THREE.Points(geometry, material);
    scene.add(starField);
}

function setupMouseControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.minPolarAngle = Math.PI / 4;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;
    controls.enablePan = false; // Disable panning for cleaner interaction
}

function setupEnvironment() {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
}

function setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    // Core tree light with pulsing effect - reduced
    const innerLight = new THREE.PointLight(0xffaa00, 2, 20);
    innerLight.position.set(0, 5, 0);
    innerLight.castShadow = false;
    mainGroup.add(innerLight);
    window.innerLight = innerLight; // Store for animation

    // Multiple colored spotlights for dynamic effect - reduced intensity
    const spotGold = new THREE.SpotLight(0xffd700, 900);
    spotGold.position.set(30, 40, 40);
    spotGold.angle = 0.5;
    spotGold.penumbra = 0.6;
    spotGold.decay = 1.5;
    scene.add(spotGold);

    const spotBlue = new THREE.SpotLight(0x4488ff, 600);
    spotBlue.position.set(-30, 20, -30);
    spotBlue.angle = 0.6;
    spotBlue.penumbra = 0.7;
    scene.add(spotBlue);
    window.spotBlue = spotBlue;

    const spotPurple = new THREE.SpotLight(0xaa44ff, 500);
    spotPurple.position.set(20, 30, -40);
    spotPurple.angle = 0.5;
    spotPurple.penumbra = 0.6;
    scene.add(spotPurple);
    window.spotPurple = spotPurple;

    const spotRed = new THREE.SpotLight(0xff3366, 450);
    spotRed.position.set(-25, 35, 30);
    spotRed.angle = 0.55;
    spotRed.penumbra = 0.65;
    scene.add(spotRed);
    window.spotRed = spotRed;

    const fill = new THREE.DirectionalLight(0xffeebb, 0.8);
    fill.position.set(0, 0, 50);
    scene.add(fill);

    // Rim light for depth
    const rimLight = new THREE.DirectionalLight(0x6699ff, 0.4);
    rimLight.position.set(0, 10, -50);
    scene.add(rimLight);
}

function setupPostProcessing() {
    const renderScene = new RenderPass(scene, camera);

    if (CONFIG.performance.enableBloom) {
        // A30 GPU optimized bloom settings
        const bloomResolution = new THREE.Vector2(
            window.innerWidth * CONFIG.performance.bloomResolution,
            window.innerHeight * CONFIG.performance.bloomResolution
        );

        const bloomPass = new UnrealBloomPass(
            bloomResolution,
            1.0,   // strength - optimized for A30
            0.4,   // radius - reduced for performance
            0.6    // threshold - higher for selectivity
        );

        composer = new EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);
        window.bloomPass = bloomPass;

        console.log('🌟 Bloom enabled with resolution:', bloomResolution);
    } else {
        // No bloom for maximum performance
        composer = new EffectComposer(renderer);
        composer.addPass(renderScene);
        console.log('⚡ Bloom disabled for maximum performance');
    }
}

function createTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#880000';
    ctx.beginPath();
    for (let i = -128; i < 256; i += 32) {
        ctx.moveTo(i, 0); ctx.lineTo(i + 32, 128); ctx.lineTo(i + 16, 128); ctx.lineTo(i - 16, 0);
    }
    ctx.fill();
    caneTexture = new THREE.CanvasTexture(canvas);
    caneTexture.wrapS = THREE.RepeatWrapping;
    caneTexture.wrapT = THREE.RepeatWrapping;
    caneTexture.repeat.set(3, 3);
}

class Particle {
    constructor(mesh, type, isDust = false) {
        this.mesh = mesh;
        this.type = type;
        this.isDust = isDust;

        this.posTree = new THREE.Vector3();
        this.posScatter = new THREE.Vector3();
        this.posIntro = new THREE.Vector3(); // Starting position for intro
        this.baseScale = mesh.scale.x;

        // Individual Spin Speed
        const speedMult = (type === 'PHOTO') ? 0.3 : 2.0;

        this.spinSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * speedMult,
            (Math.random() - 0.5) * speedMult,
            (Math.random() - 0.5) * speedMult
        );

        // Intro animation parameters
        this.introSide = Math.random() > 0.5 ? 1 : -1; // Left or right wave
        this.introDelay = Math.random() * 0.3; // Stagger effect
        this.introSpeed = 0.8 + Math.random() * 0.4;

        this.calculatePositions();
    }

    calculatePositions() {
        // 如果是照片，位置由 updatePhotoLayout 统一管理，这里只做初始化
        if (this.type === 'PHOTO') {
            this.posTree.set(0, 0, 0);
            // 初始化Scatter位置
            const rScatter = 8 + Math.random() * 12;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            this.posScatter.set(
                rScatter * Math.sin(phi) * Math.cos(theta),
                rScatter * Math.sin(phi) * Math.sin(theta),
                rScatter * Math.cos(phi)
            );

            // Intro position - off screen on sides
            this.posIntro.set(
                this.introSide * (30 + Math.random() * 20),
                -20 + Math.random() * 40,
                -10 + Math.random() * 20
            );
            return;
        }

        // TREE: Tight Spiral for normal particles
        const h = CONFIG.particles.treeHeight;
        const halfH = h / 2;
        let t = Math.random();
        t = Math.pow(t, 0.8);
        const y = (t * h) - halfH;

        let rMax = CONFIG.particles.treeRadius * (1.0 - t);
        if (rMax < 0.5) rMax = 0.5;

        const angle = t * 50 * Math.PI + Math.random() * Math.PI;
        const r = rMax * (0.8 + Math.random() * 0.4);
        this.posTree.set(Math.cos(angle) * r, y, Math.sin(angle) * r);

        // SCATTER: 3D Sphere
        let rScatter = this.isDust ? (12 + Math.random() * 20) : (8 + Math.random() * 12);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        this.posScatter.set(
            rScatter * Math.sin(phi) * Math.cos(theta),
            rScatter * Math.sin(phi) * Math.sin(theta),
            rScatter * Math.cos(phi)
        );

        // INTRO: Start position off-screen on left or right
        this.posIntro.set(
            this.introSide * (30 + Math.random() * 20),
            -20 + Math.random() * 40,
            -10 + Math.random() * 20
        );
    }

    update(dt, mode, focusTargetMesh, introProgress = 1) {
        let target = this.posTree;

        if (mode === 'INTRO') {
            // Animated intro with wave effect
            const adjustedProgress = Math.max(0, Math.min(1, (introProgress - this.introDelay) * this.introSpeed));
            const eased = this.easeInOutCubic(adjustedProgress);

            // Create wavy path from intro position to tree position
            const waveAmplitude = 15 * (1 - eased); // Wave decreases as it approaches
            const waveFrequency = 3;
            const waveOffset = Math.sin(eased * Math.PI * waveFrequency) * waveAmplitude * this.introSide;

            target = new THREE.Vector3(
                THREE.MathUtils.lerp(this.posIntro.x, this.posTree.x, eased) + waveOffset,
                THREE.MathUtils.lerp(this.posIntro.y, this.posTree.y, eased),
                THREE.MathUtils.lerp(this.posIntro.z, this.posTree.z, eased)
            );

            this.mesh.position.copy(target);

            // Rotate during intro
            this.mesh.rotation.x += this.spinSpeed.x * dt * 3;
            this.mesh.rotation.y += this.spinSpeed.y * dt * 3;
            this.mesh.rotation.z += this.spinSpeed.z * dt * 3;

            // Scale up during intro
            const s = this.baseScale * eased;
            this.mesh.scale.set(s, s, s);
            return;
        }

        if (mode === 'SCATTER') {
            target = this.posScatter;
        } else if (mode === 'FOCUS') {
            if (this.mesh === focusTargetMesh) {
                // Position photo in front of camera, centered
                const desiredWorldPos = new THREE.Vector3(0, 2, 35);
                const invMatrix = new THREE.Matrix4().copy(mainGroup.matrixWorld).invert();
                target = desiredWorldPos.applyMatrix4(invMatrix);
            } else {
                target = this.posScatter;
            }
        }

        // Movement Easing
        const lerpSpeed = (mode === 'FOCUS' && this.mesh === focusTargetMesh) ? 5.0 : 2.0;
        this.mesh.position.lerp(target, lerpSpeed * dt);

        // Rotation Logic
        if (mode === 'SCATTER') {
            this.mesh.rotation.x += this.spinSpeed.x * dt;
            this.mesh.rotation.y += this.spinSpeed.y * dt;
            this.mesh.rotation.z += this.spinSpeed.z * dt;
        } else if (mode === 'TREE') {
            // Keep photos facing outward
            if (this.type === 'PHOTO') {
                this.mesh.lookAt(0, this.mesh.position.y, 0);
                this.mesh.rotateY(Math.PI);
            } else {
                // Normal particles rotate
                this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, 0, dt);
                this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, 0, dt);
                this.mesh.rotation.y += 0.5 * dt;
            }
        } else if (mode === 'FOCUS') {
            if (this.mesh === focusTargetMesh) {
                // Face camera directly
                this.mesh.lookAt(camera.position);
            }
        }

        // Scale Logic
        let s = this.baseScale;
        if (this.isDust) {
            s = this.baseScale * (0.8 + 0.4 * Math.sin(clock.elapsedTime * 4 + this.mesh.id));
            if (mode === 'TREE') s = 0;
        } else if (mode === 'SCATTER' && this.type === 'PHOTO') {
            s = this.baseScale * 2.5;
        } else if (mode === 'FOCUS') {
            if (this.mesh === focusTargetMesh) s = 4.5;
            else s = this.baseScale * 0.8;
        }

        this.mesh.scale.lerp(new THREE.Vector3(s, s, s), 4 * dt);
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}

// --- 核心新功能：更新照片螺旋布局 ---
function updatePhotoLayout() {
    const photos = particleSystem.filter(p => p.type === 'PHOTO');
    const count = photos.length;
    if (count === 0) return;

    // 螺旋参数
    const h = CONFIG.particles.treeHeight * 0.9; // 使用树高的90%，避免太靠顶或底
    const bottomY = -h / 2;
    const stepY = h / count; // 垂直间距
    const loops = 3; // 缠绕圈数

    photos.forEach((p, i) => {
        // 1. 垂直高度：均匀分布
        const y = bottomY + stepY * i + stepY / 2; // 居中于每一格

        // 2. 计算当前高度在树整体中的比例 (0 = 底, 1 = 顶)
        const fullH = CONFIG.particles.treeHeight;
        const normalizedH = (y + fullH / 2) / fullH;

        // 3. 计算树在该高度的半径
        let rMax = CONFIG.particles.treeRadius * (1.0 - normalizedH);
        if (rMax < 1.0) rMax = 1.0;

        // 4. 设置照片半径（比树半径大一点，悬浮效果）
        const r = rMax + 3.0;

        // 5. 计算螺旋角度
        // normalizedH * Math.PI * 2 * loops -> 随高度增加角度
        // Math.PI/4 -> 初始角度偏移，美观用
        const angle = normalizedH * Math.PI * 2 * loops + (Math.PI / 4);

        p.posTree.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
    });
}

// --- CREATION ---
function createParticles() {
    const sphereGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const boxGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(0, 0.3, 0),
        new THREE.Vector3(0.1, 0.5, 0), new THREE.Vector3(0.3, 0.4, 0)
    ]);
    const candyGeo = new THREE.TubeGeometry(curve, 16, 0.08, 8, false);

    // Heart shape geometry
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.25);
    heartShape.bezierCurveTo(0, 0.25, 0, 0.5, 0.25, 0.5);
    heartShape.bezierCurveTo(0.5, 0.5, 0.5, 0.25, 0.5, 0);
    heartShape.bezierCurveTo(0.5, -0.25, 0.25, -0.5, 0, -0.75);
    heartShape.bezierCurveTo(-0.25, -0.5, -0.5, -0.25, -0.5, 0);
    heartShape.bezierCurveTo(-0.5, 0.25, -0.5, 0.5, -0.25, 0.5);
    heartShape.bezierCurveTo(0, 0.5, 0, 0.25, 0, 0.25);
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 3
    });
    heartGeo.center();
    heartGeo.scale(0.6, 0.6, 0.6);

    // Gift box geometry (box with ribbon)
    const giftBoxGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const ribbonGeo = new THREE.BoxGeometry(0.65, 0.1, 0.1);

    const goldMat = new THREE.MeshStandardMaterial({
        color: CONFIG.colors.champagneGold,
        metalness: 1.0,
        roughness: 0.1,
        envMapIntensity: 2.0,
        emissive: 0x664400,
        emissiveIntensity: 0.3
    });

    const greenMat = new THREE.MeshStandardMaterial({
        color: CONFIG.colors.deepGreen,
        metalness: 0.3,
        roughness: 0.7,
        emissive: 0x004411,
        emissiveIntensity: 0.25
    });

    const redMat = new THREE.MeshPhysicalMaterial({
        color: CONFIG.colors.accentRed,
        metalness: 0.4,
        roughness: 0.2,
        clearcoat: 1.0,
        emissive: 0x660011,
        emissiveIntensity: 0.35,
        transmission: 0.1,
        thickness: 0.5
    });

    const candyMat = new THREE.MeshStandardMaterial({ map: caneTexture, roughness: 0.4 });

    // Heart material - pink/red with glow
    const heartMat = new THREE.MeshStandardMaterial({
        color: 0xff1493,
        metalness: 0.3,
        roughness: 0.3,
        emissive: 0xff0066,
        emissiveIntensity: 0.5
    });

    // Gift box materials
    const giftRedMat = new THREE.MeshStandardMaterial({
        color: 0xcc0000,
        metalness: 0.2,
        roughness: 0.6,
        emissive: 0x330000,
        emissiveIntensity: 0.2
    });

    const giftGreenMat = new THREE.MeshStandardMaterial({
        color: 0x00aa00,
        metalness: 0.2,
        roughness: 0.6,
        emissive: 0x002200,
        emissiveIntensity: 0.2
    });

    const ribbonMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.2
    });

    for (let i = 0; i < CONFIG.particles.count; i++) {
        const rand = Math.random();
        let mesh, type;

        if (rand < 0.30) {
            mesh = new THREE.Mesh(boxGeo, greenMat);
            type = 'BOX';
        } else if (rand < 0.55) {
            mesh = new THREE.Mesh(boxGeo, goldMat);
            type = 'GOLD_BOX';
        } else if (rand < 0.75) {
            mesh = new THREE.Mesh(sphereGeo, goldMat);
            type = 'GOLD_SPHERE';
        } else if (rand < 0.82) {
            mesh = new THREE.Mesh(sphereGeo, redMat);
            type = 'RED';
        } else if (rand < 0.88) {
            mesh = new THREE.Mesh(candyGeo, candyMat);
            type = 'CANE';
        } else if (rand < 0.94) {
            // Heart
            mesh = new THREE.Mesh(heartGeo, heartMat);
            type = 'HEART';
        } else {
            // Gift box with ribbon
            const giftGroup = new THREE.Group();
            const box = new THREE.Mesh(giftBoxGeo, Math.random() > 0.5 ? giftRedMat : giftGreenMat);
            const ribbon1 = new THREE.Mesh(ribbonGeo, ribbonMat);
            const ribbon2 = new THREE.Mesh(ribbonGeo, ribbonMat);
            ribbon2.rotation.y = Math.PI / 2;
            giftGroup.add(box);
            giftGroup.add(ribbon1);
            giftGroup.add(ribbon2);
            mesh = giftGroup;
            type = 'GIFT';
        }

        const s = 0.4 + Math.random() * 0.5;
        mesh.scale.set(s, s, s);
        mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);

        mainGroup.add(mesh);
        particleSystem.push(new Particle(mesh, type, false));
    }

    // --- 五角星生成逻辑 (Star Generation) ---
    const starShape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.5;
    const innerRadius = 0.7; // 调整内径以获得完美的五角星形状

    for (let i = 0; i < points * 2; i++) {
        // 计算角度，+PI/2 确保一个角朝上
        const angle = (i * Math.PI) / points + Math.PI / 2;
        const r = (i % 2 === 0) ? outerRadius : innerRadius;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) starShape.moveTo(x, y);
        else starShape.lineTo(x, y);
    }
    starShape.closePath();

    // 使用 ExtrudeGeometry 创建有厚度的3D五角星
    const starGeo = new THREE.ExtrudeGeometry(starShape, {
        depth: 0.4,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 2
    });
    starGeo.center(); // 居中几何体

    const starMat = new THREE.MeshStandardMaterial({
        color: 0xffee88,
        emissive: 0xffbb00,
        emissiveIntensity: 1.2,
        metalness: 1.0,
        roughness: 0.1
    });
    const star = new THREE.Mesh(starGeo, starMat);

    // Add point light to star for extra glow
    const starLight = new THREE.PointLight(0xffdd00, 2, 12);
    star.add(starLight);

    // 放置在树顶
    star.position.set(0, CONFIG.particles.treeHeight / 2 + 1.2, 0);
    mainGroup.add(star);
    window.star = star; // Store for animation

    mainGroup.add(photoMeshGroup);
}

function createDust() {
    const geo = new THREE.TetrahedronGeometry(0.08, 0);

    for (let i = 0; i < CONFIG.particles.dustCount; i++) {
        // Random colors for magical sparkle effect
        const colors = [0xffeebb, 0xffddaa, 0xffffff, 0xaaddff, 0xffaaff];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const mat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.7 + Math.random() * 0.3
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.scale.setScalar(0.5 + Math.random());
        mainGroup.add(mesh);
        particleSystem.push(new Particle(mesh, 'DUST', true));
    }
}

function createDefaultPhotos() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#eebb66'; ctx.lineWidth = 15; ctx.strokeRect(20, 20, 472, 472);
    ctx.font = '500 60px Times New Roman'; ctx.fillStyle = '#eebb66';
    ctx.textAlign = 'center';

    ctx.fillText("WISH U", 256, 190);
    ctx.fillText("HAPPY", 256, 260);
    ctx.fillText("WP :)", 256, 330);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    addPhotoToScene(tex);
}

function addPhotoToScene(texture) {
    const frameGeo = new THREE.BoxGeometry(1.4, 1.4, 0.05);
    const frameMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.champagneGold, metalness: 1.0, roughness: 0.1 });
    const frame = new THREE.Mesh(frameGeo, frameMat);

    const photoGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const photoMat = new THREE.MeshBasicMaterial({ map: texture });
    const photo = new THREE.Mesh(photoGeo, photoMat);
    photo.position.z = 0.04;

    const group = new THREE.Group();
    group.add(frame);
    group.add(photo);

    const s = 0.8;
    group.scale.set(s, s, s);

    photoMeshGroup.add(group);
    particleSystem.push(new Particle(group, 'PHOTO', false));

    // 每添加一张照片，重新计算螺旋布局
    updatePhotoLayout();
}

function handleImageUpload(e) {
    const files = e.target.files;
    if (!files.length) return;
    Array.from(files).forEach(f => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            new THREE.TextureLoader().load(ev.target.result, (t) => {
                t.colorSpace = THREE.SRGBColorSpace;
                addPhotoToScene(t);
            });
        }
        reader.readAsDataURL(f);
    });
}

// --- MEDIAPIPE ---
async function initMediaPipe() {
    try {
        video = document.getElementById('webcam');
        webcamCanvas = document.getElementById('webcam-preview');
        webcamCtx = webcamCanvas.getContext('2d');

        webcamCanvas.width = 280;
        webcamCanvas.height = 210;

        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1
        });

        if (navigator.mediaDevices?.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.addEventListener("loadeddata", predictWebcam);
        }
    } catch (e) {
        console.warn('MediaPipe/Webcam init failed:', e.message);
        const webcamWrapper = document.getElementById('webcam-wrapper');
        if (webcamWrapper) webcamWrapper.style.display = 'none';
    }
}

let lastVideoTime = -1;
async function predictWebcam() {
    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        if (handLandmarker) {
            const result = handLandmarker.detectForVideo(video, performance.now());
            processGestures(result);
        }
    }
    requestAnimationFrame(predictWebcam);
}

function processGestures(result) {
    if (result.landmarks && result.landmarks.length > 0) {
        STATE.hand.detected = true;
        const lm = result.landmarks[0];
        STATE.hand.x = (lm[9].x - 0.5) * 2;
        STATE.hand.y = (lm[9].y - 0.5) * 2;

        const thumb = lm[4]; const index = lm[8]; const wrist = lm[0];
        const pinchDist = Math.hypot(thumb.x - index.x, thumb.y - index.y);
        const tips = [lm[8], lm[12], lm[16], lm[20]];
        let avgDist = 0;
        tips.forEach(t => avgDist += Math.hypot(t.x - wrist.x, t.y - wrist.y));
        avgDist /= 4;

        if (pinchDist < 0.05) {
            if (STATE.mode !== 'FOCUS') {
                STATE.mode = 'FOCUS';
                const photos = particleSystem.filter(p => p.type === 'PHOTO');
                if (photos.length) STATE.focusTarget = photos[Math.floor(Math.random() * photos.length)].mesh;
            }
        } else if (avgDist < 0.25) {
            STATE.mode = 'TREE';
            STATE.focusTarget = null;
        } else if (avgDist > 0.4) {
            STATE.mode = 'SCATTER';
            STATE.focusTarget = null;
        }
    } else {
        STATE.hand.detected = false;
    }
}

function setupEvents() {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });
    document.getElementById('file-input').addEventListener('change', handleImageUpload);

    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'h') {
            const controlsUI = document.querySelector('.upload-wrapper');
            if (controlsUI) controlsUI.classList.toggle('ui-hidden');

            const webcam = document.getElementById('webcam-wrapper');
            if (webcam) webcam.classList.toggle('ui-hidden');
        }

        // Toggle auto-rotate with 'R' key
        if (e.key.toLowerCase() === 'r' && controls) {
            controls.autoRotate = !controls.autoRotate;
        }

        // Reset camera with 'Space' key
        if (e.key === ' ' && controls) {
            controls.reset();
        }
    });

    // Mouse interaction hints already set by IS_MOBILE check above
}

// Performance monitoring
let frameCount = 0;
let lastFPSUpdate = 0;
let currentFPS = 0;

function animate() {
    requestAnimationFrame(animate);

    // Cap delta time to prevent lag spikes
    const dt = Math.min(clock.getDelta(), 0.1);
    const time = clock.elapsedTime;

    // FPS Monitoring for A30 optimization
    frameCount++;
    if (time - lastFPSUpdate > 1.0) {
        currentFPS = frameCount / (time - lastFPSUpdate);
        frameCount = 0;
        lastFPSUpdate = time;

        // Auto-adjust quality based on FPS
        if (currentFPS < 45 && CONFIG.performance.enableBloom) {
            CONFIG.performance.bloomResolution *= 0.9;
            console.log('🔧 Auto-reducing bloom resolution for performance');
        }
    }

    // Update star field twinkling (optimized)
    if (starField?.material?.uniforms) {
        starField.material.uniforms.time.value = time;
    }

    // Update mouse controls (cached)
    controls?.update();

    // Dynamic lighting effects - A30 optimized (reduced frequency)
    if (frameCount % 2 === 0) { // Update every other frame
        if (window.innerLight) {
            window.innerLight.intensity = 2 + Math.sin(time * 2) * 0.5;
            // Cycle through colors for enhanced effect
            const colorPhase = (time * 0.3) % 5;
            if (colorPhase < 1) {
                window.innerLight.color.setHex(0xffaa00);
            } else if (colorPhase < 2) {
                window.innerLight.color.setHex(0xffffff);
            } else if (colorPhase < 3) {
                window.innerLight.color.setHex(0x4488ff);
            } else if (colorPhase < 4) {
                window.innerLight.color.setHex(0xaa44ff);
            } else {
                window.innerLight.color.setHex(0xff3366);
            }
        }

        if (window.spotBlue) {
            window.spotBlue.intensity = 600 + Math.sin(time * 1.5) * 150;
        }

        if (window.spotPurple) {
            window.spotPurple.intensity = 500 + Math.cos(time * 1.8) * 120;
        }

        if (window.spotRed) {
            window.spotRed.intensity = 450 + Math.sin(time * 2.2) * 100;
        }
    }

    // Animate star rotation and glow
    if (window.star) {
        window.star.rotation.z = time * 0.5;
        window.star.rotation.y = time * 0.3;
    }

    // Dynamic bloom effect - more subtle
    if (window.bloomPass) {
        window.bloomPass.strength = 1.2 + Math.sin(time * 0.8) * 0.15;
    }

    // Handle intro animation
    if (STATE.mode === 'INTRO') {
        STATE.introProgress += dt * 0.5; // Takes ~2 seconds
        if (STATE.introProgress >= 1.5) {
            STATE.mode = 'TREE';
            STATE.introProgress = 1;
        }
        // Gentle rotation during intro
        mainGroup.rotation.y = time * 0.2;
    } else {
        // Rotation Logic - only apply if not using mouse controls
        if (STATE.mode === 'SCATTER' && STATE.hand.detected) {
            const targetRotY = STATE.hand.x * Math.PI * 0.9;
            const targetRotX = STATE.hand.y * Math.PI * 0.25;
            STATE.rotation.y += (targetRotY - STATE.rotation.y) * 3.0 * dt;
            STATE.rotation.x += (targetRotX - STATE.rotation.x) * 3.0 * dt;
            mainGroup.rotation.y = STATE.rotation.y;
            mainGroup.rotation.x = STATE.rotation.x;
        } else if (!controls || !controls.enabled) {
            // Only auto-rotate if mouse controls are disabled
            if (STATE.mode === 'TREE') {
                STATE.rotation.y += 0.3 * dt;
                STATE.rotation.x += (0 - STATE.rotation.x) * 2.0 * dt;
            } else {
                STATE.rotation.y += 0.1 * dt;
            }
            mainGroup.rotation.y = STATE.rotation.y;
            mainGroup.rotation.x = STATE.rotation.x;
        }
    }

    particleSystem.forEach(p => p.update(dt, STATE.mode, STATE.focusTarget, STATE.introProgress));
    composer.render();
}

// Music control functions
let musicPlaying = false;
const bgMusic = document.getElementById('bg-music');
const playIcon = document.getElementById('music-icon-play');
const pauseIcon = document.getElementById('music-icon-pause');
const musicControl = document.getElementById('music-control');

function toggleMusic() {
    if (musicPlaying) {
        bgMusic.pause();
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    } else {
        bgMusic.play().catch(e => console.log('Music play failed:', e));
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    }
    musicPlaying = !musicPlaying;
}

// Add event listener for music control
musicControl.addEventListener('click', toggleMusic);

// Auto-play music after user interaction
let musicInitialized = false;
document.addEventListener('click', function initMusic() {
    if (!musicInitialized) {
        bgMusic.play().catch(e => console.log('Auto-play failed:', e));
        musicPlaying = true;
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        musicInitialized = true;
    }
}, { once: true });

// Christmas card functions
const christmasCard = document.getElementById('christmas-card');
const cardCloseBtn = document.getElementById('card-close-btn');

function showCard() {
    const card = document.getElementById('christmas-card');
    if (card) {
        card.classList.add('show');
    }
}

function closeCard() {
    christmasCard.classList.remove('show');
    STATE.mode = 'INTRO';
    STATE.introProgress = 0;
}

cardCloseBtn.addEventListener('click', closeCard);
setTimeout(showCard, 2000);

// ===== THÊM CÁC HIỆU ỨNG MỚI =====

// 1. Tạo hiệu ứng tuyết rơi
function createSnowEffect() {
    const snowflakes = ['❄', '❅', '❆', '✻', '✼', '❋'];

    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerHTML = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';
        snowflake.style.opacity = Math.random();
        snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';

        document.body.appendChild(snowflake);

        setTimeout(() => {
            snowflake.remove();
        }, 5000);
    }

    // Tạo tuyết rơi liên tục
    setInterval(createSnowflake, IS_MOBILE ? 800 : 300);
}

// 2. Tạo hiệu ứng aurora background
function createAuroraEffect() {
    const aurora = document.createElement('div');
    aurora.className = 'aurora';
    document.body.appendChild(aurora);
}

// 3. Tạo các hạt ma thuật bay lơ lửng
function createMagicParticles() {
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'magic-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';

        // Random colors
        const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = `radial-gradient(circle, ${color}, transparent)`;

        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 6000);
    }

    // Tạo hạt ma thuật liên tục
    setInterval(createParticle, 800);
}

// 4. Hiệu ứng cursor trail
function createCursorTrail() {
    const trail = [];
    const trailLength = 20;

    document.addEventListener('mousemove', (e) => {
        const dot = document.createElement('div');
        dot.style.position = 'fixed';
        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';
        dot.style.width = '4px';
        dot.style.height = '4px';
        dot.style.background = '#ffd700';
        dot.style.borderRadius = '50%';
        dot.style.pointerEvents = 'none';
        dot.style.zIndex = '1000';
        dot.style.transition = 'all 0.5s ease-out';

        document.body.appendChild(dot);
        trail.push(dot);

        if (trail.length > trailLength) {
            const oldDot = trail.shift();
            oldDot.remove();
        }

        setTimeout(() => {
            dot.style.opacity = '0';
            dot.style.transform = 'scale(0)';
        }, 100);

        setTimeout(() => {
            if (dot.parentNode) dot.remove();
        }, 600);
    });
}

// 5. Hiệu ứng click ripple
function createClickRipple() {
    document.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        ripple.style.width = '0px';
        ripple.style.height = '0px';
        ripple.style.background = 'radial-gradient(circle, rgba(255, 215, 0, 0.6), transparent)';
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '999';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.transition = 'all 0.6s ease-out';

        document.body.appendChild(ripple);

        setTimeout(() => {
            ripple.style.width = '100px';
            ripple.style.height = '100px';
            ripple.style.opacity = '0';
        }, 10);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}

// 6. Hiệu ứng keyboard glow
function createKeyboardEffects() {
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'r') {
            // Tạo hiệu ứng flash khi nhấn R
            const flash = document.createElement('div');
            flash.style.position = 'fixed';
            flash.style.top = '0';
            flash.style.left = '0';
            flash.style.width = '100%';
            flash.style.height = '100%';
            flash.style.background = 'rgba(255, 215, 0, 0.1)';
            flash.style.pointerEvents = 'none';
            flash.style.zIndex = '998';
            flash.style.transition = 'opacity 0.3s ease-out';

            document.body.appendChild(flash);

            setTimeout(() => {
                flash.style.opacity = '0';
            }, 50);

            setTimeout(() => {
                flash.remove();
            }, 350);
        }
    });
}

// ===== 🎆 FIREWORKS ON DOUBLE-CLICK =====
function initFireworks() {
    const colors = ['#ff0044', '#ffd700', '#00ff88', '#4488ff', '#ff44ff', '#ff8800', '#00ffff'];

    function launchFirework(x, y) {
        const count = 36;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const color2 = colors[Math.floor(Math.random() * colors.length)];

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const c = Math.random() > 0.5 ? color : color2;
            createFireworkParticle(x, y, vx, vy, c);
        }
        // Inner ring
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + 0.2;
            const speed = 1 + Math.random() * 2;
            createFireworkParticle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ffffff');
        }
    }

    function createFireworkParticle(x, y, vx, vy, color) {
        const el = document.createElement('div');
        el.className = 'firework-particle';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.background = color;
        el.style.boxShadow = `0 0 6px ${color}, 0 0 12px ${color}`;
        document.body.appendChild(el);

        let px = x, py = y, life = 1;
        const gravity = 0.08;
        let vyy = vy;

        function tick() {
            px += vx;
            vyy += gravity;
            py += vyy;
            life -= 0.015;

            if (life <= 0) { el.remove(); return; }

            el.style.left = px + 'px';
            el.style.top = py + 'px';
            el.style.opacity = life;
            el.style.transform = `scale(${life})`;

            // Trail
            if (Math.random() > 0.6) {
                const trail = document.createElement('div');
                trail.className = 'firework-trail';
                trail.style.left = px + 'px';
                trail.style.top = py + 'px';
                trail.style.background = color;
                document.body.appendChild(trail);
                setTimeout(() => trail.remove(), 400);
            }

            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    document.addEventListener('dblclick', (e) => {
        launchFirework(e.clientX, e.clientY);
        // Launch 2 more nearby for a spectacular burst
        setTimeout(() => launchFirework(e.clientX - 60 + Math.random() * 120, e.clientY - 40), 200);
        setTimeout(() => launchFirework(e.clientX - 60 + Math.random() * 120, e.clientY - 60), 400);
    });

    // On mobile: long press for firework
    let pressTimer = null;
    document.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => {
            const t = e.touches[0];
            launchFirework(t.clientX, t.clientY);
            setTimeout(() => launchFirework(t.clientX - 40, t.clientY - 30), 200);
            setTimeout(() => launchFirework(t.clientX + 40, t.clientY - 50), 400);
        }, 600);
    }, { passive: true });
    document.addEventListener('touchend', () => clearTimeout(pressTimer));
    document.addEventListener('touchmove', () => clearTimeout(pressTimer));
}

// ===== 🎅 FLYING SANTA SLEIGH =====
function initSantaSleigh() {
    const sleighEmojis = ['🎅🦌🦌🛷', '🎅✨🛷', '🎅🎁🛷'];

    function launchSanta() {
        const sleigh = document.createElement('div');
        sleigh.className = 'santa-sleigh';
        sleigh.innerHTML = sleighEmojis[Math.floor(Math.random() * sleighEmojis.length)];
        sleigh.style.top = (5 + Math.random() * 15) + '%';
        document.body.appendChild(sleigh);

        // Leave sparkle trail
        const trailEmojis = ['✨', '⭐', '🌟', '💫'];
        let trailInterval = setInterval(() => {
            const rect = sleigh.getBoundingClientRect();
            if (rect.left > window.innerWidth + 200) {
                clearInterval(trailInterval);
                return;
            }
            const trail = document.createElement('div');
            trail.className = 'santa-trail';
            trail.innerHTML = trailEmojis[Math.floor(Math.random() * trailEmojis.length)];
            trail.style.left = (rect.left + rect.width * 0.3) + 'px';
            trail.style.top = (rect.top + rect.height * 0.5) + 'px';
            document.body.appendChild(trail);
            setTimeout(() => trail.remove(), 2000);
        }, 150);

        setTimeout(() => sleigh.remove(), 9000);
    }

    // First Santa after 15 seconds, then every 45-90 seconds
    setTimeout(launchSanta, 15000);
    setInterval(() => {
        if (Math.random() > 0.3) launchSanta();
    }, 45000 + Math.random() * 45000);
}

// ===== 🏮 WISH LANTERNS =====
function initWishLanterns() {
    const wishBtn = document.getElementById('wish-btn');
    const wishModal = document.getElementById('wish-modal');
    const wishInput = document.getElementById('wish-input');
    const wishSend = document.getElementById('wish-send');

    if (!wishBtn || !wishModal) return;

    wishBtn.addEventListener('click', () => {
        wishModal.classList.toggle('show');
        if (wishModal.classList.contains('show')) {
            setTimeout(() => wishInput.focus(), 300);
        }
    });

    function releaseLantern(text) {
        const lantern = document.createElement('div');
        lantern.className = 'wish-lantern';
        lantern.style.left = (20 + Math.random() * 60) + '%';
        lantern.style.bottom = '5%';

        lantern.innerHTML = `
            <div class="wish-lantern-body">
                <div class="wish-lantern-text">${text}</div>
                <div class="wish-lantern-flame"></div>
            </div>
        `;

        document.body.appendChild(lantern);
        setTimeout(() => lantern.remove(), 12000);
    }

    wishSend.addEventListener('click', () => {
        const text = wishInput.value.trim();
        if (!text) return;
        releaseLantern(text);
        wishInput.value = '';
        wishModal.classList.remove('show');
    });

    wishInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') wishSend.click();
    });

    // Auto lanterns with pre-set wishes
    const autoWishes = [
        'Bình an 🕊️', 'Hạnh phúc ❤️', 'An khang 🏠',
        'Sức khỏe 💪', 'Niềm vui ☀️', 'May mắn 🍀'
    ];
    setTimeout(() => {
        releaseLantern(autoWishes[Math.floor(Math.random() * autoWishes.length)]);
    }, 20000);
    setInterval(() => {
        if (Math.random() > 0.5) {
            releaseLantern(autoWishes[Math.floor(Math.random() * autoWishes.length)]);
        }
    }, 60000);
}

// ===== ⏰ CHRISTMAS COUNTDOWN =====
function initCountdown() {
    const timerEl = document.getElementById('countdown-timer');
    const labelEl = document.getElementById('countdown-label');
    if (!timerEl) return;

    function update() {
        const now = new Date();
        let christmas = new Date(now.getFullYear(), 11, 25); // Dec 25
        if (now > christmas) christmas = new Date(now.getFullYear() + 1, 11, 25);

        const diff = christmas - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        if (days === 0 && hours === 0 && mins === 0 && secs === 0) {
            timerEl.textContent = '🎄 MERRY CHRISTMAS! 🎄';
            labelEl.textContent = '';
        } else {
            timerEl.textContent = `${days}d ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
    }

    update();
    setInterval(update, 1000);
}

// Khởi tạo tất cả hiệu ứng
function initAllEffects() {
    createSnowEffect();
    createAuroraEffect();
    if (!IS_MOBILE) {
        createMagicParticles();
        createCursorTrail();
    }
    createClickRipple();
    if (!IS_MOBILE) createKeyboardEffects();
    initFireworks();
    initSantaSleigh();
    initWishLanterns();
    initCountdown();
}

// A30 GPU Performance Monitor
function setupPerformanceMonitor() {
    // Add performance stats to console
    setInterval(() => {
        if (renderer && renderer.info) {
            console.log('🚀 A30 Performance Stats:', {
                FPS: Math.round(currentFPS),
                'Draw Calls': renderer.info.render.calls,
                'Triangles': renderer.info.render.triangles,
                'Geometries': renderer.info.memory.geometries,
                'Textures': renderer.info.memory.textures,
                'GPU Memory': `${(renderer.info.memory.geometries + renderer.info.memory.textures)} objects`
            });
        }
    }, 5000); // Every 5 seconds

    // Expose performance controls to console
    window.GPU_CONTROLS = {
        setParticleCount: (count) => {
            CONFIG.particles.count = count;
            console.log(`🔧 Particle count set to: ${count}`);
        },
        toggleBloom: () => {
            CONFIG.performance.enableBloom = !CONFIG.performance.enableBloom;
            console.log(`🌟 Bloom ${CONFIG.performance.enableBloom ? 'enabled' : 'disabled'}`);
        },
        setPixelRatio: (ratio) => {
            renderer.setPixelRatio(ratio);
            console.log(`📱 Pixel ratio set to: ${ratio}`);
        },
        getCurrentFPS: () => currentFPS,
        getGPUInfo: () => renderer.info
    };

    console.log('🎮 A30 GPU Controls available in window.GPU_CONTROLS');
    console.log('Example: GPU_CONTROLS.setParticleCount(1000)');
}

// Khởi tạo hiệu ứng sau khi DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    initAllEffects();

    // Guide overlay logic
    const guideOverlay = document.getElementById('guide-overlay');
    const guideCloseBtn = document.getElementById('guide-close-btn');
    const guideBtn = document.getElementById('guide-btn');

    function showGuide() {
        if (guideOverlay) guideOverlay.classList.add('show');
    }

    function hideGuide() {
        if (guideOverlay) guideOverlay.classList.remove('show');
    }

    if (guideCloseBtn) guideCloseBtn.addEventListener('click', hideGuide);
    if (guideBtn) guideBtn.addEventListener('click', showGuide);

    // Auto-show guide on first visit
    if (!localStorage.getItem('noelnoem_guide_seen')) {
        setTimeout(showGuide, 3000);
        localStorage.setItem('noelnoem_guide_seen', '1');
    }
});

console.log('🎄 Merry Christmas! Device:', IS_MOBILE ? 'Mobile' : 'Desktop');
console.log('Config:', CONFIG);

init().catch(e => console.error('Init failed:', e));
