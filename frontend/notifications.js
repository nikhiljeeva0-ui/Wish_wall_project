// notifications.js
const API_URL = window.API_URL || "http://localhost:3000";

document.addEventListener("DOMContentLoaded", function () {
    let listContainer = document.querySelector(".notifications-list");
    let markReadBtn = document.getElementById("mark-read-btn");
    let badge = document.querySelector(".badge.alert");

    // Notifications array (Start empty for MVP as per user request to remove fake data)
    let notifications = [];

    // 1. RENDER NOTIFICATIONS
    function renderNotifications() {
        if (!listContainer) return;

        listContainer.innerHTML = ""; // clear HTML placeholders

        if (notifications.length === 0) {
            listContainer.innerHTML = `
                <div style="padding: 40px; text-align: center; color: gray;">
                    <i class="bi bi-bell-slash" style="font-size: 3rem; display: block; margin-bottom: 10px; opacity: 0.5;"></i>
                    <p>No notifications yet.</p>
                    <span style="font-size: 12px;">We'll let you know when someone interacts with your wishes!</span>
                </div>`;
            if (badge) badge.style.display = "none";
            return;
        }

        let unreadCount = 0;
        notifications.forEach(notif => {
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
                notifications = notifications.filter(n => n.id !== idToRemove);
                renderNotifications();
            });
        });
    }

    // Initialize
    renderNotifications();

    if (markReadBtn) {
        markReadBtn.addEventListener("click", function() {
            notifications.forEach(n => n.isRead = true);
            renderNotifications();
        });
    }
});
