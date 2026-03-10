import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- 기본 설정 ----------------------------------------------------------------
const canvasContainer = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
canvasContainer.appendChild(renderer.domElement);

camera.position.set(0, 0, 10); // 카메라 거리를 조금 더 멀리하여 큰 이미지를 담음

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false;
controls.enablePan = false;
controls.enableZoom = true;

const textureLoader = new THREE.TextureLoader();
const bodyGroup = new THREE.Group();
const clickTargets = new THREE.Group();
scene.add(bodyGroup);
scene.add(clickTargets);

// --- 크로마키 쉐이더 (초록색 배경 제거) -------------------------------------------
const chromaKeyShader = {
    uniforms: {
        texture: { value: null },
        colorToReplace: { value: new THREE.Color(0x00ff00) }, // 제거할 초록색
        threshold: { value: 0.4 } // 색상 제거 민감도
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D texture;
        uniform vec3 colorToReplace;
        uniform float threshold;
        varying vec2 vUv;
        void main() {
            vec4 texColor = texture2D(texture, vUv);
            float diff = distance(texColor.rgb, colorToReplace);
            if (diff < threshold) {
                discard; // 초록색 배경 제거
            }
            gl_FragColor = texColor;
        }
    `
};

textureLoader.load('body.png', (texture) => {
    const aspect = texture.image.width / texture.image.height;
    const height = 9; // 사진 크기를 6에서 9로 대폭 확대
    const width = height * aspect;
    
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            ...chromaKeyShader.uniforms,
            texture: { value: texture }
        },
        vertexShader: chromaKeyShader.vertexShader,
        fragmentShader: chromaKeyShader.fragmentShader,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    const bodyPlane = new THREE.Mesh(geometry, material);
    bodyGroup.add(bodyPlane);

    createClickTargets();
});

const bodyPartMapping = {}; 

function createClickTargets() {
    const targetMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00f2ff, 
        transparent: true, 
        opacity: 0.0,
        visible: true 
    });

    // 사진 크기(height=9)에 맞춘 정밀 좌표 재조정
    const targets = {
        'head': { pos: [0, 3.5, 0.2], size: 0.6, part: '목' },
        'shoulder_l': { pos: [1.1, 2.2, 0.2], size: 0.5, part: '어깨' },
        'shoulder_r': { pos: [-1.1, 2.2, 0.2], size: 0.5, part: '어깨' },
        'chest': { pos: [0, 1.5, 0.2], size: 1.0, part: '등' },
        'arm_l': { pos: [2.0, 0.8, 0.2], size: 0.5, part: '팔/손목' },
        'arm_r': { pos: [-2.0, 0.8, 0.2], size: 0.5, part: '팔/손목' },
        'leg_l': { pos: [0.8, -1.8, 0.2], size: 0.7, part: '다리' },
        'leg_r': { pos: [-0.8, -1.8, 0.2], size: 0.7, part: '다리' },
    };

    for (const [name, data] of Object.entries(targets)) {
        const geo = new THREE.SphereGeometry(data.size, 16, 16);
        const mesh = new THREE.Mesh(geo, targetMaterial.clone());
        mesh.position.set(...data.pos);
        mesh.name = name;
        clickTargets.add(mesh);
        bodyPartMapping[name] = data.part;
    }
}

// --- 나머지 로직 (데이터 표시, 이벤트 등)은 동일하게 유지 ---------------------------
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
        clickTargets.position.y = bodyGroup.position.y; // 히트박스도 함께 움직임
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
