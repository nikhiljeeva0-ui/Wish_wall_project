// profile.js
const API_URL = "https://garuda-wishwall-backend.onrender.com";

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

                // Update Stats (Followers, Following)
                let statNums = document.querySelectorAll(".stat-num");
                if (statNums.length >= 3) {
                    // index 0 is Wishes (handled later)
                    statNums[1].textContent = user.followers ? user.followers.length : 0; // Followers
                    statNums[2].textContent = user.following ? user.following.length : 0; // Following
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
                container.innerHTML = '<div class="feed-footer">No wishes posted yet.</div>';
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
                savedTab.innerHTML = '<div class="feed-footer">No saved wishes yet.</div>';
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
        let dateString = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Just now";
        let likesCount = post.likes ? post.likes.length : 0;

        let displayContent = post.content || "";
        if (displayContent.includes("|||")) {
            displayContent = displayContent.split("|||")[0];
        }

        let currentUser = JSON.parse(localStorage.getItem("user"));
        let deleteBtnHTML = "";
        if (currentUser && post.author && post.author._id === currentUser._id) {
            deleteBtnHTML = `<button class="action-btn delete-btn" onclick="deletePost('${post._id}')" style="color: red; border:none; background:none; cursor:pointer;"><i class="bi bi-trash"></i> Delete</button>`;
        }

        postDiv.innerHTML = `
            <div class="post-top">
                <img src="${post.author && post.author.avatar ? post.author.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(authorName)}" class="avatar-sm">
                <div class="post-meta">
                    <span class="author">${authorName}</span>
                    <span class="time">${dateString}</span>
                </div>
            </div>
            
            <div class="post-body">
                ${displayContent}
            </div>
            
            <div class="post-bottom">
                <div style="display:flex; justify-content: space-between; align-items:center; width:100%;">
                    <span>❤️ ${likesCount} Likes</span>
                    ${deleteBtnHTML}
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
});
