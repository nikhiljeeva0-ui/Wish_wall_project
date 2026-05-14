// edit-profile.js
const API_URL = "https://garuda-wishwall-backend.onrender.com";

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

    // Elements
    let nameInput = document.getElementById("edit-name");
    let usernameInput = document.getElementById("edit-username");
    let bioInput = document.getElementById("edit-bio");
    
    let previewName = document.getElementById("preview-name");
    let previewUsername = document.getElementById("preview-username");
    let previewBio = document.getElementById("preview-bio");
    let previewAvatar = document.getElementById("preview-avatar");
    
    let avatars = document.querySelectorAll(".avatar-option");
    let saveBtn = document.getElementById("save-profile-btn");

    // 3. LOAD USER DATA
    async function loadUserData() {
        try {
            let response = await fetch(API_URL + "/users/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (response.ok) {
                let data = await response.json();
                let user = data.user;
                
                if (user.name) {
                    nameInput.value = user.name;
                    if(previewName) previewName.textContent = user.name;
                }
                if (user.email) {
                    usernameInput.value = user.email;
                    if(previewUsername) previewUsername.textContent = "@" + user.email.split("@")[0];
                }
                if (user.bio) {
                    bioInput.value = user.bio;
                    if (previewBio) previewBio.textContent = user.bio;
                }
                if (user.avatar) {
                    if (previewAvatar) previewAvatar.src = user.avatar;
                } else if (user.name) {
                    if (previewAvatar) previewAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`;
                }
            }
        } catch(e) { 
            console.error(e); 
        }
    }
    loadUserData();

    // 4. LIVE TYPING UPDATES
    if (nameInput) {
        nameInput.addEventListener("input", function() {
            if(previewName) previewName.textContent = this.value || "Your Name";
            if(previewAvatar && this.value) previewAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(this.value)}`;
        });
    }

    if (usernameInput) {
        usernameInput.addEventListener("input", function() {
            if(previewUsername) previewUsername.textContent = this.value || "@username";
        });
    }

    if (bioInput) {
        bioInput.addEventListener("input", function() {
            if(previewBio) previewBio.textContent = this.value || "Write a little bit about yourself...";
        });
    }

    // Avatar selection logic (Visual only for now since backend uses Dicebear seed)
    avatars.forEach(function(avatar) {
        avatar.addEventListener("click", function() {
            avatars.forEach(a => a.classList.remove("active"));
            this.classList.add("active");
            if(previewAvatar) previewAvatar.src = this.src;
        });
    });

    // 5. SAVE BUTTON LOGIC (UPDATE PROFILE)
    if (saveBtn) {
        saveBtn.addEventListener("click", async function(e) {
            e.preventDefault(); // Prevent any form submission refresh
            
            let newName = nameInput.value.trim();
            let newEmail = usernameInput.value.trim();
            let newBio = bioInput.value.trim();
            let newAvatar = previewAvatar ? previewAvatar.src : "";

            console.log("Saving Profile Data:", { newName, newEmail, newBio, newAvatar });

            if (!newName || !newEmail) {
                alert("Name and Email are required!");
                return;
            }

            try {
                let response = await fetch(API_URL + "/users/me", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        name: newName, 
                        email: newEmail,
                        bio: newBio,
                        avatar: newAvatar
                    })
                });
                
                let data = await response.json();

                if (response.ok) {
                    console.log("Server Updated Successfully:", data.user);
                    
                    // Update localStorage with the real data from DB
                    localStorage.setItem("user", JSON.stringify(data.user)); 
                    
                    alert("Profile successfully updated!");
                    window.location.href = "profile.html";
                } else {
                    console.error("Update failed:", data.error);
                    alert(data.error || "Failed to update profile");
                }
            } catch(e) {
                console.error("Fetch Error:", e);
                alert("Error connecting to server. Is the backend running?");
            }
        });
    }
});
