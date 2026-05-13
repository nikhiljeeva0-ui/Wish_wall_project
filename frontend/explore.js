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

    let filterBtns = document.querySelectorAll(".explore-moods .mood-tag");
    let exploreFeed = document.getElementById("explore-feed");
    let searchInput = document.getElementById("explore-search");
    let API_BASE = "http://localhost:3000";

    // FETCH REAL POSTS FOR EXPLORE PAGE
    async function loadExplorePosts() {
        if (!exploreFeed) return;
        
        try {
            let response = await fetch(API_BASE + "/posts");
            if (response.ok) {
                let posts = await response.json();
                
                // Sort posts by number of likes (Trending)
                posts.sort((a, b) => {
                    let aLikes = a.likes ? a.likes.length : 0;
                    let bLikes = b.likes ? b.likes.length : 0;
                    return bLikes - aLikes;
                });
                
                exploreFeed.innerHTML = ""; // Clear dummy data
                
                if (posts.length === 0) {
                    exploreFeed.innerHTML = "<p>No posts available to explore yet.</p>";
                    return;
                }

                posts.forEach(post => {
                    let displayName = "Anonymous";
                    if (post.author && post.author.name) displayName = post.author.name;
                    else if (post.authorId) displayName = post.authorId;
                    
                    let likesCount = post.likes ? post.likes.length : 0;
                    let avatar = displayName !== "Anonymous" 
                        ? `<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}" class="avatar-sm" alt="User">`
                        : `<div class="avatar-sm anon-pic">?</div>`;
                        
                    // Random mood since backend doesn't store mood
                    const emojis = ["✨ Dreaming", "🔥 Hustle", "💖 Love", "🌍 Travel", "🚀 Startup", "🎯 Goals"];
                    const colors = ["purple", "orange", "pink", "blue", "yellow", "green"];
                    let randomIdx = Math.floor(Math.random() * emojis.length);
                    let emojiMood = emojis[randomIdx];
                    let color = colors[randomIdx];
                    
                    let dateString = post.createdAt ? new Date(post.createdAt).toLocaleString() : "Just now";

                    let newPost = document.createElement("div");
                    newPost.className = "post box";
                    newPost.setAttribute("data-mood", emojis[randomIdx].split(" ")[1]); // For filtering
                    if (displayName === "Anonymous") newPost.classList.add("anon-post");
                    
                    newPost.innerHTML = `
                        <div class="post-top">
                            ${avatar}
                            <div class="post-meta">
                                <span class="author">${displayName}</span>
                                <span class="time">${dateString}</span>
                            </div>
                            <span class="mood-badge badge-${color}">${emojiMood}</span>
                        </div>
                        <div class="post-body">${post.content || ""}</div>
                        <div class="post-bottom">
                            <div class="reactions">
                                <button class="react-btn like-btn" data-id="${post._id}">👍 <span>${likesCount}</span></button>
                                <button class="react-btn">❤️ <span>0</span></button>
                            </div>
                            <div class="actions">
                                <button class="action-btn"><i class="bi bi-bookmark"></i> Save</button>
                            </div>
                        </div>
                    `;
                    
                    // Simple Like Logic
                    let likeBtn = newPost.querySelector(".like-btn");
                    if (likeBtn) {
                        likeBtn.addEventListener("click", async function() {
                            let token = localStorage.getItem("token");
                            try {
                                let res = await fetch(`${API_BASE}/posts/like/${post._id}`, {
                                    method: "PUT",
                                    headers: { "Authorization": `Bearer ${token}` }
                                });
                                if (res.ok) {
                                    this.classList.add("active");
                                    let span = this.querySelector("span");
                                    span.textContent = parseInt(span.textContent) + 1;
                                }
                            } catch(e) { console.error(e); }
                        });
                    }
                    
                    exploreFeed.appendChild(newPost);
                });
                
            }
        } catch(e) {
            console.error("Error loading explore posts:", e);
        }
    }
    
    // Load the posts
    loadExplorePosts();

    // FILTER LOGIC
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

    // SEARCH LOGIC
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
