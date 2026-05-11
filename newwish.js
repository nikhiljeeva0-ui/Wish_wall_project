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
        postBtn.addEventListener("click", function() {
            if (textarea.value.trim() === "") {
                alert("Please write your wish first.");
            } else {
                alert("Wish published! (Dummy action)");
                window.location.href = "index.html";
            }
        });
    }

    if (draftBtn) {
        draftBtn.addEventListener("click", function() {
            alert("Draft saved! (Dummy action)");
        });
    }
});
