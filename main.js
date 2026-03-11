/**
 * MARKET INSIGHT - Final MZ Pastel Dashboard
 * 확실한 가시성과 파스텔 감성을 보장합니다.
 */

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initCharts();
    setupIntervalControls();
});

function initClock() {
    const timeDisplay = document.getElementById('market-time');
    const dot = document.querySelector('.status-dot');
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeDisplay.innerHTML = `${hours}:${minutes}:${seconds}`;
        const isMarketOpen = checkMarketHours(now);
        if (isMarketOpen) {
            dot.style.backgroundColor = '#bef264';
            dot.classList.add('pulse');
        } else {
            dot.style.backgroundColor = '#fca5a5';
            dot.classList.remove('pulse');
        }
    }
    setInterval(updateClock, 1000);
    updateClock();
}

function checkMarketHours(date) {
    const day = date.getDay();
    const timeValue = date.getHours() * 100 + date.getMinutes();
    if (day === 0 || day === 6) return false;
    return timeValue >= 900 && timeValue <= 1530;
}

/**
 * 미니 위젯 스크립트 주입 방식 (색상과 선 가시성이 가장 확실함)
 */
function renderChart(containerId, symbol, interval = "D") {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ''; 

    const colors = getPastelColors(containerId);
    
    // 주기에 따른 날짜 범위 설정
    let dateRange = "1M";
    if (interval === "5" || interval === "60") dateRange = "1D";
    if (interval === "W") dateRange = "12M";

    const config = {
        "symbol": symbol,
        "width": "100%",
        "height": "100%",
        "locale": "ko",
        "dateRange": dateRange,
        "colorTheme": "dark",
        "trendLineColor": colors.line,
        "underLineColor": colors.top,
        "underLineBottomColor": "rgba(26, 31, 38, 0)",
        "isTransparent": true,
        "autosize": true,
        "largeChartUrl": ""
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    
    container.appendChild(script);
}

function getPastelColors(id) {
    let line = "rgba(165, 180, 252, 1)"; // Lavender Blue
    
    if (id.includes('kospi')) line = "rgba(165, 180, 252, 1)";      
    else if (id.includes('sp500')) line = "rgba(253, 164, 175, 1)"; 
    else if (id.includes('nasdaq')) line = "rgba(153, 246, 228, 1)"; 
    else if (id.includes('sox')) line = "rgba(190, 242, 100, 1)";    
    else if (id.includes('samsung')) line = "rgba(165, 180, 252, 1)"; 
    else if (id.includes('k200')) line = "rgba(192, 132, 252, 1)";   
    
    else if (id.includes('fx')) line = "rgba(190, 242, 100, 1)";     
    else if (id.includes('dxy')) line = "rgba(165, 180, 252, 1)";    
    else if (id.includes('yield')) line = "rgba(253, 164, 175, 1)";  
    else if (id.includes('vix')) line = "rgba(252, 165, 165, 1)";    
    
    else if (id.includes('gold')) line = "rgba(253, 224, 71, 1)";   
    else if (id.includes('oil')) line = "rgba(251, 146, 60, 1)";    
    else if (id.includes('btc')) line = "rgba(244, 114, 182, 1)";    
    else if (id.includes('eth')) line = "rgba(192, 132, 252, 1)";    

    return {
        line: line,
        top: line.replace('1)', '0.2)') // 20% Alpha for area
    };
}

function initCharts() {
    const cards = document.querySelectorAll('.chart-card');
    cards.forEach(card => {
        const containerId = card.querySelector('.chart-container').id;
        const symbol = card.dataset.symbol;
        const interval = card.querySelector('.int-btn.active')?.dataset.int || "D";
        renderChart(containerId, symbol, interval);
    });
}

function setupIntervalControls() {
    const buttons = document.querySelectorAll('.int-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.chart-card');
            const containerId = card.querySelector('.chart-container').id;
            const symbol = card.dataset.symbol;
            const interval = e.target.dataset.int;

            card.querySelectorAll('.int-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            renderChart(containerId, symbol, interval);
        });
    });
}
