// edit-profile.js
const API_URL = window.API_URL || "http://localhost:3000";

document.addEventListener("DOMContentLoaded", function () {

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
            e.preventDefault();
            
            let newName = nameInput.value.trim();
            let newBio = bioInput.value.trim();
            let newAvatar = previewAvatar ? previewAvatar.src : "";

            if (!newName) {
                alert("Name is required!");
                return;
            }

            try {
                // Send update to backend
                let response = await fetch(API_URL + "/users/me", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        name: newName, 
                        bio: newBio,
                        avatar: newAvatar
                    })
                });
                
                let data = await response.json();

                if (response.ok) {
                    // 1. Update localStorage with the NEW user data from server
                    localStorage.setItem("user", JSON.stringify(data.user)); 
                    
                    alert("Profile updated successfully!");
                    
                    // 2. Go back to profile page to see changes
                    window.location.href = "profile.html"; 
                } else {
                    alert(data.error || "Failed to update profile");
                }
            } catch(e) {
                console.error("Update Error:", e);
                alert("Cannot connect to server.");
            }
        });
    }
});
