# Blueprint: KOSPI Market Dashboard

## Overview

A real-time financial dashboard designed to monitor the KOSPI index and its primary global influencers. It provides a centralized view of various charts, including US futures, exchange rates, and key stocks, helping investors predict market movements at a glance.

## Features

*   **Multi-Chart Grid:** A responsive layout displaying multiple financial charts simultaneously using TradingView widgets.
*   **Real-Time Monitoring:** Tracks S&P 500, NASDAQ, and KOSPI 200 futures to gauge market sentiment.
*   **Currency Tracker:** Real-time USD/KRW exchange rate monitoring to understand foreign capital flow.
*   **Key Stock Watch:** Focuses on market leaders like Samsung Electronics.
*   **Economic Indicators:** Monitors US 10Y Treasury Yields and other macro data.
*   **Dark Mode UI:** A professional, high-contrast dark theme optimized for long-term monitoring and data readability.

## Components to Track

1.  **KOSPI Index:** The primary target.
2.  **S&P 500 / NASDAQ 100 Futures:** Major overnight indicators.
3.  **USD/KRW:** Impact on foreign investment.
4.  **US 10Y Yield:** Global liquidity indicator.
5.  **VIX:** Market volatility/fear index.
6.  **Samsung Electronics (005930):** The heavyweight of the KOSPI.

## Technical Stack

*   **HTML5/CSS3:** Grid/Flexbox for the dashboard layout.
*   **JavaScript:** Minor logic for UI interactions and widget initialization.
*   **TradingView Widgets:** External library for high-quality, real-time financial charts.

## Implementation Steps

1.  **Layout Design:** Create a responsive CSS Grid for a 2x3 or 3x2 chart layout.
2.  **Widget Integration:** Embed TradingView's lightweight charts and technical analysis widgets.
3.  **Refinement:** Ensure all charts are synchronized and look consistent in the dark theme.
4.  **Mobile Optimization:** Stack charts vertically for mobile devices.
