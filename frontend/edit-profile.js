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

// edit-profile.js
document.addEventListener("DOMContentLoaded", function () {
    
    // Elements
    let nameInput = document.getElementById("edit-name");
    let usernameInput = document.getElementById("edit-username");
    let bioInput = document.getElementById("edit-bio");
    let API_URL = "http://localhost:3000/users/me";
    let token = localStorage.getItem("token");

    // Load user data
    async function loadUserData() {
        try {
            let response = await fetch(API_URL, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                let data = await response.json();
                let user = data.user;
                if (user.name) {
                    nameInput.value = user.name;
                    previewName.textContent = user.name;
                }
            }
        } catch(e) { console.error(e); }
    }
    loadUserData();
    
    let previewName = document.getElementById("preview-name");
    let previewUsername = document.getElementById("preview-username");
    let previewBio = document.getElementById("preview-bio");
    let previewAvatar = document.getElementById("preview-avatar");
    
    let avatars = document.querySelectorAll(".avatar-option");
    let saveBtn = document.getElementById("save-profile-btn");

    // Live typing updates
    if (nameInput) {
        nameInput.addEventListener("input", function() {
            previewName.textContent = this.value || "Your Name";
        });
    }

    if (usernameInput) {
        usernameInput.addEventListener("input", function() {
            previewUsername.textContent = this.value || "@username";
        });
    }

    if (bioInput) {
        bioInput.addEventListener("input", function() {
            previewBio.textContent = this.value || "Write a little bit about yourself...";
        });
    }

    // Avatar selection logic
    avatars.forEach(function(avatar) {
        avatar.addEventListener("click", function() {

            avatars.forEach(a => a.classList.remove("active"));

            this.classList.add("active");
       
            previewAvatar.src = this.src;
        });
    });

    // Save button logic
    if (saveBtn) {
        saveBtn.addEventListener("click", async function() {
            try {
                let response = await fetch(API_URL, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ name: nameInput.value })
                });
                if (response.ok) {
                    let data = await response.json();
                    localStorage.setItem("user", JSON.stringify(data.user));
                    alert("Profile successfully updated!");
                    window.location.href = "profile.html";
                } else {
                    alert("Failed to update profile");
                }
            } catch(e) {
                alert("Error connecting to server");
            }
        });
    }
});
