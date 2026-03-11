const lottoDisplay = document.getElementById('lotto-display');
const generateBtn = document.getElementById('generate-btn');
const historyContainer = document.getElementById('history-container');
const birthInput = document.getElementById('birthdate');
const sajuResult = document.getElementById('saju-result');

// --- 사주 및 오행 데이터 -----------------------------------------------------
const elements = {
    wood: { name: '목(木)', color: '초록', range: [1, 10, 41, 45], desc: '성장과 활력을 상징하는 목의 기운이 강합니다. 생명력이 느껴지는 낮은 번호대와 끝 번호대가 행운을 가져다줄 것입니다.' },
    fire: { name: '화(火)', color: '빨강', range: [21, 30], desc: '열정과 에너지를 상징하는 화의 기운이 가득합니다. 뜨거운 기운을 품은 20번대 중반 번호들에 주목하세요.' },
    earth: { name: '토(土)', color: '노랑/회색', range: [1, 5, 31, 40], desc: '안정과 신뢰를 상징하는 토의 기운이 깃들어 있습니다. 단단한 기반을 의미하는 30번대 번호들이 길운을 보충해줍니다.' },
    metal: { name: '금(金)', color: '흰색/금색', range: [41, 45, 11, 20], desc: '결단력과 명예를 상징하는 금의 기운이 느껴집니다. 날카롭고 명확한 기운의 10번대와 최고령 번호들이 유리합니다.' },
    water: { name: '수(水)', color: '파랑', range: [11, 20], desc: '지혜와 흐름을 상징하는 수의 기운이 흐릅니다. 유연함을 가진 10번대 파란 공들이 당신의 행운 번호입니다.' }
};

function analyzeSaju(birthdate) {
    if (!birthdate) return null;
    const date = new Date(birthdate);
    const sum = date.getFullYear() + (date.getMonth() + 1) + date.getDate();
    const elementKeys = Object.keys(elements);
    const key = elementKeys[sum % elementKeys.length];
    return elements[key];
}

// --- 로또 번호 생성 로직 (사주 가중치 포함) ---------------------------------------
function generateLottoNumbers(saju) {
    const numbers = [];
    const luckyRange = saju ? saju.range : [];
    
    // 사주 맞춤 번호 2개 우선 선정 (가중치)
    if (luckyRange.length > 0) {
        while (numbers.length < 2) {
            const min = luckyRange[0];
            const max = luckyRange[luckyRange.length - 1];
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            if (!numbers.includes(num) && num >= 1 && num <= 45) {
                numbers.push(num);
            }
        }
    }

    // 나머지 번호 랜덤 채우기
    while (numbers.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    return numbers.sort((a, b) => a - b);
}

// --- 공 색상 클래스 결정 -----------------------------------------------------
function getRangeClass(num) {
    if (num <= 10) return 'range-1'; // 노란색
    if (num <= 20) return 'range-2'; // 파란색
    if (num <= 30) return 'range-3'; // 빨간색
    if (num <= 40) return 'range-4'; // 회색
    return 'range-5';               // 초록색
}

// --- 공 엘리먼트 생성 --------------------------------------------------------
function createBallElement(num, isSmall = false) {
    const ball = document.createElement('div');
    ball.className = `ball ${getRangeClass(num)} ${isSmall ? 'small-ball' : ''}`;
    ball.textContent = num;
    return ball;
}

// --- 번호 추첨 실행 ----------------------------------------------------------
async function drawNumbers() {
    const birthdate = birthInput.value;
    const saju = analyzeSaju(birthdate);

    generateBtn.disabled = true;
    lottoDisplay.innerHTML = '';
    
    // 사주 결과 표시
    if (saju) {
        sajuResult.style.display = 'block';
        sajuResult.innerHTML = `
            <p class="saju-title">✨ 당신의 사주 분석: ${saju.name}의 기운</p>
            <p class="saju-desc">${saju.desc}</p>
        `;
    } else {
        sajuResult.style.display = 'none';
    }
    
    const luckyNumbers = generateLottoNumbers(saju);
    
    // 순차적으로 공 나타내기 애니메이션
    for (let i = 0; i < luckyNumbers.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const ball = createBallElement(luckyNumbers[i]);
        lottoDisplay.appendChild(ball);
    }
    
    saveToHistory(luckyNumbers, saju ? saju.name : '일반');
    generateBtn.disabled = false;
}

// --- 히스토리 관리 -----------------------------------------------------------
function saveToHistory(numbers, type) {
    const history = JSON.parse(localStorage.getItem('lottoHistory') || '[]');
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}.${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newEntry = { date: dateStr, numbers: numbers, type: type };
    history.unshift(newEntry);
    
    const updatedHistory = history.slice(0, 10);
    localStorage.setItem('lottoHistory', JSON.stringify(updatedHistory));
    
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('lottoHistory') || '[]');
    if (!historyContainer) return;
    
    historyContainer.innerHTML = '';
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p style="color: #444;">최근 내역이 없습니다.</p>';
        return;
    }
    
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `
            <div class="history-date">${item.date}</div>
            <div style="font-size: 0.75rem; color: var(--primary-color-start); margin-top: 4px;">[${item.type}]</div>
        `;
        
        const ballsDiv = document.createElement('div');
        ballsDiv.className = 'history-balls';
        
        item.numbers.forEach(num => {
            ballsDiv.appendChild(createBallElement(num, true));
        });
        
        historyItem.appendChild(infoDiv);
        historyItem.appendChild(ballsDiv);
        historyContainer.appendChild(historyItem);
    });
}

// --- 이벤트 리스너 -----------------------------------------------------------
generateBtn.addEventListener('click', drawNumbers);

// --- 초기화 ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
});