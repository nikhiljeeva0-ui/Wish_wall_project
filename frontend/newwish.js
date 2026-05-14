// newwish.js
const API_URL = window.API_URL || "http://localhost:3000";

// 1. AUTH CHECK
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
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

    let textarea = document.getElementById("nw-text");
    let countDisplay = document.getElementById("nw-count");
    let anonToggle = document.getElementById("nw-anon");
    let nameInput = document.getElementById("nw-name");
    let postBtn = document.getElementById("nw-post");
    let draftBtn = document.getElementById("nw-draft");
    let moodButtons = document.querySelectorAll(".mood-tag");

    // 3. TEXTAREA CHARACTER COUNT
    if (textarea) {
        textarea.addEventListener("input", function() {
            countDisplay.textContent = textarea.value.length + "/500";
        });
    }

    // 4. ANONYMOUS TOGGLE LOGIC
    if (anonToggle) {
        anonToggle.addEventListener("change", function() {
            if (anonToggle.checked) {
                nameInput.value = "";
                nameInput.disabled = true;
                nameInput.placeholder = "Anonymous";
                nameInput.style.opacity = "0.5";
            } else {
                nameInput.disabled = false;
                nameInput.placeholder = "Name (optional)";
                nameInput.style.opacity = "1";
            }
        });
    }

    // 5. MOOD BUTTONS LOGIC
    moodButtons.forEach(function(btn) {
        btn.addEventListener("click", function() {
            moodButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // 6. CREATE NEW WISH LOGIC
    if (postBtn) {
        postBtn.addEventListener("click", async function() {
            let text = textarea.value.trim();
            if (text === "") {
                alert("Please write your wish first.");
                return;
            } 
            
            let activeMood = document.querySelector(".mood-tag.active");
            let selColor = activeMood ? activeMood.getAttribute("data-color") : "purple";
            let selEmoji = activeMood ? activeMood.innerText : "✨ Dreaming";
            
            try {
                let response = await fetch(API_URL + "/posts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        content: text + "|||" + selColor + "|||" + selEmoji,
                        isAnonymous: anonToggle ? anonToggle.checked : false
                    })
                });

                if (response.ok) {
                    alert("Wish published!");
                    window.location.href = "index.html"; // Go back to feed
                } else {
                    let errData = await response.json();
                    alert(errData.error || "Failed to publish wish.");
                }
            } catch (err) {
                alert("Error connecting to server.");
            }
        });
    }

    // 7. DRAFT BUTTON (DUMMY)
    if (draftBtn) {
        draftBtn.addEventListener("click", function() {
            alert("Draft saved! (Dummy action)");
        });
    }
});
