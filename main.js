import * as THREE from 'three';

const stretches = [
  { id: 1, category: 'neck', title: '넥 사이드 스트레칭', desc: '목 옆쪽 근육을 이완시켜 긴장을 풀어줍니다.', steps: '1. 정면을 보고 서거나 앉습니다. 2. 한 손으로 머리 반대편을 잡고 어깨 방향으로 지긋이 당깁니다. 3. 15초간 유지 후 반대쪽도 실시합니다.' },
  { id: 2, category: 'neck', title: '거북목 예방 스트레칭', desc: '목 뒤쪽 근육을 강화하고 자세를 교정합니다.', steps: '1. 턱을 몸쪽으로 가볍게 당깁니다. 2. 뒤통수가 뒤로 밀린다는 느낌으로 5초간 유지합니다. 3. 10회 반복합니다.' },
  { id: 3, category: 'shoulder', title: '크로스 암 스트레칭', desc: '어깨 뒤쪽 근육을 시원하게 풀어줍니다.', steps: '1. 한쪽 팔을 반대편 어깨 쪽으로 뻗습니다. 2. 다른 팔로 팔꿈치를 감싸 몸쪽으로 당깁니다. 3. 20초간 유지 후 교대합니다.' },
  { id: 4, category: 'shoulder', title: '어깨 회전 스트레칭', desc: '어깨 관절의 가동 범위를 넓혀줍니다.', steps: '1. 양손을 어깨 위에 올립니다. 2. 팔꿈치로 큰 원을 그리듯 천천히 회전시킵니다. 3. 앞뒤로 각각 10회 실시합니다.' },
  { id: 5, category: 'back', title: '고양이 자세', desc: '척추 마디마디를 이완시키고 유연성을 높입니다.', steps: '1. 네발 기기 자세를 취합니다. 2. 숨을 내쉬며 등을 둥글게 말고 시선은 배꼽을 봅니다. 3. 숨을 들이마시며 허리를 낮추고 시선은 정면을 봅니다.' },
  { id: 6, category: 'back', title: '코브라 자세', desc: '허리 근육을 이완하고 척추를 폅니다.', steps: '1. 바닥에 엎드립니다. 2. 손으로 바닥을 밀며 상체를 천천히 들어 올립니다. 3. 어깨가 귀와 멀어지도록 유지하며 15초간 버팁니다.' },
  { id: 7, category: 'wrist', title: '손목 굴곡 스트레칭', desc: '손목과 전완근의 긴장을 완화합니다.', steps: '1. 팔을 앞으로 쭉 뻗고 손바닥이 정면을 향하게 합니다. 2. 반대 손으로 손가락을 몸쪽으로 당깁니다. 3. 15초간 유지 후 반대쪽도 실시합니다.' },
  { id: 8, category: 'leg', title: '햄스트링 스트레칭', desc: '허벅지 뒤쪽 근육을 유연하게 만듭니다.', steps: '1. 한쪽 다리를 앞으로 내밀고 발가락을 세웁니다. 2. 상체를 천천히 숙이며 허벅지 뒤쪽의 자극을 느낍니다. 3. 20초간 유지 후 교대합니다.' }
];

// Scene Setup
const container = document.getElementById('three-canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0x00f2ff, 3);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Hologram Human Group
const human = new THREE.Group();
const material = new THREE.MeshPhongMaterial({
  color: 0x00f2ff,
  wireframe: true,
  transparent: true,
  opacity: 0.3,
  emissive: 0x00f2ff,
  emissiveIntensity: 0.5
});

function createPart(geometry, name, y, scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry, material.clone());
  mesh.position.y = y;
  mesh.scale.set(...scale);
  mesh.name = name;
  human.add(mesh);
  return mesh;
}

// Construct Human Shape
const head = createPart(new THREE.SphereGeometry(0.4, 16, 16), 'neck', 3.5);
const torso = createPart(new THREE.CylinderGeometry(0.6, 0.4, 1.5, 16), 'back', 2.2);
const leftShoulder = createPart(new THREE.SphereGeometry(0.2, 8, 8), 'shoulder', 2.8);
leftShoulder.position.x = -0.8;
const rightShoulder = createPart(new THREE.SphereGeometry(0.2, 8, 8), 'shoulder', 2.8);
rightShoulder.position.x = 0.8;

const leftArm = createPart(new THREE.CylinderGeometry(0.15, 0.1, 1.2, 8), 'wrist', 2.1, [1, 1, 1]);
leftArm.position.x = -1;
leftArm.rotation.z = Math.PI / 8;

const rightArm = createPart(new THREE.CylinderGeometry(0.15, 0.1, 1.2, 8), 'wrist', 2.1, [1, 1, 1]);
rightArm.position.x = 1;
rightArm.rotation.z = -Math.PI / 8;

const leftLeg = createPart(new THREE.CylinderGeometry(0.2, 0.15, 1.8, 8), 'leg', 0.8);
leftLeg.position.x = -0.4;
const rightLeg = createPart(new THREE.CylinderGeometry(0.2, 0.15, 1.8, 8), 'leg', 0.8);
rightLeg.position.x = 0.4;

scene.add(human);
camera.position.z = 7;
camera.position.y = 2;

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1000;
const posArray = new Float32Array(particlesCount * 3);
for(let i=0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 15;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({ size: 0.02, color: 0x00f2ff });
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', () => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(human.children);

  if (intersects.length > 0) {
    const partName = intersects[0].object.name;
    showStretches(partName);
    
    // Pulse effect
    const obj = intersects[0].object;
    obj.material.opacity = 1;
    setTimeout(() => obj.material.opacity = 0.3, 200);
  }
});

const infoPanel = document.getElementById('info-panel');
const stretchContent = document.getElementById('stretch-content');
const closeBtn = document.getElementById('close-panel');

function showStretches(category) {
  const filtered = stretches.filter(s => s.category === category);
  stretchContent.innerHTML = `<h1>${category.toUpperCase()} STRETCHING</h1>`;
  
  filtered.forEach(s => {
    const item = document.createElement('div');
    item.className = 'stretch-item';
    item.innerHTML = `
      <h2>${s.title}</h2>
      <p>${s.desc}</p>
      <div class="steps">${s.steps}</div>
    `;
    stretchContent.appendChild(item);
  });

  infoPanel.classList.remove('hidden');
}

closeBtn.addEventListener('click', () => {
  infoPanel.classList.add('hidden');
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  human.rotation.y += 0.005;
  particlesMesh.rotation.y += 0.001;
  renderer.render(scene, camera);
}

animate();

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Theme Toggle logic remains similar
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', next);
  themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
});
