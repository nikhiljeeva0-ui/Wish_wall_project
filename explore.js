// explore.js
document.addEventListener("DOMContentLoaded", function () {
    let filterBtns = document.querySelectorAll(".explore-moods .mood-tag");
    let posts = document.querySelectorAll("#explore-feed .post");
    let searchInput = document.getElementById("explore-search");

    filterBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            filterBtns.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            
            let filter = this.getAttribute("data-filter");
            
            posts.forEach(post => {
                if (filter === "All" || post.getAttribute("data-mood") === filter) {
                    post.style.display = "flex";
                }
                 else {
                    post.style.display = "none";
                }
            });
        });
    });

   
    if (searchInput) {
        searchInput.addEventListener("input", function() {
            let term = this.value.toLowerCase().trim();
            posts.forEach(post => {
                let txt = post.innerText.toLowerCase();
                post.style.display = txt.includes(term) ? "flex" : "none";
            });
        });
    }
});
