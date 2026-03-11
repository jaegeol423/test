/**
 * MARKET INSIGHT - Final Premium Dashboard Logic
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
 * 프리미엄 위젯 렌더링 (1h, D, W, M)
 */
function renderAdvancedPro(containerId, symbol, interval = "D") {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ''; 

    const colors = getPastelColors(containerId);
    
    // 주기에 따른 최적의 표시 범위 설정
    let range = "1D"; // 1시간봉은 당일치
    if (interval === "D") range = "3M";
    if (interval === "W") range = "24M";
    if (interval === "M") range = "60M";

    new TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": symbol,
        "interval": interval,
        "timezone": "Asia/Seoul",
        "theme": "dark",
        "style": "3", 
        "locale": "ko",
        "toolbar_bg": "#1a1f26",
        "enable_publishing": false,
        "hide_top_toolbar": true, 
        "hide_legend": false, 
        "save_image": false,
        "container_id": containerId,
        "backgroundColor": "#1a1f26",
        "gridColor": "rgba(45, 55, 72, 0.05)",
        "withdateranges": false,
        "hide_side_toolbar": true,
        "range": range,
        "overrides": {
            "mainSeriesProperties.areaStyle.linecolor": colors.line,
            "mainSeriesProperties.areaStyle.color1": colors.top,
            "mainSeriesProperties.areaStyle.color2": "rgba(26, 31, 38, 0)",
            "mainSeriesProperties.areaStyle.linewidth": 3,
            "paneProperties.background": "#1a1f26",
            "paneProperties.vertGridProperties.color": "rgba(255, 255, 255, 0.02)",
            "paneProperties.horzGridProperties.color": "rgba(255, 255, 255, 0.02)",
            "scalesProperties.textColor": "#a0aec0",
            "legendProperties.showSeriesOHLC": true,
            "legendProperties.showBarChange": true
        }
    });
}

function getPastelColors(id) {
    let line = "rgba(165, 180, 252, 1)"; 
    if (id.includes('kospi')) line = "rgba(165, 180, 252, 1)";      
    else if (id.includes('sp500')) line = "rgba(253, 164, 175, 1)"; 
    else if (id.includes('nasdaq')) line = "rgba(153, 246, 228, 1)"; 
    else if (id.includes('sox')) line = "rgba(190, 242, 100, 1)";    
    else if (id.includes('lit')) line = "rgba(153, 246, 228, 1)";
    else if (id.includes('fx')) line = "rgba(190, 242, 100, 1)";     
    else if (id.includes('gold')) line = "rgba(253, 224, 71, 1)";   
    else if (id.includes('nvda')) line = "rgba(153, 246, 228, 1)";
    else if (id.includes('btc')) line = "rgba(244, 114, 182, 1)";    
    else if (id.includes('eth')) line = "rgba(192, 132, 252, 1)";    

    return { line: line, top: line.replace('1)', '0.3)') };
}

function initCharts() {
    const cards = document.querySelectorAll('.chart-card');
    cards.forEach(card => {
        const container = card.querySelector('.chart-container');
        const symbol = card.dataset.symbol;
        if (container && symbol) {
            renderAdvancedPro(container.id, symbol, "D");
        }
    });
}

function setupIntervalControls() {
    const buttons = document.querySelectorAll('.int-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.chart-card');
            const container = card.querySelector('.chart-container');
            const symbol = card.dataset.symbol;
            const interval = e.target.dataset.int;

            card.querySelectorAll('.int-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            renderAdvancedPro(container.id, symbol, interval);
        });
    });
}
