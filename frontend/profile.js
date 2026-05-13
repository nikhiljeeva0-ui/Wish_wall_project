// AUTH CHECK ON PAGE LOAD
if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", async function () {
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

    // TAB SWITCHING
    let tabs = document.querySelectorAll(".p-tab");
    let contents = document.querySelectorAll(".tab-content");

    tabs.forEach(function(tab) {
        tab.addEventListener("click", function() {

            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active-tab"));

            this.classList.add("active");

            let targetId = this.getAttribute("data-tab") + "-tab";

            let targetContent = document.getElementById(targetId);

            if(targetContent) {
                targetContent.classList.add("active-tab");
            }
        });
    });

    // FETCH USER POSTS
    try {

        const currentUser = JSON.parse(
            localStorage.getItem("user")
        );

        const res = await fetch("http://localhost:3000/posts");

        const posts = await res.json();

        const myPosts = posts.filter(
            (post) => post.author && post.author._id === currentUser._id
        );

        const container = document.getElementById("profilePosts");

        if (myPosts.length === 0) {
            if (container) {
                container.innerHTML = `
                    <div class="feed-footer">
                        No wishes posted yet.
                    </div>
                `;
            }
            return;
        }

        if (container) {
            myPosts.forEach((post) => {
                container.innerHTML += `
                    <div class="post box">

                        <div class="post-top">

                            <img 
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.name}" 
                                class="avatar-sm"
                            >

                            <div class="post-meta">
                                <span class="author">
                                    ${post.author.name}
                                </span>

                                <span class="time">
                                    ${new Date(post.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                        </div>

                        <div class="post-body">
                            ${post.content}
                        </div>

                        <div class="post-bottom">
                            ❤️ ${post.likes.length} Likes
                        </div>

                    </div>
                `;
            });
        }

    } catch (err) {
        console.log(err);
    }
});
