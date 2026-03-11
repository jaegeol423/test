/**
 * MARKET INSIGHT - Final Professional Dashboard
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
 * 변동률(%)과 모든 심볼 가시성을 보장하는 최신 위젯 렌더링
 */
function renderChart(containerId, symbol, interval = "D") {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ''; 

    const colors = getPastelColors(containerId);
    
    // TradingView Symbol Overview 위젯은 가격, 변동률, 멀티 주기를 가장 잘 지원합니다.
    const config = {
        "symbols": [[symbol, symbol]],
        "chartOnly": false, // 가격과 변동률을 보여주기 위해 false 설정
        "width": "100%",
        "height": "100%",
        "locale": "ko",
        "colorTheme": "dark",
        "autosize": true,
        "showVolume": false,
        "showMA": false,
        "hideDateRanges": false,
        "hideMarketStatus": false,
        "hideSymbolLogo": false,
        "scalePosition": "right",
        "scaleMode": "Normal",
        "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
        "fontSize": "10",
        "noOverlays": false,
        "valuesTracking": "1",
        "changeMode": "price-and-percent",
        "chartType": "area",
        "maLineColor": colors.line,
        "maLineWidth": 1,
        "maLength": 9,
        "headerFontSize": "medium",
        "lineWidth": 2,
        "lineColor": colors.line,
        "topColor": colors.top,
        "bottomColor": "rgba(26, 31, 38, 0)",
        "dateFormat": "yyyy-MM-dd",
        "timeHoursFormat": "24-point"
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    
    container.appendChild(script);
}

function getPastelColors(id) {
    let line = "rgba(165, 180, 252, 1)"; 
    if (id.includes('kospi')) line = "rgba(165, 180, 252, 1)";      
    else if (id.includes('sp500')) line = "rgba(253, 164, 175, 1)"; 
    else if (id.includes('nasdaq')) line = "rgba(153, 246, 228, 1)"; 
    else if (id.includes('sox')) line = "rgba(190, 242, 100, 1)";    
    else if (id.includes('fx')) line = "rgba(190, 242, 100, 1)";     
    else if (id.includes('dxy')) line = "rgba(165, 180, 252, 1)";    
    else if (id.includes('yield')) line = "rgba(253, 164, 175, 1)";  
    else if (id.includes('vix')) line = "rgba(252, 165, 165, 1)";    
    else if (id.includes('gold')) line = "rgba(253, 224, 71, 1)";   
    else if (id.includes('oil')) line = "rgba(251, 146, 60, 1)";    
    else if (id.includes('btc')) line = "rgba(244, 114, 182, 1)";    
    else if (id.includes('eth')) line = "rgba(192, 132, 252, 1)";    

    return { line: line, top: line.replace('1)', '0.3)') };
}

function initCharts() {
    const cards = document.querySelectorAll('.chart-card');
    cards.forEach(card => {
        const containerId = card.querySelector('.chart-container').id;
        const symbol = card.dataset.symbol;
        renderChart(containerId, symbol, "D");
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

            // 이 위젯은 내부 버튼으로 주기를 조절하는 것이 더 안정적이지만, 
            // 외부 버튼 클릭 시 해당 심볼을 다시 로드하여 동기화합니다.
            renderChart(containerId, symbol, interval);
        });
    });
}
