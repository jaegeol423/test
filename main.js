import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const spotLight = new THREE.SpotLight(0x00f2ff, 10);
spotLight.position.set(5, 10, 5);
scene.add(spotLight);

// --- Materials ---
// Fresnel Shader for realistic hologram edge glow
const hologramMaterial = new THREE.ShaderMaterial({
  uniforms: {
    glowColor: { value: new THREE.Color(0x00f2ff) },
    viewVector: { value: camera.position },
    time: { value: 0 }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 glowColor;
    uniform float time;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      float intensity = pow(0.7 - dot(vNormal, normalize(vViewPosition)), 3.0);
      float scanline = sin(vViewPosition.y * 20.0 + time * 5.0) * 0.1;
      gl_FragColor = vec4(glowColor, intensity + scanline + 0.15);
    }
  `,
  transparent: true,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

// Solid Hitbox Material (Invisible but clickable)
const hitboxMaterial = new THREE.MeshBasicMaterial({ 
  color: 0xff0000, 
  visible: false // Hidden from view but raycaster can still hit it
});

const bodyGroup = new THREE.Group();
const hitboxGroup = new THREE.Group();
scene.add(bodyGroup);
scene.add(hitboxGroup);

function createPart(geo, name, pos, rot = [0,0,0], scale = [1,1,1]) {
  // Visual Hologram Mesh
  const mesh = new THREE.Mesh(geo, hologramMaterial);
  mesh.position.set(...pos);
  mesh.rotation.set(...rot);
  mesh.scale.set(...scale);
  bodyGroup.add(mesh);

  // Invisible Hitbox Mesh
  const hitbox = new THREE.Mesh(geo, hitboxMaterial);
  hitbox.position.set(...pos);
  hitbox.rotation.set(...rot);
  hitbox.scale.set(...scale);
  hitbox.name = name; // Important for raycasting
  hitboxGroup.add(hitbox);

  return mesh;
}

// --- Anatomical Human Assembly (Heroic Proportions) ---
// Head & Neck
createPart(new THREE.CapsuleGeometry(0.28, 0.25, 8, 24), 'neck', [0, 4.0, 0]); // Head
createPart(new THREE.CylinderGeometry(0.1, 0.12, 0.4), 'neck', [0, 3.5, 0]); // Neck

// Torso (Defined Chest & Waist)
createPart(new THREE.CapsuleGeometry(0.5, 0.8, 8, 24), 'back', [0, 2.7, 0]); // Chest
createPart(new THREE.CapsuleGeometry(0.35, 0.6, 8, 24), 'back', [0, 2.1, 0]); // Waist
createPart(new THREE.CapsuleGeometry(0.48, 0.3, 8, 24), 'leg', [0, 1.5, 0]); // Pelvis

// Arms (Segmented for better silhouette)
const shoulderX = 0.75;
const armY = 3.1;
// Shoulders
createPart(new THREE.SphereGeometry(0.22, 16, 16), 'shoulder', [-shoulderX, armY, 0]);
createPart(new THREE.SphereGeometry(0.22, 16, 16), 'shoulder', [shoulderX, armY, 0]);
// Upper Arms (Biceps)
createPart(new THREE.CapsuleGeometry(0.14, 0.6, 4, 16), 'shoulder', [-0.95, armY-0.5, 0], [0,0,0.2]);
createPart(new THREE.CapsuleGeometry(0.14, 0.6, 4, 16), 'shoulder', [0.95, armY-0.5, 0], [0,0,-0.2]);
// Forearms
createPart(new THREE.CapsuleGeometry(0.12, 0.7, 4, 16), 'wrist', [-1.1, armY-1.2, 0], [0,0,0.1]);
createPart(new THREE.CapsuleGeometry(0.12, 0.7, 4, 12), 'wrist', [1.1, armY-1.2, 0], [0,0,-0.1]);

// Legs (Detailed quads and calves)
const legX = 0.26;
// Thighs
createPart(new THREE.CapsuleGeometry(0.24, 0.9, 4, 16), 'leg', [-legX, 0.9, 0], [0.05, 0, 0]);
createPart(new THREE.CapsuleGeometry(0.24, 0.9, 4, 16), 'leg', [legX, 0.9, 0], [0.05, 0, 0]);
// Calves
createPart(new THREE.CapsuleGeometry(0.18, 1.0, 4, 16), 'leg', [-legX, -0.3, 0]);
createPart(new THREE.CapsuleGeometry(0.18, 1.0, 4, 16), 'leg', [legX, -0.3, 0]);

// --- Environmental FX ---
// Glowing scanning ring at the feet
const ringGeo = new THREE.TorusGeometry(1.2, 0.02, 16, 100);
const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.5 });
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = Math.PI / 2;
ring.position.y = -1.2;
scene.add(ring);

// Floating UI Dots
for(let i=0; i<30; i++) {
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.015), new THREE.MeshBasicMaterial({ color: 0x00f2ff }));
  dot.position.set((Math.random()-0.5)*10, (Math.random())*8-1, (Math.random()-0.5)*10);
  scene.add(dot);
}

camera.position.set(0, 2, 10);

// --- Raycasting (Fixed Clicking) ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick(event) {
  // Calculate relative mouse position correctly
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  // We intersect with the HITBOX group, which has solid geometries
  const intersects = raycaster.intersectObjects(hitboxGroup.children);

  if (intersects.length > 0) {
    const category = intersects[0].object.name;
    showStretches(category);
    
    // Brief visual flash on the clicked part
    const visualPart = bodyGroup.children[hitboxGroup.children.indexOf(intersects[0].object)];
    visualPart.scale.multiplyScalar(1.1);
    setTimeout(() => visualPart.scale.divideScalar(1.1), 150);
  }
}

renderer.domElement.addEventListener('mousedown', onClick);

const infoPanel = document.getElementById('info-panel');
const stretchContent = document.getElementById('stretch-content');
const closeBtn = document.getElementById('close-panel');

function showStretches(category) {
  const filtered = stretches.filter(s => s.category === category);
  stretchContent.innerHTML = `
    <div style="border-left: 4px solid #00f2ff; padding-left: 15px; margin-bottom: 25px;">
      <h1 style="color:#00f2ff; font-size:2rem; margin:0;">${category.toUpperCase()} SCAN</h1>
      <p style="opacity:0.6; font-size:0.9rem;">Targeting anatomical zones...</p>
    </div>
  `;
  
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
  controls.autoRotate = false;
}

closeBtn.addEventListener('click', () => {
  infoPanel.classList.add('hidden');
  controls.autoRotate = true;
});

// --- Animation Loop ---
function animate(time) {
  requestAnimationFrame(animate);
  
  const t = time * 0.001;
  hologramMaterial.uniforms.time.value = t;
  hologramMaterial.uniforms.viewVector.value = camera.position;

  // Floating effect for the groups
  bodyGroup.position.y = Math.sin(t) * 0.1;
  hitboxGroup.position.y = bodyGroup.position.y;
  
  // Rotating the scanning ring
  ring.rotation.z += 0.01;
  ring.scale.setScalar(1 + Math.sin(t * 2) * 0.05);

  controls.update();
  renderer.render(scene, camera);
}

animate(0);

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  document.body.setAttribute('data-theme', next);
  themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
  
  const color = next === 'dark' ? 0x00f2ff : 0x0066ff;
  hologramMaterial.uniforms.glowColor.value.set(color);
  ring.material.color.set(color);
});
