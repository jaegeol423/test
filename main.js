import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- 기본 설정 ----------------------------------------------------------------
const canvasContainer = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
canvasContainer.appendChild(renderer.domElement);

camera.position.set(0, 0, 25); 

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false;
controls.enablePan = false;
controls.enableZoom = true;
controls.update();

const textureLoader = new THREE.TextureLoader();
const bodyGroup = new THREE.Group();
const clickTargets = new THREE.Group();
scene.add(bodyGroup);
scene.add(clickTargets);

// --- 크로마키 쉐이더 (초록색 배경 제거 최적화) ------------------------------------
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform sampler2D map;
    uniform vec3 keyColor;
    uniform float similarity;
    uniform float smoothness;
    varying vec2 vUv;
    void main() {
        vec4 videoColor = texture2D(map, vUv);
        float d = distance(videoColor.rgb, keyColor);
        float alpha = smoothstep(similarity, similarity + smoothness, d);
        gl_FragColor = vec4(videoColor.rgb, videoColor.a * alpha);
        if(gl_FragColor.a < 0.1) discard;
    }
`;

textureLoader.load(
    'body.png', 
    (texture) => {
        console.log('Texture loaded successfully');
        const aspect = texture.image.width / texture.image.height;
        const height = 35; 
        const width = height * aspect;
        
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                map: { value: texture },
                keyColor: { value: new THREE.Color(0x00ff00) },
                similarity: { value: 0.35 },
                smoothness: { value: 0.05 }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const bodyPlane = new THREE.Mesh(geometry, material);
        bodyGroup.add(bodyPlane);

        createClickTargets();
    },
    undefined,
    (err) => {
        console.error('Error loading body.png:', err);
        const fallbackGeo = new THREE.PlaneGeometry(15, 30);
        const fallbackMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        bodyGroup.add(new THREE.Mesh(fallbackGeo, fallbackMat));
    }
);

const bodyPartMapping = {}; 

function createClickTargets() {
    const targetMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00f2ff, 
        transparent: true, 
        opacity: 0.0,
        visible: true 
    });

    // 모든 히트박스 크기를 작게 통일 (기존 대비 축소)
    const unifiedSize = 0.8;

    // 요청하신 대로 정밀 좌표 재조정 (손목과 무릎을 더 중앙으로)
    const targets = {
        'neck': { pos: [0, 12.0, 0.2], part: '목' },
        'shoulder_l': { pos: [4.2, 9.0, 0.2], part: '어깨' },
        'shoulder_r': { pos: [-4.2, 9.0, 0.2], part: '어깨' },
        'waist': { pos: [0, 4.0, 0.2], part: '등' },
        'wrist_l': { pos: [5.0, 3.0, 0.2], part: '팔/손목' },   // 중앙 쪽으로 더 이동 (6.5 -> 5.0)
        'wrist_r': { pos: [-5.0, 3.0, 0.2], part: '팔/손목' }, // 중앙 쪽으로 더 이동 (-6.5 -> -5.0)
        'knee_l': { pos: [1.8, -3.0, 0.2], part: '다리' },     // 중앙 쪽으로 더 이동 (3.0 -> 1.8)
        'knee_r': { pos: [-1.8, -3.0, 0.2], part: '다리' },    // 중앙 쪽으로 더 이동 (-3.0 -> -1.8)
    };

    for (const [name, data] of Object.entries(targets)) {
        const geo = new THREE.SphereGeometry(unifiedSize, 16, 16);
        const mesh = new THREE.Mesh(geo, targetMaterial.clone());
        mesh.position.set(...data.pos);
        mesh.name = name;
        clickTargets.add(mesh);
        bodyPartMapping[name] = data.part;
    }
}

// --- 스트레칭 가이드 로직 ------------------------------------------------------
const stretches = [
    { bodyPart: '목', title: '거북목 스트레칭', description: '턱을 당겨 목 뒤쪽을 늘려주는 느낌으로 15초 유지하세요.' },
    { bodyPart: '어깨', title: '어깨 으쓱하기', description: '양 어깨를 귀 쪽으로 최대한 끌어올렸다가 천천히 내리기를 반복합니다.' },
    { bodyPart: '등', title: '고양이-소 자세', description: '네발 기기 자세에서 등을 둥글게 말았다가 오목하게 만들기를 반복합니다.' },
    { bodyPart: '팔/손목', title: '손목 굴곡/신전', description: '팔을 앞으로 뻗어 손가락을 위, 아래로 당겨 손목을 스트레칭합니다.' },
    { bodyPart: '다리', title: '장요근 스트레칭', description: '한쪽 무릎을 꿇고 다른 쪽 다리를 앞으로 뻗어 골반 앞쪽을 늘려줍니다.' },
];

const cardContainer = document.querySelector('.card-container');

function displayStretches(filter = 'all') {
    cardContainer.innerHTML = '';
    const filteredStretches = filter === 'all' ? stretches : stretches.filter(s => s.bodyPart === filter);

    filteredStretches.forEach(stretch => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<h3>${stretch.title}</h3><p>${stretch.description}</p>`;
        cardContainer.appendChild(card);
    });
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function updateMouse(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onMouseMove(event) {
    updateMouse(event);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickTargets.children);

    clickTargets.children.forEach(child => child.material.opacity = 0);
    if (intersects.length > 0) {
        intersects[0].object.material.opacity = 0.3;
        canvasContainer.style.cursor = 'pointer';
    } else {
        canvasContainer.style.cursor = 'default';
    }
}

function onClick(event) {
    updateMouse(event);
    raycaster.setFromCamera(mouse, camera); 
    const intersects = raycaster.intersectObjects(clickTargets.children);

    if (intersects.length > 0) {
        const category = bodyPartMapping[intersects[0].object.name];
        displayStretches(category);
        intersects[0].object.material.opacity = 0.8;
        setTimeout(() => intersects[0].object.material.opacity = 0.3, 200);
    }
}

document.getElementById('show-all-btn').addEventListener('click', () => displayStretches('all'));
canvasContainer.addEventListener('mousemove', onMouseMove);
canvasContainer.addEventListener('click', onClick);

function animate(time) {
    requestAnimationFrame(animate);
    if (bodyGroup.children.length > 0) {
        bodyGroup.position.y = Math.sin(time * 0.002) * 0.15;
        clickTargets.position.y = bodyGroup.position.y;
    }
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
});

displayStretches();
animate(0);
