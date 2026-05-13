// script.js
const API_URL = "http://localhost:3000/posts";

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
    let textarea = document.getElementById("wish-textarea");
    let countDisplay = document.querySelector(".count");
    let anonToggle = document.getElementById("anon-toggle");
    let nameInput = document.getElementById("name-input");
    let postBtn = document.getElementById("send-wish-btn");
    let mainFeed = document.getElementById("main-content");
    let searchInput = document.getElementById("home-search");
    
    let moodButtons = document.querySelectorAll(".mood-tag");
    let currentMood = "Dreaming";
    let currentMoodColor = "purple";

    if (textarea) textarea.addEventListener("input", updateCount);
    if (anonToggle) anonToggle.addEventListener("change", handleAnon);
    if (postBtn) postBtn.addEventListener("click", submitWish);
    if (searchInput) searchInput.addEventListener("input", searchFeed);

    let mobileBtn = document.getElementById("mobile-post-btn");
    if (mobileBtn && textarea) {
        mobileBtn.addEventListener("click", function() {
            textarea.closest('.composer').style.display = 'flex'; 
            textarea.focus();
        });
    }

    moodButtons.forEach(function(btn) {
        btn.addEventListener("click", function() {
            moodButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            currentMood = this.getAttribute("data-mood");
            currentMoodColor = this.getAttribute("data-color");
        });
    });

    function updateCount() {
        countDisplay.textContent = textarea.value.length + "/280";
    }

    function handleAnon() {
        if (anonToggle.checked) {
            nameInput.value = "";
            nameInput.disabled = true;
            nameInput.placeholder = "Anon";
            nameInput.style.opacity = "0.6";
        } else {
            nameInput.disabled = false;
            nameInput.placeholder = "Name (optional)";
            nameInput.style.opacity = "1";
        }
    }

    // 1. GET ALL WISHES FROM BACKEND
    async function loadWishes() {
        try {
            let response = await fetch(API_URL);
            let wishes = await response.json();
            
            // Clear existing posts except composer
            let posts = mainFeed.querySelectorAll('.post');
            posts.forEach(post => post.remove());
            
            // Display all wishes from database
            wishes.forEach(wish => {
                displayWish(wish);
            });
        } catch (error) {
            console.error("Error loading wishes:", error);
        }
    }

    // 2. CREATE A WISH VIA BACKEND
    async function submitWish() {
        let text = textarea.value.trim();
        
        if (text === "") {
            alert("Write a wish first.");
            return;
        }

        let token = localStorage.getItem("token");
        if (!token) {
            alert("Please login first to post a wish.");
            window.location.href = "loginpage.html";
            return;
        }

        // Prepare data for backend (GitHub backend uses 'content')
        let newWishData = {
            content: text
        };

        try {
            let response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newWishData)
            });

            if (response.ok) {
                let data = await response.json();
                
                // Add to UI
                displayWish(data.post, true);

                // Reset form
                textarea.value = "";
                if (!anonToggle.checked) nameInput.value = "";
                updateCount();
                moodButtons[0].click();
            } else {
                let errData = await response.json();
                alert(errData.error || "Failed to create wish.");
            }
        } catch (error) {
            console.error("Error creating wish:", error);
            alert("Error connecting to server.");
        }
    }

    async function deleteWish(wishId, postElement) {
        if (!confirm("Are you sure you want to delete this wish?")) return;
        let token = localStorage.getItem("token");
        try {
            let response = await fetch(`${API_URL}/${wishId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                postElement.remove();
            } else {
                alert("Failed to delete wish.");
            }
        } catch (error) {
            console.error("Error deleting wish:", error);
        }
    }

    // HELPER FUNCTION TO DISPLAY A WISH IN THE UI
    function displayWish(wish, prepend = false) {
        // GitHub backend uses author object for name
        let displayName = "Anonymous";
        if (wish.author && wish.author.name) {
            displayName = wish.author.name;
        } else if (wish.authorId) {
            displayName = wish.authorId; // Fallback for localStore
        }
        
        let text = wish.content || "";
        let likesCount = wish.likes ? wish.likes.length : 0;
        
        // Use a default avatar
        let avatar = '<div class="avatar-sm anon-pic">?</div>';
        if (displayName !== "Anonymous") {
            avatar = '<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(displayName) + '" class="avatar-sm" alt="User">';
        }

        let newPost = document.createElement("div");
        newPost.className = "post box";
        if (displayName === "Anonymous") newPost.classList.add("anon-post");

        // We will assign a random mood if backend doesn't store it
        const emojis = ["✨ Dreaming", "🔥 Hustle", "💖 Love", "🌍 Travel", "🚀 Startup", "🎯 Goals"];
        const colors = ["purple", "orange", "pink", "blue", "yellow", "green"];
        
        // Randomly pick one or just default to Dreaming if none stored
        let randomIdx = Math.floor(Math.random() * emojis.length);
        let emojiMood = emojis[randomIdx];
        let color = colors[randomIdx];

        // Format Date
        let dateString = wish.createdAt ? new Date(wish.createdAt).toLocaleString() : "Just now";

        let currentUser = JSON.parse(localStorage.getItem("user")) || {};
        let isAuthor = (wish.author && wish.author._id === currentUser._id) || (wish.authorId === currentUser._id);

        let deleteHtml = isAuthor ? `<button class="action-btn delete-btn" style="color: #ef4444;"><i class="bi bi-trash"></i> Delete</button>` : '';

        newPost.innerHTML = `
            <div class="post-top">
                ${avatar}
                <div class="post-meta">
                    <span class="author">${displayName}</span>
                    <span class="time">${dateString}</span>
                </div>
                <span class="mood-badge badge-${color}">${emojiMood}</span>
            </div>
            <div class="post-body">${text}</div>
            <div class="post-bottom">
                <div class="reactions">
                    <button class="react-btn like-btn" data-id="${wish._id}">👍 <span>${likesCount}</span></button>
                    <button class="react-btn">❤️ <span>0</span></button>
                </div>
                <div class="actions">
                    ${deleteHtml}
                    <button class="action-btn"><i class="bi bi-bookmark"></i> Save</button>
                </div>
            </div>
        `;

        if (isAuthor) {
            let deleteBtn = newPost.querySelector(".delete-btn");
            if (deleteBtn) {
                deleteBtn.addEventListener("click", function() {
                    deleteWish(wish._id, newPost);
                });
            }
        }

        let composerBox = document.querySelector(".composer");
        
        // If prepending (new post), put it right after composer
        // If appending (loading all), put it at the end of feed
        if (prepend && composerBox && composerBox.nextSibling) {
            mainFeed.insertBefore(newPost, composerBox.nextSibling);
        } else {
            mainFeed.appendChild(newPost);
        }

        setupReactions(newPost);
        setupActions(newPost);
    }

    function setupReactions(postElement = document) {
        postElement.querySelectorAll(".react-btn").forEach(function(btn) {
            if (!btn.dataset.ready) {
                btn.dataset.ready = "true";
                btn.addEventListener("click", async function() {
                    let span = this.querySelector("span");
                    let val = parseInt(span.textContent);
                    
                    // If it's the like button, call the backend
                    if (this.classList.contains("like-btn")) {
                        let token = localStorage.getItem("token");
                        if (!token) {
                            alert("Please login first to like a wish.");
                            return;
                        }
                        
                        let wishId = this.getAttribute("data-id");
                        try {
                            let response = await fetch(`${API_URL}/like/${wishId}`, {
                                method: "PUT",
                                headers: {
                                    "Authorization": `Bearer ${token}`
                                }
                            });
                            
                            if (response.ok) {
                                this.classList.add("active");
                                span.textContent = val + 1;
                            } else {
                                let errData = await response.json();
                                if (errData.error === "Post already liked") {
                                    // Visual feedback only
                                    this.classList.add("active");
                                } else {
                                    alert(errData.error || "Failed to like post");
                                }
                            }
                        } catch (error) {
                            console.error("Error liking post:", error);
                        }
                    } else {
                        // Dummy behavior for heart icon
                        if (this.classList.contains("active")) {
                            this.classList.remove("active");
                            span.textContent = val - 1;
                        } else {
                            this.classList.add("active");
                            span.textContent = val + 1;
                        }
                    }
                });
            }
        });
    }

    function setupActions(postElement = document) {
        postElement.querySelectorAll(".bi-bookmark").forEach(icon => {
            let btn = icon.parentElement;
            if (!btn.dataset.ready) {
                btn.dataset.ready = "true";
                btn.addEventListener("click", function() {
                    if (icon.classList.contains("bi-bookmark")) {
                        icon.className = "bi bi-bookmark-fill text-pink";
                        icon.style.color = "#ec4899";
                    } else {
                        icon.className = "bi bi-bookmark";
                        icon.style.color = "";
                    }
                });
            }
        });
    }

    function searchFeed() {
        let term = searchInput.value.toLowerCase().trim();
        document.querySelectorAll(".post").forEach(post => {
            let txt = post.innerText.toLowerCase();
            post.style.display = txt.includes(term) ? "flex" : "none";
        });
    }

    // Init
    if (textarea) updateCount();
    if (anonToggle) handleAnon();
    
    // Load wishes from DB when page loads
    loadWishes();
});
