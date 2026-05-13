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
    postBtn.addEventListener("click", async function () {

        if (textarea.value.trim() === "") {
            alert("Please write your wish first.");
            return;
        }

        try {

            const token = localStorage.getItem("token");

            const res = await fetch("http://localhost:3000/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: textarea.value,
                }),
            });

            const data = await res.json();

            console.log(data);

            if (res.ok) {
                alert("Wish published successfully!");
                window.location.href = "profile.html";
            } else {
                alert(data.error || "Failed to create wish");
            }

        } catch (err) {
            console.log(err);
            alert("Server error");
        }
    });
}

    if (draftBtn) {
        draftBtn.addEventListener("click", function() {
            alert("Draft saved! (Dummy action)");
        });
    }
});
