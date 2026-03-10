const stretches = [
  { id: 1, category: 'neck', title: '넥 사이드 스트레칭', desc: '목 옆쪽 근육을 이완시켜 긴장을 풀어줍니다.', steps: '1. 정면을 보고 서거나 앉습니다. 2. 한 손으로 머리 반대편을 잡고 어깨 방향으로 지긋이 당깁니다. 3. 15초간 유지 후 반대쪽도 실시합니다.' },
  { id: 2, category: 'neck', title: '거북목 예방 스트레칭', desc: '목 뒤쪽 근육을 강화하고 자세를 교정합니다.', steps: '1. 턱을 몸쪽으로 가볍게 당깁니다. 2. 뒤통수가 뒤로 밀린다는 느낌으로 5초간 유지합니다. 3. 10회 반복합니다.' },
  { id: 3, category: 'shoulder', title: '크로스 암 스트레칭', desc: '어깨 뒤쪽 근육을 시원하게 풀어줍니다.', steps: '1. 한쪽 팔을 반대편 어깨 쪽으로 뻗습니다. 2. 다른 팔로 팔꿈치를 감싸 몸쪽으로 당깁니다. 3. 20초간 유지 후 교대합니다.' },
  { id: 4, category: 'shoulder', title: '어깨 회전 스트레칭', desc: '어깨 관절의 가동 범위를 넓혀줍니다.', steps: '1. 양손을 어깨 위에 올립니다. 2. 팔꿈치로 큰 원을 그리듯 천천히 회전시킵니다. 3. 앞뒤로 각각 10회 실시합니다.' },
  { id: 5, category: 'back', title: '고양이 자세', desc: '척추 마디마디를 이완시키고 유연성을 높입니다.', steps: '1. 네발 기기 자세를 취합니다. 2. 숨을 내쉬며 등을 둥글게 말고 시선은 배꼽을 봅니다. 3. 숨을 들이마시며 허리를 낮추고 시선은 정면을 봅니다.' },
  { id: 6, category: 'back', title: '코브라 자세', desc: '허리 근육을 이완하고 척추를 폅니다.', steps: '1. 바닥에 엎드립니다. 2. 손으로 바닥을 밀며 상체를 천천히 들어 올립니다. 3. 어깨가 귀와 멀어지도록 유지하며 15초간 버팁니다.' },
  { id: 7, category: 'wrist', title: '손목 굴곡 스트레칭', desc: '손목과 전완근의 긴장을 완화합니다.', steps: '1. 팔을 앞으로 쭉 뻗고 손바닥이 정면을 향하게 합니다. 2. 반대 손으로 손가락을 몸쪽으로 당깁니다. 3. 15초간 유지 후 반대쪽도 실시합니다.' },
  { id: 8, category: 'leg', title: '햄스트링 스트레칭', desc: '허벅지 뒤쪽 근육을 유연하게 만듭니다.', steps: '1. 한쪽 다리를 앞으로 내밀고 발가락을 세웁니다. 2. 상체를 천천히 숙이며 허벅지 뒤쪽의 자극을 느킵니다. 3. 20초간 유지 후 교대합니다.' }
];

class StretchCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const title = this.getAttribute('title');
    const desc = this.getAttribute('desc');
    const steps = this.getAttribute('steps');
    const category = this.getAttribute('category');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; height: 100%; }
        .card {
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          transition: transform 0.2s ease;
        }
        .card:hover { transform: translateY(-4px); }
        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background-color: #3b82f6;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 9999px;
          margin-bottom: 1rem;
          text-transform: uppercase;
          width: fit-content;
        }
        h2 { margin: 0 0 0.5rem 0; font-size: 1.25rem; color: #1e293b; }
        p { margin: 0 0 1rem 0; font-size: 0.95rem; color: #64748b; }
        .steps {
          margin-top: auto;
          font-size: 0.85rem;
          padding: 1rem;
          background-color: #f8fafc;
          border-radius: 0.5rem;
          border-left: 4px solid #3b82f6;
          color: #334155;
        }
      </style>
      <div class="card">
        <span class="badge">${category}</span>
        <h2>${title}</h2>
        <p>${desc}</p>
        <div class="steps">${steps}</div>
      </div>
    `;
  }
}

customElements.define('stretch-card', StretchCard);

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('stretch-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  function displayStretches(filter = 'all') {
    grid.innerHTML = '';
    const filtered = filter === 'all' 
      ? stretches 
      : stretches.filter(s => s.category === filter);
    
    filtered.forEach(s => {
      const card = document.createElement('stretch-card');
      card.setAttribute('title', s.title);
      card.setAttribute('desc', s.desc);
      card.setAttribute('steps', s.steps);
      card.setAttribute('category', s.category);
      grid.appendChild(card);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      displayStretches(btn.dataset.category);
    });
  });

  displayStretches();
});
