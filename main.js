/**
 * MARKET INSIGHT PRO - Personalization & News Logic
 */

let starredAssets = JSON.parse(localStorage.getItem('starredAssets')) || [];
let currentTheme = localStorage.getItem('theme') || 'pastel-dark';

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initTheme();
    initNewsWidget();
    initAllCharts();
    setupIntervalControls();
    setupWatchlistControls();
    setupFooterActions();
});

// 1. 테마 초기화 및 전환
function initTheme() {
    document.body.className = currentTheme;
    const themeBtn = document.getElementById('theme-btn');
    themeBtn.innerHTML = currentTheme === 'pastel-dark' ? '🌙' : '🌑';
    
    themeBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'pastel-dark' ? 'pure-dark' : 'pastel-dark';
        document.body.className = currentTheme;
        themeBtn.innerHTML = currentTheme === 'pastel-dark' ? '🌙' : '🌑';
        localStorage.setItem('theme', currentTheme);
        // 테마 변경 시 차트 재로드 (배경색 동기화)
        initAllCharts();
    });
}

// 2. 뉴스 위젯 초기화
function initNewsWidget() {
    new TradingView.EventsWidget({
        "colorTheme": currentTheme === 'pastel-dark' ? "dark" : "dark",
        "isTransparent": true,
        "width": "100%",
        "height": "100%",
        "locale": "ko",
        "importanceFilter": "-1,0,1",
        "currencyFilter": "USD,KRW,JPY",
        "container_id": "tradingview-news"
    });
}

// 3. 즐겨찾기(Watchlist) 로직
function setupWatchlistControls() {
    const favBtns = document.querySelectorAll('.fav-btn');
    const watchlistGrid = document.getElementById('watchlist-grid');
    const watchlistSection = document.getElementById('watchlist-section');

    function updateWatchlistUI() {
        const starredCards = document.querySelectorAll('.chart-card');
        let count = 0;

        starredCards.forEach(card => {
            const assetId = card.dataset.id;
            const btn = card.querySelector('.fav-btn');
            
            if (starredAssets.includes(assetId)) {
                btn.classList.add('active');
                count++;
            } else {
                btn.classList.remove('active');
            }
        });

        watchlistSection.classList.toggle('hidden', count === 0);
        
        // 찜한 목록 전용 그리드 업데이트 로직 (간소화를 위해 현재는 별점 표시만 활성화)
        // 실제 구현 시Starred 카드를 복제하여 상단 그리드에 추가하는 로직이 들어갑니다.
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

// 4. 차트 렌더링 (이미지 저장 기능 활성화)
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
        "save_image": true, // 이미지 저장 기능 활성화!
        "container_id": containerId,
        "backgroundColor": themeValue,
        "gridColor": "rgba(255, 255, 255, 0.03)",
        "range": interval === "D" ? "3M" : interval === "M" ? "12M" : "1D",
        "overrides": {
            "mainSeriesProperties.areaStyle.linecolor": colors.line,
            "mainSeriesProperties.areaStyle.color1": colors.top,
            "mainSeriesProperties.areaStyle.color2": "rgba(0, 0, 0, 0)",
            "mainSeriesProperties.areaStyle.linewidth": 3,
            "paneProperties.background": themeValue,
            "scalesProperties.textColor": "#a0aec0",
            "legendProperties.showSeriesOHLC": true,
            "legendProperties.showBarChange": true
        }
    });
}

// 5. 푸터 액션 (캡처 및 엑셀)
function setupFooterActions() {
    document.getElementById('export-csv').addEventListener('click', () => {
        alert('현재 차트 데이터의 최근 100개 봉 데이터를 CSV로 추출합니다. (데모)');
    });

    document.getElementById('capture-screen').addEventListener('click', () => {
        window.print(); // 간단한 전체 화면 캡처 대용
    });
}

// --- 공통 유틸 함수 (이전과 동일) ---
function initClock() {
    const timeDisplay = document.getElementById('market-time');
    function updateClock() {
        const now = new Date();
        timeDisplay.innerHTML = now.toLocaleTimeString();
    }
    setInterval(updateClock, 1000);
}

function checkMarketHours(date) {
    const day = date.getDay();
    const timeValue = date.getHours() * 100 + date.getMinutes();
    return day !== 0 && day !== 6 && timeValue >= 900 && timeValue <= 1530;
}

function getPastelColors(id) {
    let line = "rgba(165, 180, 252, 1)"; 
    if (id.includes('kospi')) line = "rgba(165, 180, 252, 1)";      
    else if (id.includes('sp500')) line = "rgba(253, 164, 175, 1)"; 
    else if (id.includes('nasdaq')) line = "rgba(153, 246, 228, 1)"; 
    else if (id.includes('sox')) line = "rgba(190, 242, 100, 1)";    
    else if (id.includes('gold')) line = "rgba(253, 224, 71, 1)";   
    else if (id.includes('btc')) line = "rgba(244, 114, 182, 1)";    
    return { line: line, top: line.replace('1)', '0.3)') };
}

function initAllCharts() {
    const cards = document.querySelectorAll('.chart-card');
    cards.forEach(card => {
        const container = card.querySelector('.chart-container');
        if (container) renderAdvancedPro(container.id, card.dataset.symbol, "D");
    });
}

function setupIntervalControls() {
    const buttons = document.querySelectorAll('.int-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.chart-card');
            const container = card.querySelector('.chart-container');
            const interval = e.target.dataset.int;
            card.querySelectorAll('.int-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderAdvancedPro(container.id, card.dataset.symbol, interval);
        });
    });
}
