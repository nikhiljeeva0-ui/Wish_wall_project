// script.js
const API_URL = "https://wish-wall-project-1.onrender.com";

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
    let nameInput = document.getElementById("name-input");
    let countDisplay = document.querySelector(".count");
    
    // MOOD SELECTOR LOGIC
    let moodButtons = document.querySelectorAll(".mood-tag");
    let selectedColor = "purple";
    let selectedEmoji = "✨ Dreaming";

    if (moodButtons.length > 0) {
        moodButtons.forEach(btn => {
            btn.addEventListener("click", function() {
                moodButtons.forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                selectedColor = this.getAttribute("data-color");
                selectedEmoji = this.innerText;
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
                        content: text + "|||" + selectedColor + "|||" + selectedEmoji 
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
            
            // Clear current posts on screen (except the composer box)
            let existingPosts = mainFeed.querySelectorAll(".post");
            existingPosts.forEach(post => post.remove());
            
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
        
        // Home feed should not have delete buttons per user request
        let deleteBtnHTML = "";

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
        let dateString = post.createdAt ? new Date(post.createdAt).toLocaleString() : "Just now";
        let likesCount = post.likes ? post.likes.length : 0;

        // Create the actual HTML element
        let postDiv = document.createElement("div");
        postDiv.className = "post box";
        postDiv.id = "post-" + post._id; // Give it a unique ID

        postDiv.innerHTML = `
            <div class="post-top">
                <img src="${post.author && post.author.avatar ? post.author.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(displayName)}" class="avatar-sm">
                <div class="post-meta">
                    <span class="author">${displayName}</span>
                    <span class="time">${dateString}</span>
                </div>
                <span class="mood-badge badge-${badgeColor}">${badgeEmoji}</span>
            </div>
            
            <div class="post-body">
                ${displayContent}
            </div>
            
            <div class="post-bottom">
                <div class="reactions">
                    <button class="${likeButtonClass}" onclick="toggleLike('${post._id}', this)">
                        👍 <span>${likesCount}</span>
                    </button>
                    <button class="action-btn" onclick="toggleComments('${post._id}')">💬 Comments</button>
                </div>
                <div class="actions">
                    ${deleteBtnHTML}
                    <button class="action-btn" onclick="toggleBookmark('${post._id}', this)">🔖 Save</button>
                </div>
            </div>
            
            <div class="comments-section" id="comments-${post._id}" style="display: none; margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px;">
                <div class="comments-list" id="comments-list-${post._id}"></div>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <input type="text" id="comment-input-${post._id}" placeholder="Write a comment..." style="flex: 1; padding: 5px; border-radius: 5px; border: 1px solid #ccc;">
                    <button onclick="addComment('${post._id}')" style="padding: 5px 10px; border-radius: 5px; background: #6366f1; color: white; border: none; cursor: pointer;">Post</button>
                </div>
            </div>
        `;
        
        mainFeed.appendChild(postDiv);
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

    window.toggleLike = async function(postId, buttonElement) {
        let span = buttonElement.querySelector("span");
        let currentLikes = parseInt(span.innerText);
        let isLiked = buttonElement.classList.contains("active");

        // Optimistic UI update (change visually immediately)
        if (isLiked) {
            buttonElement.classList.remove("active");
            span.innerText = currentLikes - 1;
        } else {
            buttonElement.classList.add("active");
            span.innerText = currentLikes + 1;
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

    window.toggleBookmark = async function(postId, buttonElement) {
        try {
            let response = await fetch(API_URL + "/users/bookmark/" + postId, {
                method: "PUT",
                headers: { "Authorization": "Bearer " + token }
            });
            if (response.ok) {
                if (buttonElement.innerText === "🔖 Save") {
                    buttonElement.innerText = "🔖 Saved!";
                    buttonElement.style.color = "orange";
                } else {
                    buttonElement.innerText = "🔖 Save";
                    buttonElement.style.color = "";
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
