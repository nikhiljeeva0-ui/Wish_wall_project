// config.js
// Centralized configuration for the WishWall project

const CONFIG = {
    API_URL: "https://garuda-wishwall-backend.onrender.com", // Production URL
    // API_URL: "http://localhost:3000", // Local development URL
};

// Make it globally accessible
window.API_URL = CONFIG.API_URL;
