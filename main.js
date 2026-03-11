const lottoDisplay = document.getElementById('lotto-display');
const generateBtn = document.getElementById('generate-btn');
const historyContainer = document.getElementById('history-container');

// --- 로또 번호 생성 로직 -----------------------------------------------------
function generateLottoNumbers() {
    const numbers = [];
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
    generateBtn.disabled = true;
    lottoDisplay.innerHTML = '';
    
    const luckyNumbers = generateLottoNumbers();
    
    // 순차적으로 공 나타내기 애니메이션
    for (let i = 0; i < luckyNumbers.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const ball = createBallElement(luckyNumbers[i]);
        lottoDisplay.appendChild(ball);
    }
    
    saveToHistory(luckyNumbers);
    generateBtn.disabled = false;
}

// --- 히스토리 관리 -----------------------------------------------------------
function saveToHistory(numbers) {
    const history = JSON.parse(localStorage.getItem('lottoHistory') || '[]');
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newEntry = { date: dateStr, numbers: numbers };
    history.unshift(newEntry);
    
    // 최근 10개만 유지
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
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'history-date';
        dateSpan.textContent = item.date;
        
        const ballsDiv = document.createElement('div');
        ballsDiv.className = 'history-balls';
        
        item.numbers.forEach(num => {
            ballsDiv.appendChild(createBallElement(num, true));
        });
        
        historyItem.appendChild(dateSpan);
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