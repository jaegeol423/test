/**
 * MARKET INSIGHT PRO - Personalization & News Logic
 */

let starredAssets = JSON.parse(localStorage.getItem('starredAssets')) || [];
let currentTheme = localStorage.getItem('theme') || 'pastel-dark';
let isSidebarOpen = localStorage.getItem('sidebarOpen') !== 'false'; // 기본값 열림

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initTheme();
    initSidebar(); // 사이드바 토글 로직 추가
    initKoreanNewsWidget();
    initAllCharts();
    setupIntervalControls();
    setupWatchlistControls();
});

// 사이드바 토글 및 상태 유지
function initSidebar() {
    const body = document.body;
    const toggleBtn = document.getElementById('news-toggle-btn');
    
    // 초기 상태 설정
    if (!isSidebarOpen) {
        body.classList.add('sidebar-closed');
        body.classList.remove('sidebar-open');
    }

    toggleBtn.addEventListener('click', () => {
        isSidebarOpen = !isSidebarOpen;
        body.classList.toggle('sidebar-closed');
        body.classList.toggle('sidebar-open');
        localStorage.setItem('sidebarOpen', isSidebarOpen);
        
        // 사이드바 전환 시 차트 크기 재조정을 위해 약간의 지연 후 윈도우 리사이즈 이벤트 발생
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 400);
    });
}

function initTheme() {
    document.body.className = isSidebarOpen ? `${currentTheme} sidebar-open` : `${currentTheme} sidebar-closed`;
    const themeBtn = document.getElementById('theme-btn');
    themeBtn.innerHTML = currentTheme === 'pastel-dark' ? '🌙' : '🌑';
    
    themeBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'pastel-dark' ? 'pure-dark' : 'pastel-dark';
        document.body.className = isSidebarOpen ? `${currentTheme} sidebar-open` : `${currentTheme} sidebar-closed`;
        themeBtn.innerHTML = currentTheme === 'pastel-dark' ? '🌙' : '🌑';
        localStorage.setItem('theme', currentTheme);
        initAllCharts();
    });
}

function initKoreanNewsWidget() {
    const newsContainer = document.getElementById('tradingview-news');
    if (!newsContainer) return;
    newsContainer.innerHTML = '';
    
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
        "feedMode": "all_symbols",
        "colorTheme": "dark",
        "isTransparent": true,
        "displayMode": "regular",
        "width": "100%",
        "height": "100%",
        "locale": "ko"
    });
    newsContainer.appendChild(script);
}

function setupWatchlistControls() {
    const favBtns = document.querySelectorAll('.fav-btn');
    const watchlistSection = document.getElementById('watchlist-section');

    function updateWatchlistUI() {
        let count = 0;
        document.querySelectorAll('.chart-card').forEach(card => {
            const assetId = card.dataset.id;
            const btn = card.querySelector('.fav-btn');
            if (starredAssets.includes(assetId)) {
                btn.classList.add('active');
                count++;
            } else {
                btn.classList.remove('active');
            }
        });
        if (watchlistSection) watchlistSection.classList.toggle('hidden', count === 0);
    }

    favBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.chart-card');
            const assetId = card.dataset.id;
            if (starredAssets.includes(assetId)) {
                starredAssets = starredAssets.filter(id => id !== assetId);
            } else {
                starredAssets.push(assetId);
            }
            localStorage.setItem('starredAssets', JSON.stringify(starredAssets));
            updateWatchlistUI();
        });
    });
    updateWatchlistUI();
}

function renderAdvancedPro(containerId, symbol, interval = "D") {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ''; 

    const colors = getPastelColors(containerId);
    const themeValue = currentTheme === 'pure-dark' ? '#000000' : '#1a1f26';
    
    new TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": symbol,
        "interval": interval,
        "timezone": "Asia/Seoul",
        "theme": "dark",
        "style": "3", 
        "locale": "ko",
        "toolbar_bg": themeValue,
        "enable_publishing": false,
        "hide_top_toolbar": true, 
        "hide_legend": false, 
        "save_image": true,
        "container_id": containerId,
        "backgroundColor": themeValue,
        "gridColor": "rgba(255, 255, 255, 0.02)",
        "range": interval === "D" ? "3M" : interval === "M" ? "12M" : "1D",
        "overrides": {
            "mainSeriesProperties.areaStyle.linecolor": colors.line,
            "mainSeriesProperties.areaStyle.color1": colors.top,
            "mainSeriesProperties.areaStyle.color2": "rgba(0, 0, 0, 0)",
            "mainSeriesProperties.areaStyle.linewidth": 2,
            "paneProperties.background": themeValue,
            "scalesProperties.textColor": "#a0aec0",
            "scalesProperties.fontSize": 10,
            "legendProperties.showSeriesOHLC": true,
            "legendProperties.showBarChange": true
        }
    });
}

function initClock() {
    const timeDisplay = document.getElementById('market-time');
    if (!timeDisplay) return;
    setInterval(() => {
        timeDisplay.innerHTML = new Date().toLocaleTimeString('ko-KR');
    }, 1000);
}

function getPastelColors(id) {
    let line = "rgba(165, 180, 252, 1)"; 
    if (id.includes('kospi')) line = "rgba(165, 180, 252, 1)";      
    else if (id.includes('sp500')) line = "rgba(253, 164, 175, 1)"; 
    else if (id.includes('nasdaq')) line = "rgba(153, 246, 228, 1)"; 
    else if (id.includes('sox')) line = "rgba(190, 242, 100, 1)";    
    else if (id.includes('gold')) line = "rgba(253, 224, 71, 1)";   
    else if (id.includes('btc')) line = "rgba(244, 114, 182, 1)";    
    return { line: line, top: line.replace('1)', '0.2)') };
}

function initAllCharts() {
    document.querySelectorAll('.chart-card').forEach(card => {
        const container = card.querySelector('.chart-container');
        if (container) renderAdvancedPro(container.id, card.dataset.symbol, "D");
    });
}

function setupIntervalControls() {
    document.querySelectorAll('.int-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.chart-card');
            const container = card.querySelector('.chart-container');
            if (!container) return;
            const interval = e.target.dataset.int;
            card.querySelectorAll('.int-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderAdvancedPro(container.id, card.dataset.symbol, interval);
        });
    });
}
