// profile.js
const API_URL = window.API_URL || "http://localhost:3000";

// 1. AUTH CHECK ON PAGE LOAD
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", async function () {
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

    // 3. TAB SWITCHING LOGIC
    let tabs = document.querySelectorAll(".p-tab");
    let contents = document.querySelectorAll(".tab-content");

    tabs.forEach(function(tab) {
        tab.addEventListener("click", function() {
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active-tab"));

            this.classList.add("active");
            let targetId = this.getAttribute("data-tab") + "-tab";
            let targetContent = document.getElementById(targetId);

            if(targetContent) {
                targetContent.classList.add("active-tab");
            }
        });
    });

    // 4. LOAD ALL PROFILE DATA
    await loadUserProfile();
    await loadUserPosts();
    await loadUserBookmarks();
    await loadUsers();

    // FUNCTION TO LOAD USER INFO (STATS, NAME, AVATAR)
    async function loadUserProfile() {
        try {
            console.log("Fetching fresh profile data from server...");
            let res = await fetch(API_URL + "/users/me", {
                headers: { "Authorization": "Bearer " + token }
            });
            let data = await res.json();
            
            if (res.ok && data.user) {
                let user = data.user;
                console.log("Fresh Profile Data Received:", user);
                
                // Update Name
                let nameEl = document.querySelector(".profile-name");
                if (nameEl) nameEl.textContent = user.name;
                
                // Update Username (using email prefix as handle)
                let usernameEl = document.querySelector(".profile-username");
                if (usernameEl && user.email) {
                    usernameEl.textContent = "@" + user.email.split("@")[0];
                }

                // Update Bio
                let bioEl = document.querySelector(".profile-bio");
                if (bioEl) {
                    bioEl.textContent = user.bio || "Write a little bit about yourself...";
                }
                
                // Update Avatar images everywhere
                let avatarEls = document.querySelectorAll(".profile-avatar-large, .profile-icon img");
                avatarEls.forEach(img => {
                    img.src = user.avatar || ("https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(user.name));
                });

                // Sync localStorage with latest data from server
                localStorage.setItem("user", JSON.stringify(user));
                
                // Update Stats (Followers, Following)
                let statNums = document.querySelectorAll(".stat-num");
                if (statNums.length >= 3) {
                    statNums[1].textContent = user.followers ? user.followers.length : 0;
                    statNums[2].textContent = user.following ? user.following.length : 0;
                }
            }
        } catch (err) {
            console.log("Error loading profile info:", err);
        }
    }

    // FUNCTION TO LOAD USER'S OWN POSTS
    async function loadUserPosts() {
        try {
            let userStr = localStorage.getItem("user");
            if(!userStr) return;
            let currentUser = JSON.parse(userStr);

            let res = await fetch(API_URL + "/posts");
            let posts = await res.json();

            // Filter to get only posts where author matches current user
            let myPosts = posts.filter(
                (post) => post.author && post.author._id === currentUser._id
            );

            // Update the "Wishes" stat number
            let statNums = document.querySelectorAll(".stat-num");
            if (statNums.length >= 1) {
                statNums[0].textContent = myPosts.length;
            }

            const container = document.getElementById("profilePosts");
            if (!container) return;

            if (myPosts.length === 0) {
                container.innerHTML = `
                    <div style="text-align:center; padding: 40px; color: gray;">
                        <i class="bi bi-wind" style="font-size: 3rem; display: block; margin-bottom: 10px;"></i>
                        <p>You haven't made any wishes yet.</p>
                        <a href="newwish.html" class="btn-follow" style="text-decoration:none; display:inline-block; margin-top:10px;">Create your first wish</a>
                    </div>`;
                return;
            }

            container.innerHTML = ""; // Clear
            myPosts.forEach((post) => {
                container.appendChild(createPostHTML(post));
            });

        } catch (err) {
            console.log("Error loading posts:", err);
        }
    }

    // FUNCTION TO LOAD BOOKMARKED POSTS
    async function loadUserBookmarks() {
        try {
            let res = await fetch(API_URL + "/users/bookmarks", {
                headers: { "Authorization": "Bearer " + token }
            });
            let bookmarks = await res.json();

            const savedTab = document.getElementById("saved-tab");
            if (!savedTab) return;

            if (!bookmarks || bookmarks.length === 0) {
                savedTab.innerHTML = `
                    <div style="text-align:center; padding: 40px; color: gray;">
                        <i class="bi bi-bookmark" style="font-size: 3rem; display: block; margin-bottom: 10px;"></i>
                        <p>No saved wishes yet.</p>
                    </div>`;
                return;
            }

            savedTab.innerHTML = ""; // Clear placeholder
            bookmarks.forEach((post) => {
                savedTab.appendChild(createPostHTML(post));
            });

        } catch (err) {
            console.log("Error loading bookmarks:", err);
        }
    }

    // HELPER FUNCTION: Create HTML for a post inside the profile
    function createPostHTML(post) {
        let postDiv = document.createElement("div");
        postDiv.className = "post box";

        let authorName = post.author ? post.author.name : "Anonymous";
        let avatarSrc = post.author && post.author.avatar ? post.author.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(authorName);
        
        if (post.isAnonymous) {
            authorName = "Anonymous (You)";
            avatarSrc = "https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous";
        }

        let dateString = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Just now";
        let likesCount = post.likes ? post.likes.length : 0;

        let displayContent = post.content || "";
        if (displayContent.includes("|||")) {
            displayContent = displayContent.split("|||")[0];
        }

        let currentUser = JSON.parse(localStorage.getItem("user"));
        let deleteBtnHTML = "";
        if (currentUser && post.author && post.author._id === currentUser._id) {
            deleteBtnHTML = `<i class="bi bi-trash" onclick="deletePost('${post._id}')" style="color: #ed4956; cursor: pointer; font-size: 20px;"></i>`;
        }

        postDiv.innerHTML = `
            <div class="post-header" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 15px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${avatarSrc}" class="avatar-sm" style="width: 32px; height: 32px;">
                    <span class="author" style="font-weight: 600; font-size: 14px;">${authorName}</span>
                </div>
            </div>
            
            <div class="post-body" style="padding: 0 15px 12px; font-size: 15px; line-height: 1.5;">
                ${displayContent}
            </div>
            
            <div class="post-footer" style="padding: 0 15px 15px;">
                <div class="footer-actions" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 22px;">
                    <div style="display: flex; gap: 15px;">
                        <i class="bi bi-heart" style="cursor: pointer;"></i>
                        <i class="bi bi-chat" style="cursor: pointer;"></i>
                    </div>
                    ${deleteBtnHTML}
                </div>
                <div class="likes-info" style="font-weight: 600; font-size: 14px; margin-bottom: 5px;">
                    <span>${likesCount}</span> likes
                </div>
                <div class="caption" style="font-size: 14px; margin-bottom: 5px;">
                    <strong>${authorName}</strong> ${displayContent}
                </div>
                <div class="time" style="font-size: 10px; color: #8e8e8e; text-transform: uppercase;">
                    ${dateString}
                </div>
            </div>
        `;
        return postDiv;
    }

    window.deletePost = async function(postId) {
        if (!confirm("Delete this wish permanently?")) return;
        try {
            let res = await fetch(API_URL + "/posts/" + postId, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });
            if (res.ok) {
                alert("Wish deleted.");
                location.reload();
            } else {
                alert("Failed to delete.");
            }
        } catch (err) {
            console.log(err);
        }
    };

    // FUNCTION TO LOAD OTHER USERS (SIMILAR PROFILES)
    async function loadUsers() {
        let userListDiv = document.querySelector(".user-list");
        if (!userListDiv) return;

        try {
            let currentUser = JSON.parse(localStorage.getItem("user"));
            let response = await fetch(API_URL + "/users");

            if (response.ok) {
                let allUsers = await response.json();
                userListDiv.innerHTML = ""; 

                // Don't show myself
                let otherUsers = allUsers.filter(u => u._id !== currentUser._id);

                if (otherUsers.length === 0) {
                    userListDiv.innerHTML = "<p style='font-size:12px; color:gray;'>No other users found.</p>";
                    return;
                }

                // Show only 3 random users
                let randomUsers = otherUsers.sort(() => 0.5 - Math.random()).slice(0, 3);

                randomUsers.forEach(u => {
                    let userRow = document.createElement("div");
                    userRow.className = "user-row";
                    userRow.innerHTML = `
                        <img src="${u.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(u.name)}" class="avatar-sm" alt="User">
                        <div class="user-info">
                            <span class="u-name">${u.name}</span>
                            <span class="u-handle">@${u.email.split("@")[0]}</span>
                        </div>
                        <button class="btn-follow" onclick="location.href='explore.html'">View</button>
                    `;
                    userListDiv.appendChild(userRow);
                });
            }
        } catch(e) {
            console.log("Error loading users:", e);
        }
    }
});
