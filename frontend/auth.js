// auth.js
// Centralized Authentication and Logout logic

(function() {
    const token = localStorage.getItem("token");
    
    // Make token globally available for other scripts
    window.token = token;

    // 1. Redirect to login if NO token (and not already on login page)
    if (!token && !window.location.pathname.includes("login.html")) {
        window.location.href = "login.html";
        return; // Stop execution
    }

    document.addEventListener("DOMContentLoaded", function () {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        
        // 2. Set global user UI (Avatar)
        if (user) {
            const avatarUrl = user.avatar || ("https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(user.name));
            
            const avatarElements = document.querySelectorAll(".profile-icon img, .composer .avatar-sm, .nav-item .avatar-sm, .profile-avatar-large");
            avatarElements.forEach(img => {
                if (img) img.src = avatarUrl;
            });
        }

        // 3. Logout logic
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function(e) {
                e.preventDefault();
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "login.html";
            });
        }
    });
})();
