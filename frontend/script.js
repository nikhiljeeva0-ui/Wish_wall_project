// script.js
const API_URL = window.API_URL || "http://localhost:3000";

// 1. SIMPLE AUTH CHECK ON PAGE LOAD
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html"; // Redirect if not logged in
}

document.addEventListener("DOMContentLoaded", function () {
    // 2. GET HTML ELEMENTS
    let logoutBtn = document.getElementById("logout-btn");
    let textarea = document.getElementById("wish-textarea");
    let postBtn = document.getElementById("send-wish-btn");
    let mainFeed = document.getElementById("main-content");
    let postsContainer = document.getElementById("posts-container");
    let nameInput = document.getElementById("name-input");
    let anonToggle = document.getElementById("anon-toggle");
    let countDisplay = document.querySelector(".count");
    
    // MOOD SELECTOR LOGIC
    let moodButtons = document.querySelectorAll(".mood-tag");
    let selectedColor = "purple";
    let selectedEmoji = "✨ Dreaming";

    if (moodButtons.length > 0) {
        moodButtons.forEach(btn => {
            btn.addEventListener("click", function() {
                // 1. Remove "active" from all buttons, add to clicked one
                moodButtons.forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                
                // 2. Save the color and text so we can send it to backend
                selectedColor = this.getAttribute("data-color");
                selectedEmoji = this.innerText.trim();
                
                console.log("Mood Selected:", selectedEmoji, selectedColor);
            });
        });
    }
    
    // 3. LOAD ALL POSTS WHEN PAGE OPENS
    loadPosts();

    // 4. LOGOUT LOGIC
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(e) {
            e.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });
    }

    // UPDATE CHARACTER COUNT
    if (textarea && countDisplay) {
        textarea.addEventListener("input", function() {
            countDisplay.textContent = textarea.value.length + "/280";
        });
    }

    // 5. CREATE NEW POST (WISH)
    if (postBtn) {
        postBtn.addEventListener("click", async function() {
            let text = textarea.value.trim();
            if (text === "") {
                alert("Please write something first!");
                return;
            }

            try {
                let response = await fetch(API_URL + "/posts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },
                    body: JSON.stringify({ 
                        content: text + "|||" + selectedColor + "|||" + selectedEmoji,
                        isAnonymous: anonToggle ? anonToggle.checked : false
                    })
                });

                if (response.ok) {
                    textarea.value = ""; // clear text box
                    if(countDisplay) countDisplay.textContent = "0/280";
                    loadPosts(); // refresh feed
                } else {
                    alert("Failed to create post.");
                }
            } catch (error) {
                alert("Cannot connect to server.");
            }
        });
    }

    // 6. FUNCTION TO GET AND DISPLAY ALL POSTS
    async function loadPosts() {
        if (!mainFeed) return;
        try {
            let response = await fetch(API_URL + "/posts");
            let posts = await response.json();
            
            // Clear current posts on screen
            if (postsContainer) {
                postsContainer.innerHTML = "";
            }
            
            if (posts.length === 0) {
                if (postsContainer) {
                    postsContainer.innerHTML = `
                        <div class="empty-state" style="text-align: center; padding: 50px 20px; color: #666;">
                            <i class="bi bi-mailbox" style="font-size: 3rem; color: #ccc;"></i>
                            <p style="margin-top: 15px;">No wishes yet. Be the first to make one!</p>
                        </div>
                    `;
                }
                return;
            }

            // Loop through each post and create HTML for it
            posts.forEach(post => {
                displayPost(post);
            });
        } catch (error) {
            console.log("Error loading posts:", error);
        }
    }

    // 7. FUNCTION TO BUILD HTML FOR ONE POST
    function displayPost(post) {
        let currentUser = JSON.parse(localStorage.getItem("user"));
        
        // Find if this post belongs to the logged-in user
        let isMyPost = false;
        if (currentUser && post.author && post.author._id === currentUser._id) {
            isMyPost = true;
        }

        // Check if current user liked it
        let hasLiked = false;
        if (currentUser && post.likes && post.likes.includes(currentUser._id)) {
            hasLiked = true;
        }

        let likeButtonClass = hasLiked ? "react-btn like-btn active" : "react-btn like-btn";
        
        let displayContent = post.content || "";
        let badgeColor = "purple";
        let badgeEmoji = "✨ Dreaming";

        if (displayContent.includes("|||")) {
            let parts = displayContent.split("|||");
            displayContent = parts[0];
            if (parts.length >= 3) {
                badgeColor = parts[1];
                badgeEmoji = parts[2];
            }
        }

        let displayName = post.author ? post.author.name : "Anonymous";
        let avatarSrc = post.author && post.author.avatar ? post.author.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(displayName);
        
        if (post.isAnonymous) {
            displayName = "Anonymous";
            avatarSrc = "https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous";
        }
        let dateString = post.createdAt ? new Date(post.createdAt).toLocaleString() : "Just now";
        let likesCount = post.likes ? post.likes.length : 0;

        // Create the actual HTML element
        let postDiv = document.createElement("div");
        postDiv.className = "post box";
        postDiv.id = "post-" + post._id; // Give it a unique ID

        postDiv.innerHTML = `
            <div class="post-header" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 15px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${avatarSrc}" class="avatar-sm" style="width: 32px; height: 32px;">
                    <span class="author" style="font-weight: 600; font-size: 14px;">${displayName}</span>
                </div>
                <span class="mood-badge badge-${badgeColor}">${badgeEmoji}</span>
            </div>
            
            <div class="post-body" style="padding: 0 15px 12px; font-size: 15px; line-height: 1.5;">
                ${displayContent}
            </div>
            
            <div class="post-footer" style="padding: 0 15px 15px;">
                <div class="footer-actions" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 22px;">
                    <div style="display: flex; gap: 15px;">
                        <i class="bi ${hasLiked ? 'bi-heart-fill' : 'bi-heart'}" 
                           style="cursor: pointer; color: ${hasLiked ? '#ed4956' : 'inherit'};" 
                           onclick="toggleLike('${post._id}', this)"></i>
                        <i class="bi bi-chat" style="cursor: pointer;" onclick="toggleComments('${post._id}')"></i>
                        <i class="bi bi-send" style="cursor: pointer;"></i>
                    </div>
                    <i class="bi bi-bookmark" style="cursor: pointer;" onclick="toggleBookmark('${post._id}', this)"></i>
                </div>
                <div class="likes-info" style="font-weight: 600; font-size: 14px; margin-bottom: 5px;">
                    <span class="likes-count">${likesCount}</span> likes
                </div>
                <div class="caption" style="font-size: 14px; margin-bottom: 5px;">
                    <strong>${displayName}</strong> ${displayContent}
                </div>
                <div class="time" style="font-size: 10px; color: #8e8e8e; text-transform: uppercase;">
                    ${dateString}
                </div>
            </div>

            <div class="comments-section" id="comments-${post._id}" style="display: none; padding: 10px 15px; border-top: 1px solid #efefef;">
                <div class="comments-list" id="comments-list-${post._id}" style="margin-bottom: 10px;"></div>
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="comment-input-${post._id}" placeholder="Add a comment..." 
                           style="flex: 1; border: none; outline: none; font-size: 14px;">
                    <button onclick="addComment('${post._id}')" 
                            style="background: none; border: none; color: #0095f6; font-weight: 600; cursor: pointer; font-size: 14px;">Post</button>
                </div>
            </div>
        `;
        
        if (postsContainer) {
            postsContainer.appendChild(postDiv);
        }
    }
    
    // Make functions global so inline onclick can see them
    window.deletePost = async function(postId) {
        if (!confirm("Delete this post?")) return;
        
        try {
            let response = await fetch(API_URL + "/posts/" + postId, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });
            if (response.ok) {
                document.getElementById("post-" + postId).remove();
            } else {
                alert("Failed to delete.");
            }
        } catch (error) {
            alert("Error deleting.");
        }
    };

    window.toggleLike = async function(postId, iconElement) {
        let postDiv = document.getElementById("post-" + postId);
        let likesSpan = postDiv.querySelector(".likes-count");
        let currentLikes = parseInt(likesSpan.innerText);
        let isLiked = iconElement.classList.contains("bi-heart-fill");

        // Optimistic UI update (change visually immediately)
        if (isLiked) {
            iconElement.classList.remove("bi-heart-fill");
            iconElement.classList.add("bi-heart");
            iconElement.style.color = "inherit";
            likesSpan.innerText = currentLikes - 1;
        } else {
            iconElement.classList.add("bi-heart-fill");
            iconElement.classList.remove("bi-heart");
            iconElement.style.color = "#ed4956";
            likesSpan.innerText = currentLikes + 1;
        }

        // Tell backend
        let endpoint = isLiked ? "/posts/unlike/" : "/posts/like/";
        try {
            await fetch(API_URL + endpoint + postId, {
                method: "PUT",
                headers: { "Authorization": "Bearer " + token }
            });
        } catch (err) {
            console.log("Error toggling like");
        }
    };

    window.toggleBookmark = async function(postId, iconElement) {
        try {
            let response = await fetch(API_URL + "/users/bookmark/" + postId, {
                method: "POST",
                headers: { "Authorization": "Bearer " + token }
            });
            if (response.ok) {
                if (iconElement.classList.contains("bi-bookmark-fill")) {
                    iconElement.classList.remove("bi-bookmark-fill");
                    iconElement.classList.add("bi-bookmark");
                    iconElement.style.color = "inherit";
                } else {
                    iconElement.classList.add("bi-bookmark-fill");
                    iconElement.classList.remove("bi-bookmark");
                    iconElement.style.color = "#0095f6";
                }
            }
        } catch (err) {
            console.log("Error bookmarking");
        }
    };
    
    window.toggleComments = async function(postId) {
        let commentSection = document.getElementById("comments-" + postId);
        let list = document.getElementById("comments-list-" + postId);
        
        if (commentSection.style.display === "none") {
            commentSection.style.display = "block";
            // Fetch comments
            try {
                let res = await fetch(API_URL + "/posts/comment/" + postId);
                let comments = await res.json();
                list.innerHTML = "";
                comments.forEach(c => {
                    let authorName = c.author ? c.author.name : "Anonymous";
                    list.innerHTML += `<div style="margin-bottom: 5px; font-size: 14px;"><strong>${authorName}:</strong> ${c.content}</div>`;
                });
                if(comments.length === 0) list.innerHTML = "<div style='font-size: 12px; color: gray;'>No comments yet.</div>";
            } catch (err) {
                console.log(err);
            }
        } else {
            commentSection.style.display = "none";
        }
    };

    window.addComment = async function(postId) {
        let input = document.getElementById("comment-input-" + postId);
        let text = input.value.trim();
        if (text === "") return;
        
        try {
            let res = await fetch(API_URL + "/posts/comment/" + postId, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token 
                },
                body: JSON.stringify({ content: text })
            });
            
            if(res.ok) {
                input.value = "";
                // Briefly hide and show to reload
                document.getElementById("comments-" + postId).style.display = "none";
                window.toggleComments(postId);
            }
        } catch(err) {
            console.log(err);
        }
    };

    // SEARCH LOGIC
    let searchInput = document.getElementById("home-search");
    if (searchInput) {
        searchInput.addEventListener("input", function() {
            let term = this.value.toLowerCase().trim();
            document.querySelectorAll(".post").forEach(post => {
                let txt = post.innerText.toLowerCase();
                post.style.display = txt.includes(term) ? "flex" : "none";
            });
        });
    }
});
