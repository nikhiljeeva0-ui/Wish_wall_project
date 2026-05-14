// explore.js
const API_URL = "http://localhost:3000";

// 1. AUTH CHECK
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", async function () {
    // 2. LOGOUT LOGIC
    let logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });
    }

    let filterBtns = document.querySelectorAll(".explore-moods .mood-tag");
    let exploreFeed = document.getElementById("explore-feed");
    let searchInput = document.getElementById("explore-search");

    // LOAD POSTS AND USERS
    await loadExplorePosts();
    await loadUsers();

    // 3. FETCH AND SHOW TRENDING POSTS
    async function loadExplorePosts() {
        if (!exploreFeed) return;

        try {
            let response = await fetch(API_URL + "/posts");
            if (response.ok) {
                let posts = await response.json();

                // Sort posts by number of likes to simulate "trending"
                posts.sort((a, b) => {
                    let aLikes = a.likes ? a.likes.length : 0;
                    let bLikes = b.likes ? b.likes.length : 0;
                    return bLikes - aLikes;
                });

                exploreFeed.innerHTML = "";

                if (posts.length === 0) {
                    exploreFeed.innerHTML = "<p>No posts available to explore yet.</p>";
                    return;
                }

                posts.forEach(post => {
                    exploreFeed.appendChild(createExplorePostHTML(post));
                });
            }
        } catch (e) {
            console.error("Error loading explore posts:", e);
        }
    }

    // 4. FETCH AND SHOW USERS (WHO TO FOLLOW)
    async function loadUsers() {
        let userListDiv = document.querySelector(".user-list");
        if (!userListDiv) return;

        try {
            let currentUser = JSON.parse(localStorage.getItem("user"));
            let response = await fetch(API_URL + "/users");

            if (response.ok) {
                let allUsers = await response.json();
                userListDiv.innerHTML = ""; // clear dummies

                // Don't show myself
                let otherUsers = allUsers.filter(u => u._id !== currentUser._id);

                if (otherUsers.length === 0) {
                    userListDiv.innerHTML = "<p style='font-size:12px; color:gray;'>No other users found.</p>";
                    return;
                }

                // Get current user's updated following list
                let meResponse = await fetch(API_URL + "/users/me", {
                    headers: { "Authorization": "Bearer " + token }
                });
                let meData = await meResponse.json();
                let myFollowing = meData.user ? meData.user.following : [];

                otherUsers.forEach(u => {
                    let isFollowing = myFollowing.includes(u._id);
                    let btnText = isFollowing ? "Unfollow" : "Follow";
                    let btnClass = isFollowing ? "btn-follow active" : "btn-follow";

                    let userRow = document.createElement("div");
                    userRow.className = "user-row";

                    userRow.innerHTML = `
                        <img src="${u.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(u.name)}" class="avatar-sm" alt="User">
                        <div class="user-info">
                            <span class="u-name">${u.name}</span>
                            <span class="u-handle">@${u.email.split("@")[0]}</span>
                        </div>
                        <button class="${btnClass}" onclick="toggleFollow('${u._id}', this)">${btnText}</button>
                    `;
                    userListDiv.appendChild(userRow);
                });
            }
        } catch(e) {
            console.log("Error loading users:", e);
        }
    }

    // 5. HELPER: CREATE POST HTML
    function createExplorePostHTML(post) {
        let displayName = post.author ? post.author.name : "Anonymous";
        let likesCount = post.likes ? post.likes.length : 0;
        
        let displayContent = post.content || "";
        let emojiMood = "✨ Dreaming";
        let color = "purple";
        let moodWord = "Dreaming";

        if (displayContent.includes("|||")) {
            let parts = displayContent.split("|||");
            displayContent = parts[0];
            if (parts.length >= 3) {
                color = parts[1];
                emojiMood = parts[2];
                moodWord = emojiMood.split(" ")[1] || "Dreaming";
            }
        } else {
            const emojis = ["✨ Dreaming", "🔥 Hustle", "💖 Love", "🌍 Travel", "🚀 Startup", "🎯 Goals"];
            const colors = ["purple", "orange", "pink", "blue", "yellow", "green"];
            let randomIdx = Math.floor(Math.random() * emojis.length);
            emojiMood = emojis[randomIdx];
            color = colors[randomIdx];
            moodWord = emojiMood.split(" ")[1];
        }

        let avatar = `<img src="${post.author && post.author.avatar ? post.author.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(displayName)}" class="avatar-sm" alt="User">`;
            
        let dateString = post.createdAt ? new Date(post.createdAt).toLocaleString() : "Just now";

        let newPost = document.createElement("div");
        newPost.className = "post box";
        newPost.setAttribute("data-mood", moodWord);
        
        newPost.innerHTML = `
            <div class="post-top">
                ${avatar}
                <div class="post-meta">
                    <span class="author">${displayName}</span>
                    <span class="time">${dateString}</span>
                </div>
                <span class="mood-badge badge-${color}">${emojiMood}</span>
            </div>
            <div class="post-body">${displayContent}</div>
            <div class="post-bottom">
                <div class="reactions">
                    <button class="react-btn like-btn" onclick="toggleLike('${post._id}', this)">👍 <span>${likesCount}</span></button>
                </div>
            </div>
        `;
        
        return newPost;
    }

    // 6. GLOBAL FUNCTIONS FOR INLINE ONCLICK (FOLLOW & LIKE)
    window.toggleFollow = async function(userId, buttonElement) {
        let isFollowing = buttonElement.innerText === "Unfollow";
        let endpoint = isFollowing ? "/users/unfollow/" : "/users/follow/";

        try {
            let res = await fetch(API_URL + endpoint + userId, {
                method: "POST",
                headers: { 
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });

            if (res.ok) {
                if (isFollowing) {
                    buttonElement.innerText = "Follow";
                    buttonElement.classList.remove("active");
                } else {
                    buttonElement.innerText = "Unfollow";
                    buttonElement.classList.add("active");
                }
                // Optional: Refresh users to update counts if displayed
                // loadUsers(); 
            } else {
                let errData = await res.json();
                console.error("Follow error:", errData.error);
            }
        } catch (err) {
            console.log("Error toggling follow:", err);
        }
    };

    window.toggleLike = async function(postId, buttonElement) {
        let span = buttonElement.querySelector("span");
        let currentLikes = parseInt(span.innerText);
        let isLiked = buttonElement.classList.contains("active");

        if (isLiked) {
            buttonElement.classList.remove("active");
            span.innerText = currentLikes - 1;
        } else {
            buttonElement.classList.add("active");
            span.innerText = currentLikes + 1;
        }

        let endpoint = isLiked ? "/posts/unlike/" : "/posts/like/";
        try {
            await fetch(API_URL + endpoint + postId, {
                method: "PUT",
                headers: { "Authorization": "Bearer " + token }
            });
        } catch (err) {}
    };

    // 7. FILTER LOGIC
    filterBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            filterBtns.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            
            let filter = this.getAttribute("data-filter");
            let domPosts = document.querySelectorAll("#explore-feed .post");
            
            domPosts.forEach(post => {
                if (filter === "All" || post.getAttribute("data-mood") === filter) {
                    post.style.display = "flex";
                } else {
                    post.style.display = "none";
                }
            });
        });
    });

    // 8. SEARCH LOGIC
    if (searchInput) {
        searchInput.addEventListener("input", function() {
            let term = this.value.toLowerCase().trim();
            let domPosts = document.querySelectorAll("#explore-feed .post");
            domPosts.forEach(post => {
                let txt = post.innerText.toLowerCase();
                post.style.display = txt.includes(term) ? "flex" : "none";
            });
        });
    }
});