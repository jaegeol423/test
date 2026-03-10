# Project Blueprint

## Overview
A modern web application featuring Web Components and a persistent theme system (Dark/Light mode).

## Features
- **Web Components:** Reusable `simple-greeting` component.
- **Theme System:** Supports Dark and Light modes using CSS Variables.
- **Persistence:** Remembers the user's theme choice using `localStorage`.
- **Modern UI:** Smooth transitions, responsive layout, and polished styling.

## File Structure
- `index.html`: Main entry point with theme toggle button.
- `main.js`: Contains `SimpleGreeting` component logic and theme switching script.
- `style.css`: Defines the design system with theme-aware CSS variables.

## Implementation Details
1. **CSS Variables:** Used for background, text, card background, and shadows.
2. **Local Storage:** Used to store and retrieve the user's preferred theme.
3. **Shadow DOM:** Encapsulates the component styling while still utilizing global CSS variables.
