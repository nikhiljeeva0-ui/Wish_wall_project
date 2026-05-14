// notifications.js
const API_URL = "https://wish-wall-project-1.onrender.com";

// 1. AUTH CHECK
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
    // 2. LOGOUT LOGIC
    let logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(e) {
            e.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });
    }

    // 3. DUMMY NOTIFICATIONS DATA
    // Since the backend does not have a notifications API yet, we will use a simple array.
    let dummyNotifications = [
        {
            id: 1,
            type: "like",
            user: "Rahul J.",
            message: 'liked your wish: "I wish I could travel..."',
            time: "10m ago",
            icon: "bi-heart-fill",
            colorClass: "bg-pink",
            isRead: false
        },
        {
            id: 2,
            type: "follow",
            user: "Anita",
            message: "started following you.",
            time: "2h ago",
            icon: "bi-person-plus-fill",
            colorClass: "bg-blue",
            isRead: true
        },
        {
            id: 3,
            type: "comment",
            user: "Samir",
            message: 'replied: "That sounds amazing!"',
            time: "1d ago",
            icon: "bi-chat-fill",
            colorClass: "bg-purple",
            isRead: true
        }
    ];

    let listContainer = document.querySelector(".notifications-list");
    let markReadBtn = document.getElementById("mark-read-btn");
    let badge = document.querySelector(".badge.alert");

    // 4. RENDER NOTIFICATIONS
    function renderNotifications() {
        if (!listContainer) return;

        listContainer.innerHTML = ""; // clear HTML placeholders

        if (dummyNotifications.length === 0) {
            listContainer.innerHTML = "<p style='padding: 20px; text-align: center; color: gray;'>No notifications yet.</p>";
            if (badge) badge.style.display = "none";
            return;
        }

        let unreadCount = 0;

        dummyNotifications.forEach(notif => {
            if (!notif.isRead) unreadCount++;

            let unreadClass = notif.isRead ? "" : "unread";
            let dotHtml = notif.isRead ? "" : '<div class="unread-dot"></div>';

            let notifEl = document.createElement("div");
            notifEl.className = `notif-item ${unreadClass}`;
            notifEl.innerHTML = `
                <div class="notif-icon ${notif.colorClass}"><i class="bi ${notif.icon}"></i></div>
                <div class="notif-content">
                    <p><strong>${notif.user}</strong> ${notif.message}</p>
                    <span class="time">${notif.time}</span>
                </div>
                ${dotHtml}
                <button class="clear-notif-btn" data-id="${notif.id}" style="margin-left: auto; border: none; background: none; color: gray; cursor: pointer; font-size: 18px;">&times;</button>
            `;

            listContainer.appendChild(notifEl);
        });

        // Update badge
        if (badge) {
            if (unreadCount > 0) {
                badge.style.display = "flex";
                badge.textContent = unreadCount;
            } else {
                badge.style.display = "none";
            }
        }

        // Attach event listeners to clear buttons
        document.querySelectorAll(".clear-notif-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                let idToRemove = parseInt(this.getAttribute("data-id"));
                dummyNotifications = dummyNotifications.filter(n => n.id !== idToRemove);
                renderNotifications();
            });
        });
    }

    // Initialize list
    renderNotifications();

    // 5. MARK ALL AS READ LOGIC
    if (markReadBtn) {
        markReadBtn.addEventListener("click", function() {
            dummyNotifications.forEach(n => n.isRead = true);
            renderNotifications();
        });
    }
});
