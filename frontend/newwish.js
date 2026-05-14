// newwish.js
const API_URL = window.API_URL || "http://localhost:3000";

document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    
    let textarea = document.getElementById("nw-text");
    let countDisplay = document.getElementById("nw-count");
    let anonToggle = document.getElementById("nw-anon");
    let postBtn = document.getElementById("nw-post");
    let moodButtons = document.querySelectorAll(".mood-tag");

    // 1. TEXTAREA CHARACTER COUNT
    if (textarea) {
        textarea.addEventListener("input", function() {
            countDisplay.textContent = textarea.value.length + "/500";
        });
    }

    // 2. MOOD BUTTONS LOGIC
    moodButtons.forEach(function(btn) {
        btn.addEventListener("click", function() {
            moodButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // 3. CREATE NEW WISH LOGIC
    if (postBtn) {
        postBtn.addEventListener("click", async function() {
            let text = textarea.value.trim();
            if (text === "") {
                alert("Please write your wish first.");
                return;
            } 
            
            let activeMood = document.querySelector(".mood-tag.active");
            let selColor = activeMood ? activeMood.getAttribute("data-color") : "purple";
            let selEmoji = activeMood ? activeMood.innerText.trim() : "✨ Dreaming";
            
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
                    window.location.href = "index.html"; 
                } else {
                    let errData = await response.json();
                    alert(errData.error || "Failed to publish wish.");
                }
            } catch (err) {
                alert("Error connecting to server.");
            }
        });
    }
});
