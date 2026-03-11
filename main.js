/**
 * MARKET INSIGHT - Logic & Charts (MZ Pastel Edition)
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

function renderChart(containerId, symbol, interval = "D") {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ''; 

    const colors = getPastelColors(containerId);
    
    const config = {
        "symbol": symbol,
        "width": "100%",
        "height": "100%",
        "locale": "ko",
        "dateRange": interval === "D" ? "1M" : interval === "W" ? "12M" : "1D",
        "colorTheme": "dark",
        "trendLineColor": colors.line,
        "underLineColor": colors.top,
        "underLineBottomColor": "rgba(26, 31, 38, 0)",
        "isTransparent": true,
        "autosize": true
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    
    container.appendChild(script);
}

function getPastelColors(id) {
    // Default Lavender Blue
    let line = "#a5b4fc"; 
    
    // Section 1: Core
    if (id.includes('kospi')) line = "#a5b4fc";      
    else if (id.includes('sp500')) line = "#fda4af"; 
    else if (id.includes('nasdaq')) line = "#99f6e4"; 
    else if (id.includes('sox')) line = "#bef264";    // Semi = Mint/Lime
    else if (id.includes('samsung')) line = "#a5b4fc"; // Samsung = Blue
    else if (id.includes('k200')) line = "#c084fc";   
    
    // Section 2: Macro
    else if (id.includes('fx')) line = "#bef264";     
    else if (id.includes('dxy')) line = "#a5b4fc";    // DXY = Blue
    else if (id.includes('yield')) line = "#fda4af";  
    else if (id.includes('vix')) line = "#fca5a5";    // VIX = Rose (Danger)
    
    // Section 3: Assets
    else if (id.includes('gold')) line = "#fde047";   
    else if (id.includes('oil')) line = "#fb923c";    
    else if (id.includes('btc')) line = "#f472b6";    
    else if (id.includes('eth')) line = "#c084fc";    // ETH = Purple
    
    return {
        line: line,
        top: line + "33" 
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
