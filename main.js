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

camera.position.set(0, 0, 8);

// --- 컨트롤 (이미지 기반이므로 회전 제한) ---------------------------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableRotate = false; // 평면 이미지이므로 회전은 끄고 줌/팬만 허용
controls.enablePan = false;

// --- 이미지 로딩 및 홀로그램 평면 생성 -------------------------------------------
const textureLoader = new THREE.TextureLoader();
const bodyGroup = new THREE.Group();
const clickTargets = new THREE.Group();
scene.add(bodyGroup);
scene.add(clickTargets);

textureLoader.load('body.png', (texture) => {
    // 이미지의 가로세로 비율 유지
    const aspect = texture.image.width / texture.image.height;
    const height = 6;
    const width = height * aspect;
    
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, // 홀로그램처럼 빛나는 효과
        opacity: 0.9
    });
    
    const bodyPlane = new THREE.Mesh(geometry, material);
    bodyGroup.add(bodyPlane);

    // 이미지 주변에 푸른 글로우 효과 추가 (선택 사항)
    const glowGeo = new THREE.PlaneGeometry(width * 1.2, height * 1.2);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0x00f2ff,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
    });
    const glowPlane = new THREE.Mesh(glowGeo, glowMat);
    glowPlane.position.z = -0.1;
    bodyGroup.add(glowPlane);

    createClickTargets();
});

// --- 클릭 타겟 (사진 위 부위에 맞게 좌표 조정) ------------------------------------
const bodyPartMapping = {}; 

function createClickTargets() {
    // 히트박스 크기 조절 (사진 속 인체 크기에 맞춰 조정 가능)
    const targetMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00f2ff, 
        transparent: true, 
        opacity: 0.0, // 평소엔 투명
        visible: true 
    });

    const targets = {
        'head': { pos: [0, 2.2, 0.1], size: 0.5, part: '목' },
        'shoulder_l': { pos: [0.7, 1.4, 0.1], size: 0.4, part: '어깨' },
        'shoulder_r': { pos: [-0.7, 1.4, 0.1], size: 0.4, part: '어깨' },
        'chest': { pos: [0, 1.0, 0.1], size: 0.6, part: '등' },
        'arm_l': { pos: [1.3, 0.5, 0.1], size: 0.4, part: '팔/손목' },
        'arm_r': { pos: [-1.3, 0.5, 0.1], size: 0.4, part: '팔/손목' },
        'leg_l': { pos: [0.5, -1.2, 0.1], size: 0.5, part: '다리' },
        'leg_r': { pos: [-0.5, -1.2, 0.1], size: 0.5, part: '다리' },
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

function updateMouse(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onMouseMove(event) {
    updateMouse(event);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickTargets.children);

    // 마우스 호버 시 피드백
    clickTargets.children.forEach(child => child.material.opacity = 0);
    if (intersects.length > 0) {
        intersects[0].object.material.opacity = 0.3; // 살짝 푸른 원 표시
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
        
        // 클릭 효과
        intersects[0].object.material.opacity = 0.8;
        setTimeout(() => intersects[0].object.material.opacity = 0.3, 200);
    }
}

document.getElementById('show-all-btn').addEventListener('click', () => displayStretches('all'));
canvasContainer.addEventListener('mousemove', onMouseMove);
canvasContainer.addEventListener('click', onClick);

// --- 애니메이션 및 리사이즈 ---------------------------------------------------
function animate(time) {
    requestAnimationFrame(animate);
    
    // 부드럽게 위아래로 움직이는 홀로그램 효과
    if (bodyGroup.children.length > 0) {
        bodyGroup.position.y = Math.sin(time * 0.002) * 0.1;
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
