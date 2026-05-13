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
});

// newwish.js
document.addEventListener("DOMContentLoaded", function () {
    let textarea = document.getElementById("nw-text");
    let countDisplay = document.getElementById("nw-count");
    let anonToggle = document.getElementById("nw-anon");
    let nameInput = document.getElementById("nw-name");
    let postBtn = document.getElementById("nw-post");
    let draftBtn = document.getElementById("nw-draft");
    let moodButtons = document.querySelectorAll(".mood-tag");

    if (textarea) {
        textarea.addEventListener("input", function() {
            countDisplay.textContent = textarea.value.length + "/500";
        });
    }

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

    moodButtons.forEach(function(btn) {
        btn.addEventListener("click", function() {
            moodButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
        });
    });

    if (postBtn) {
        postBtn.addEventListener("click", async function() {
            let text = textarea.value.trim();
            if (text === "") {
                alert("Please write your wish first.");
                return;
            } 
            
            let token = localStorage.getItem("token");
            if (!token) {
                alert("Please login first.");
                window.location.href = "login.html";
                return;
            }
            
            try {
                let response = await fetch("http://localhost:3000/posts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ content: text })
                });

                if (response.ok) {
                    alert("Wish published!");
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

    if (draftBtn) {
        draftBtn.addEventListener("click", function() {
            alert("Draft saved! (Dummy action)");
        });
    }
});
