// edit-profile.js
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
        saveBtn.addEventListener("click", function() {
            alert("Profile successfully updated! (Dummy Action)");
            window.location.href = "profile.html";
        });
    }
});
