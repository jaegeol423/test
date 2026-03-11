/**
 * MARKET INSIGHT - Alpha Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initAllCharts();
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

function initAllCharts() {
    const containers = document.querySelectorAll('.chart-container');
    containers.forEach(container => {
        const card = container.closest('.chart-card');
        renderWidget(container.id, card.dataset.symbol);
    });
}

/**
 * 가시성과 파스텔 감성을 100% 보장하는 위젯 렌더링
 */
function renderWidget(containerId, symbol) {
    const colors = getPastelColors(containerId);
    
    const config = {
        "symbols": [[symbol, symbol]],
        "chartOnly": false,
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
        "lineWidth": 2,
        "lineColor": colors.line,
        "topColor": colors.top,
        "bottomColor": "rgba(26, 31, 38, 0)",
        "dateFormat": "yyyy-MM-dd",
        "timeHoursFormat": "24-point",
        "range": "1M" // 기본 범위를 1개월로 설정하여 선 가시성 확보
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    
    const container = document.getElementById(containerId);
    if (container) container.appendChild(script);
}

function getPastelColors(id) {
    let line = "rgba(165, 180, 252, 1)"; // Lavender
    
    if (id.includes('kospi')) line = "rgba(165, 180, 252, 1)";      
    else if (id.includes('sp500')) line = "rgba(253, 164, 175, 1)"; 
    else if (id.includes('nasdaq')) line = "rgba(153, 246, 228, 1)"; 
    else if (id.includes('nikkei')) line = "rgba(165, 180, 252, 1)";
    else if (id.includes('dax')) line = "rgba(192, 132, 252, 1)";
    else if (id.includes('hsi')) line = "rgba(253, 164, 175, 1)";
    
    else if (id.includes('sox')) line = "rgba(190, 242, 100, 1)";    
    else if (id.includes('lit')) line = "rgba(153, 246, 228, 1)";
    else if (id.includes('schd')) line = "rgba(165, 180, 252, 1)";
    else if (id.includes('xlk')) line = "rgba(192, 132, 252, 1)";
    
    else if (id.includes('gold')) line = "rgba(253, 224, 71, 1)";   
    else if (id.includes('silver')) line = "rgba(226, 232, 240, 1)";
    else if (id.includes('oil')) line = "rgba(251, 146, 60, 1)";    
    else if (id.includes('fx')) line = "rgba(190, 242, 100, 1)";     
    
    else if (id.includes('nvda')) line = "rgba(153, 246, 228, 1)";
    else if (id.includes('tsla')) line = "rgba(252, 165, 165, 1)";
    else if (id.includes('btc')) line = "rgba(244, 114, 182, 1)";    
    else if (id.includes('eth')) line = "rgba(192, 132, 252, 1)";    

    return { line: line, top: line.replace('1)', '0.3)') };
}
