// --- 기본 설정 ----------------------------------------------------------------
const canvasContainer = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
canvasContainer.appendChild(renderer.domElement);

camera.position.set(0, 1.5, 8);

// --- 컨트롤 -----------------------------------------------------------------
// CDN으로 불러온 OrbitControls는 THREE.OrbitControls로 접근합니다.
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.5, 0);

// --- 조명 -------------------------------------------------------------------
scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(2, 5, 5);
scene.add(directionalLight);

// --- 크로마키 쉐이더 (Chromakey Shader) --------------------------------------
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform sampler2D tex;
    uniform vec3 keyColor;
    varying vec2 vUv;
    void main() {
        vec4 c = texture2D(tex, vUv);
        float d = distance(c.rgb, keyColor);
        if (d < 0.5) {
            discard;
        }
        gl_FragColor = c;
    }
`;

// --- 스트레칭 데이터 ----------------------------------------------------------
const stretches = [
    { title: '목 돌리기', bodyPart: '목', videoSrc: 'https://storage.googleapis.com/assets.oz.com/misc/stretch/neck_rotation.mp4' },
    { title: '어깨 스트레칭', bodyPart: '어깨', videoSrc: 'https://storage.googleapis.com/assets.oz.com/misc/stretch/shoulder_stretch.mp4' },
    { title: '허리 숙이기', bodyPart: '허리', videoSrc: 'https://storage.googleapis.com/assets.oz.com/misc/stretch/waist_bend.mp4' },
    { title: '다리 뻗기', bodyPart: '다리', videoSrc: 'https://storage.googleapis.com/assets.oz.com/misc/stretch/leg_stretch.mp4' },
    { title: '전신 스트레칭', bodyPart: '전신', videoSrc: 'https://storage.googleapis.com/assets.oz.com/misc/stretch/full_body.mp4' },
];

const stretchViews = new THREE.Group();
scene.add(stretchViews);

// --- 3D 뷰 생성 -------------------------------------------------------------
function createStretchView(stretch) {
    const video = document.createElement('video');
    video.src = stretch.videoSrc;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.play();

    const texture = new THREE.VideoTexture(video);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            tex: { value: texture },
            keyColor: { value: new THREE.Color(0x00ff00) }, // 녹색 배경
        },
        vertexShader,
        fragmentShader,
        transparent: true,
    });

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 3.5), material);
    plane.userData = stretch; // 나중에 필터링을 위해 데이터 저장
    return plane;
}

stretches.forEach(stretch => {
    const view = createStretchView(stretch);
    stretchViews.add(view);
});

// --- 필터링 및 레이아웃 -------------------------------------------------------
const filterContainer = document.getElementById('filter-container');
const bodyParts = ['전체', '목', '어깨', '허리', '다리', '전신'];
let activeFilter = '전체';

bodyParts.forEach(part => {
    const button = document.createElement('button');
    button.className = 'filter-btn';
    button.textContent = part;
    if (part === activeFilter) button.classList.add('active');

    button.addEventListener('click', () => {
        activeFilter = part;
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        updateLayout();
    });

    filterContainer.appendChild(button);
});

function updateLayout() {
    let visibleCount = 0;
    stretchViews.children.forEach(view => {
        const isVisible = activeFilter === '전체' || view.userData.bodyPart === activeFilter;
        view.visible = isVisible;
        if (isVisible) visibleCount++;
    });

    const grid = { cols: Math.min(visibleCount, 3), gap: 4 };
    let i = 0;
    stretchViews.children.forEach(view => {
        if (view.visible) {
            const x = (i % grid.cols - (grid.cols - 1) / 2) * grid.gap;
            const y = (Math.floor(i / grid.cols)) * -grid.gap + 2.5; 
            view.position.set(x, y, 0);
            i++;
        }
    });
}


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
updateLayout();
animate();

// --- 유튜브 큐레이션 (YouTube Curation) -----------------------------------------
const curatedVideos = [
    {
        title: "[ENG] 전신 스트레칭 (Full Body Stretching)",
        channel: "피지컬갤러리",
        videoId: "MYNf_Xm_XEY"
    },
    {
        title: "누워서 하는 아침 전신 스트레칭 (No equipment Morning Stretch)",
        channel: "Thankyou BUBU",
        videoId: "gMaB-fZfL8s"
    },
    {
        title: "거북목 탈출! 굽은 어깨, 등 펴주는 스트레칭",
        channel: "자세요정",
        videoId: "27T_X98P2N0"
    },
    {
        title: "골반 교정 스트레칭 10분 (Pelvic Correction)",
        channel: "소미핏 Somifit",
        videoId: "nQlb98uA-S0"
    },
    {
        title: "자기 전 10분! 꿀잠 자는 수면 스트레칭",
        channel: "에이핏 afit",
        videoId: "m_Y7YvP4p0U"
    },
    {
        title: "허리 통증 완화, 코어 강화 스트레칭",
        channel: "요가소년 Yoga Boy",
        videoId: "mXW0KclW0gU"
    }
];

const youtubeContainer = document.getElementById('youtube-container');

function renderYoutubeVideos() {
    if (!youtubeContainer) return;
    curatedVideos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        
        card.innerHTML = `
            <div class="thumbnail-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/${video.videoId}" 
                    title="${video.title}" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <p class="video-channel">${video.channel}</p>
            </div>
        `;
        
        youtubeContainer.appendChild(card);
    });
}

renderYoutubeVideos();
