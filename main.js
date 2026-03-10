import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- 기본 설정 ----------------------------------------------------------------
const canvasContainer = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
canvasContainer.appendChild(renderer.domElement);

camera.position.set(0, 0, 7);

// --- 컨트롤 -----------------------------------------------------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, -1, 0);

// --- 조명 -------------------------------------------------------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// --- 재질 (Materials) ------------------------------------------------------
const defaultMaterial = new THREE.MeshStandardMaterial({
    color: 0x00aaff,
    emissive: 0x0077cc,
    emissiveIntensity: 0.5,
    wireframe: true,
});
const hoverMaterial = new THREE.MeshStandardMaterial({
    color: 0xffaa00, 
    emissive: 0xffaa00,
    emissiveIntensity: 1.0,
    wireframe: true,
});

// --- 3D 모델 및 클릭 타겟 -----------------------------------------------------
const loader = new GLTFLoader();
let model;
const clickTargets = new THREE.Group();
const bodyPartMapping = {}; 

loader.load(
    'https://threejs.org/examples/models/gltf/Human.gltf', 
    (gltf) => {
        model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5);
        model.position.y = -2.5;

        model.traverse((child) => {
            if (child.isMesh) {
                child.material = defaultMaterial;
            }
        });

        scene.add(model);
        createClickTargets();
    },
    undefined,
    (error) => console.error('Error loading model:', error)
);

function createClickTargets() {
    const targetGeometry = new THREE.SphereGeometry(0.4); 
    const targetMaterial = new THREE.MeshBasicMaterial({ visible: false });

    // 사용자가 설정한 원래 좌표값 복구
    const targets = {
        'head_target': { position: new THREE.Vector3(0, 1.8, 0), bodyPart: '목' },
        'shoulder_l_target': { position: new THREE.Vector3(0.8, 1.2, 0), bodyPart: '어깨' },
        'shoulder_r_target': { position: new THREE.Vector3(-0.8, 1.2, 0), bodyPart: '어깨' },
        'back_target': { position: new THREE.Vector3(0, 0.5, -0.2), bodyPart: '등' },
        'arm_l_target': { position: new THREE.Vector3(1.5, 0.2, 0), bodyPart: '팔/손목' },
        'arm_r_target': { position: new THREE.Vector3(-1.5, 0.2, 0), bodyPart: '팔/손목' },
        'leg_l_target': { position: new THREE.Vector3(0.5, -1.5, 0), bodyPart: '다리' },
        'leg_r_target': { position: new THREE.Vector3(-0.5, -1.5, 0), bodyPart: '다리' },
    };

    for (const [name, { position, bodyPart }] of Object.entries(targets)) {
        const target = new THREE.Mesh(targetGeometry.clone(), targetMaterial);
        target.position.copy(position);
        target.name = name;
        clickTargets.add(target);
        bodyPartMapping[name] = bodyPart;
    }
    
    model.add(clickTargets); 
}

// --- 스트레칭 데이터 ----------------------------------------------------------
const stretches = [
    { bodyPart: '목', title: '거북목 스트레칭', description: '턱을 당겨 목 뒤쪽을 늘려주는 느낌으로 15초 유지하세요.' },
    { bodyPart: '어깨', title: '어깨 으쓱하기', description: '양 어깨를 귀 쪽으로 최대한 끌어올렸다가 천천히 내리기를 반복합니다.' },
    { bodyPart: '등', title: '고양이-소 자세', description: '네발 기기 자세에서 등을 둥글게 말았다가 오목하게 만들기를 반복합니다.' },
    { bodyPart: '팔/손목', title: '손목 굴곡/신전', description: '팔을 앞으로 뻗어 손가락을 위, 아래로 당겨 손목을 스트레칭합니다.' },
    { bodyPart: '다리', title: '장요근 스트레칭', description: '한쪽 무릎을 꿇고 다른 쪽 다리를 앞으로 뻗어 골반 앞쪽을 늘려줍니다.' },
];

// --- 스트레칭 카드 표시 -------------------------------------------------------
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

// --- 레이캐스팅 및 이벤트 ----------------------------------------------------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredPart = null;

function updateMouse(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onMouseMove(event) {
    updateMouse(event);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickTargets.children);

    if (intersects.length > 0) {
        const partName = bodyPartMapping[intersects[0].object.name];
        if (hoveredPart !== partName) {
            model.traverse(child => { if (child.isMesh) child.material = hoverMaterial; });
            hoveredPart = partName;
        }
    } else if (hoveredPart !== null) {
        model.traverse(child => { if (child.isMesh) child.material = defaultMaterial; });
        hoveredPart = null;
    }
}

function onClick(event) {
    updateMouse(event);
    raycaster.setFromCamera(mouse, camera); 
    const intersects = raycaster.intersectObjects(clickTargets.children);

    if (intersects.length > 0) {
        const partName = bodyPartMapping[intersects[0].object.name];
        displayStretches(partName);
    }
}

document.getElementById('show-all-btn').addEventListener('click', () => displayStretches('all'));
canvasContainer.addEventListener('mousemove', onMouseMove);
canvasContainer.addEventListener('click', onClick);

// --- 애니메이션 및 리사이즈 ---------------------------------------------------
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
});

// --- 초기화 ----------------------------------------------------------------
displayStretches();
animate();
