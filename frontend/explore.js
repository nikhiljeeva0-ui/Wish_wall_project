// explore.js
const API_URL = window.API_URL || "http://localhost:3000";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", async function () {

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
            // 1. Get current logged-in user from localStorage to hide them
            let currentUser = JSON.parse(localStorage.getItem("user"));
            
            // 2. Fetch all registered users from DB
            let response = await fetch(API_URL + "/users");

            if (response.ok) {
                let allUsers = await response.json();
                userListDiv.innerHTML = ""; // Clear any demo/fake users

                // 3. Filter out the logged-in user (Self User Hide)
                let otherUsers = allUsers.filter(u => u._id !== currentUser._id);

                if (otherUsers.length === 0) {
                    userListDiv.innerHTML = "<p style='font-size:12px; color:gray; padding:10px;'>No other users found.</p>";
                    return;
                }

                // 4. Get fresh following data for the current user to set button states
                let meResponse = await fetch(API_URL + "/users/me", {
                    headers: { "Authorization": "Bearer " + token }
                });
                let meData = await meResponse.json();
                
                let myFollowing = [];
                if (meData.user && meData.user.following) {
                    // Normalize to IDs
                    myFollowing = meData.user.following.map(f => typeof f === 'object' ? f._id : f);
                }

                otherUsers.forEach(u => {
                    // Check if already following
                    let isFollowing = myFollowing.includes(u._id);
                    let btnText = isFollowing ? "Following" : "Follow";
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

    // 5. HELPER: CREATE POST HTML (REAL DATA)
    function createExplorePostHTML(post) {
        let displayName = post.author ? post.author.name : "Unknown User";
        let likesCount = post.likes ? post.likes.length : 0;
        
        let displayContent = post.content || "";
        let emojiMood = "✨ Dreaming";
        let color = "purple";
        let moodWord = "Dreaming";

        // Extract mood and color from content string (Format: "Text|||color|||emoji")
        if (displayContent.includes("|||")) {
            let parts = displayContent.split("|||");
            displayContent = parts[0];
            if (parts.length >= 3) {
                color = parts[1];
                emojiMood = parts[2];
                moodWord = emojiMood.split(" ")[1] || "Dreaming";
            }
        }

        // Handle Anonymous
        if (post.isAnonymous) {
            displayName = "Anonymous";
        }

        let avatarSrc = post.author && post.author.avatar ? post.author.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(displayName);
        if (post.isAnonymous) avatarSrc = "https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous";

        let dateString = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Just now";

        let newPost = document.createElement("div");
        newPost.className = "post box";
        newPost.setAttribute("data-mood", moodWord);
        
        newPost.innerHTML = `
            <div class="post-top" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 15px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${avatarSrc}" class="avatar-sm" style="width: 32px; height: 32px;">
                    <div class="post-meta">
                        <span class="author" style="font-weight: 600; font-size: 14px; display: block;">${displayName}</span>
                        <span class="time" style="font-size: 10px; color: #8e8e8e;">${dateString}</span>
                    </div>
                </div>
                <span class="mood-badge badge-${color}">${emojiMood}</span>
            </div>
            <div class="post-body" style="padding: 0 15px 12px; font-size: 15px;">${displayContent}</div>
            <div class="post-bottom" style="padding: 0 15px 15px;">
                <div class="reactions">
                    <button class="react-btn like-btn" style="background:none; border:1px solid #efefef; border-radius:20px; padding: 5px 12px; cursor:pointer;" onclick="toggleLike('${post._id}', this)">
                        👍 <span>${likesCount}</span>
                    </button>
                </div>
            </div>
        `;
        
        return newPost;
    }

    // 6. GLOBAL FUNCTIONS FOR INLINE ONCLICK (FOLLOW & LIKE)
    window.toggleFollow = async function(userId, buttonElement) {
        // Toggle logic based on current button text
        let isCurrentlyFollowing = buttonElement.innerText.trim() === "Following";
        let endpoint = isCurrentlyFollowing ? "/users/unfollow/" : "/users/follow/";

        try {
            let res = await fetch(API_URL + endpoint + userId, {
                method: "POST",
                headers: { 
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });

            if (res.ok) {
                // Success: Update button state immediately
                if (isCurrentlyFollowing) {
                    buttonElement.innerText = "Follow";
                    buttonElement.classList.remove("active");
                } else {
                    buttonElement.innerText = "Following";
                    buttonElement.classList.add("active");
                }
                
                // Update local storage user data
                let meRes = await fetch(API_URL + "/users/me", {
                    headers: { "Authorization": "Bearer " + token }
                });
                let meData = await meRes.json();
                if (meData.user) {
                    localStorage.setItem("user", JSON.stringify(meData.user));
                }
            } else {
                let errData = await res.json();
                alert(errData.error || "Something went wrong");
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