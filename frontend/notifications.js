// AUTH CHECK ON PAGE LOAD
if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
    // LOGOUT LOGIC
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

// notifications.js
document.addEventListener("DOMContentLoaded", function () {
    let markReadBtn = document.getElementById("mark-read-btn");
    let unreadItems = document.querySelectorAll(".notif-item.unread");
    let badges = document.querySelectorAll(".badge.alert");

    if (markReadBtn) {
        markReadBtn.addEventListener("click", function() {
            unreadItems.forEach(item => {
                item.classList.remove("unread");
                let dot = item.querySelector(".unread-dot");
                if(dot) dot.style.display = "none";
            });
            badges.forEach(badge => {
                badge.style.display = "none";
            });
        });
    }
});
