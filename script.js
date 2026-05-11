// script.js
document.addEventListener("DOMContentLoaded", function () {
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

    function submitWish() {
        let text = textarea.value.trim();
        let name = nameInput.value.trim();
        let displayName = "Anonymous";
        let avatar = '<div class="avatar-sm anon-pic">?</div>';

        if (text === "") {
            alert("Write a wish first.");
            return;
        }

        if (!anonToggle.checked && name !== "") {
            displayName = name;
            avatar = '<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(name) + '" class="avatar-sm" alt="User">';
        }

        let newPost = document.createElement("div");
        newPost.className = "post box";
        if (anonToggle.checked) newPost.classList.add("anon-post");

        const emojis = {
            "Dreaming": "✨", "Hustle": "🔥", "Love": "💖", 
            "Travel": "🌍", "Startup": "🚀", "Goals": "🎯"
        };
        let emoji = emojis[currentMood] || "✨";

        newPost.innerHTML = `
            <div class="post-top">
                ${avatar}
                <div class="post-meta">
                    <span class="author">${displayName}</span>
                    <span class="time">Just now</span>
                </div>
                <span class="mood-badge badge-${currentMoodColor}">${emoji} ${currentMood}</span>
            </div>
            <div class="post-body">${text}</div>
            <div class="post-bottom">
                <div class="reactions">
                    <button class="react-btn">👍 <span>0</span></button>
                    <button class="react-btn">❤️ <span>0</span></button>
                    <button class="react-btn">🔥 <span>0</span></button>
                </div>
                <div class="actions">
                    <button class="action-btn"><i class="bi bi-chat"></i> Reply</button>
                    <button class="action-btn"><i class="bi bi-share"></i> Share</button>
                    <button class="action-btn"><i class="bi bi-bookmark"></i> Save</button>
                </div>
            </div>
        `;

        let composerBox = document.querySelector(".composer");
        mainFeed.insertBefore(newPost, composerBox.nextSibling);

        textarea.value = "";
        nameInput.value = "";
        anonToggle.checked = false;
        updateCount();
        handleAnon();
        moodButtons[0].click();
        
        setupReactions();
        setupActions();
    }

    function setupReactions() {
        document.querySelectorAll(".react-btn").forEach(function(btn) {
            if (!btn.dataset.ready) {
                btn.dataset.ready = "true";
                btn.addEventListener("click", function() {
                    let container = this.parentElement;
                    container.querySelectorAll(".react-btn").forEach(b => {
                        if (b !== btn && b.classList.contains("active")) {
                            b.classList.remove("active");
                            b.querySelector("span").textContent = parseInt(b.querySelector("span").textContent) - 1;
                        }
                    });

                    let span = this.querySelector("span");
                    let val = parseInt(span.textContent);
                    if (this.classList.contains("active")) {
                        this.classList.remove("active");
                        span.textContent = val - 1;
                    } else {
                        this.classList.add("active");
                        span.textContent = val + 1;
                    }
                });
            }
        });
    }

    function setupActions() {
        document.querySelectorAll(".bi-bookmark").forEach(icon => {
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
    setupReactions();
    setupActions();
});
