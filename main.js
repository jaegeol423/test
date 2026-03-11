/**
 * KOSPI Market Dashboard - Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    checkMarketStatus();
});

/**
 * 실시간 시계 업데이트
 */
function initClock() {
    const timeDisplay = document.getElementById('market-time');
    
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const isMarketOpen = checkMarketHours(now);
        const statusText = isMarketOpen ? 'MARKET OPEN' : 'MARKET CLOSED';
        
        timeDisplay.innerHTML = `${statusText} | ${hours}:${minutes}:${seconds}`;
        
        // 상태 점 색상 변경
        const dot = document.querySelector('.status-dot');
        if (isMarketOpen) {
            dot.style.backgroundColor = '#3fb950';
            document.querySelector('.market-status').style.color = '#3fb950';
            document.querySelector('.market-status').style.borderColor = 'rgba(63, 185, 80, 0.3)';
        } else {
            dot.style.backgroundColor = '#f85149';
            document.querySelector('.market-status').style.color = '#f85149';
            document.querySelector('.market-status').style.borderColor = 'rgba(248, 81, 73, 0.3)';
            dot.classList.remove('pulse');
        }
    }

    setInterval(updateClock, 1000);
    updateClock();
}

/**
 * 한국 시장 운영 시간 체크 (평일 09:00 ~ 15:30)
 * @param {Date} date 
 * @returns {boolean}
 */
function checkMarketHours(date) {
    const day = date.getDay(); // 0: 일요일, 6: 토요일
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeValue = hours * 100 + minutes;

    // 주말 체크
    if (day === 0 || day === 6) return false;

    // 운영 시간 체크 (9:00 ~ 15:30)
    return timeValue >= 900 && timeValue <= 1530;
}

function checkMarketStatus() {
    console.log("KOSPI Market Dashboard Initialized.");
}
