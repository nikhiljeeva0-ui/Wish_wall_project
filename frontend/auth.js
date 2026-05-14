// auth.js
// Centralized Authentication and Logout logic to prevent code duplication
if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
    // Set user avatar in sidebar
    let user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        let sidebarAvatar = document.querySelector(".profile-icon img");
        if (sidebarAvatar) {
            sidebarAvatar.src = user.avatar || ("https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(user.name));
        }
        
        // Also update any other global avatars if they exist
        let composerAvatar = document.querySelector(".composer .avatar-sm");
        if (composerAvatar) {
            composerAvatar.src = user.avatar || ("https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(user.name));
        }
    }

    let logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(e) {
            e.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });
    }
});
