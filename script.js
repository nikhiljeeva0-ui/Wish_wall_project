document.addEventListener("DOMContentLoaded", function () {
    let textarea = document.getElementById("wish-textarea");
    let charCount = document.querySelector(".char-count");
    let anonToggle = document.getElementById("anon-toggle");
    let nameInput = document.querySelector(".anon-row .input");
    let sendWishBtn = document.getElementById("send-wish-btn");
    let mainContent = document.getElementById("main-content");
    let feedEnd = document.querySelector(".feed-end");
    let newWishBtn = document.getElementById("btn-new-wish");
    let searchInput = document.getElementById("home-search");
    let tabButtons = document.querySelectorAll(".tab");

    var originalPosts = [];
    var postCards = document.querySelectorAll(".post-card");

    for (var i = 0; i < postCards.length; i++) {
        originalPosts.push(postCards[i]);
    }

    updateCharCount();
    updateAnonymousState();
    addReactionEvents();
    addPostActionEvents();
    addTabEvents();

    textarea.addEventListener("input", updateCharCount);
    anonToggle.addEventListener("change", updateAnonymousState);
    sendWishBtn.addEventListener("click", createNewWish);
    newWishBtn.addEventListener("click", focusOnTextarea);
    searchInput.addEventListener("input", filterPosts);

    function updateCharCount() {
        let textLength = textarea.value.length;
        charCount.textContent = textLength + " / 280";
    }

    function updateAnonymousState() {
        if (anonToggle.checked) {
            nameInput.value = "";
            nameInput.disabled = true;
            nameInput.placeholder = "Anonymous post selected";
        }
         else {
            nameInput.disabled = false;
            nameInput.placeholder = "Your name (or stay anon)";
        }
    }


    function createNewWish() {
        var wishText = textarea.value.trim();
        var personName = nameInput.value.trim();
        var displayName = "Anonymous";
        var avatarText = "?";
        var avatarClass = "";

        if (wishText === "") {
            alert("Please write your wish first.");
            textarea.focus();
            return;
        }

        if (!anonToggle.checked && personName !== "") {
            displayName = personName;
            avatarText = personName.charAt(0).toUpperCase();
            avatarClass = " purple";
        }

        var newPost = document.createElement("article");
        newPost.className = "post-card";

        if (anonToggle.checked) {
            newPost.className = "post-card post-card-anon";
        }

        newPost.innerHTML =
            '<div class="post-card-header">' +
            '    <div class="avatar-circle md' + avatarClass + '">' + avatarText + '</div>' +
            '    <div class="post-card-info">' +
            '        <div class="post-card-top-row">' +
            '            <span class="post-card-name">' + displayName + '</span>' +
            '            <span class="tag tag-teal">#newwish</span>' +
            '            <span class="post-card-time">Just now</span>' +
            '        </div>' +
            '    </div>' +
            '</div>' +
            '<p class="post-card-body"></p>' +
            '<div class="reactions">' +
            '    <button class="react-btn">👍 <span>0</span></button>' +
            '    <button class="react-btn">❤️ <span>0</span></button>' +
            '    <button class="react-btn">🔥 <span>0</span></button>' +
            '    <button class="react-btn">⭐ <span>0</span></button>' +
            '</div>' +
            '<div class="post-divider"></div>' +
            '<div class="post-actions">' +
            '    <button class="post-action-btn reply">💬 Reply</button>' +
            '    <button class="post-action-btn share">🔗 Share</button>' +
            '    <button class="post-action-btn save">🔖 Save</button>' +
            '</div>';

        newPost.querySelector(".post-card-body").textContent = wishText;
        mainContent.insertBefore(newPost, feedEnd);

        originalPosts.unshift(newPost);

        textarea.value = "";
        nameInput.value = "";
        anonToggle.checked = false;

        updateCharCount();
        updateAnonymousState();
        addReactionEvents();
        addPostActionEvents();
        filterPosts();
    }

    function addReactionEvents() {
        var reactionButtons = document.querySelectorAll(".react-btn");

        for (var i = 0; i < reactionButtons.length; i++) {
            if (!reactionButtons[i].hasAttribute("data-ready")) {
                reactionButtons[i].setAttribute("data-ready", "true");
                reactionButtons[i].addEventListener("click", function () {
                    var post = this.closest(".post-card");
                    var buttons = post.querySelectorAll(".react-btn");

                    for (var j = 0; j < buttons.length; j++) {
                        if (buttons[j] !== this && buttons[j].classList.contains("active")) {
                            changeReactionCount(buttons[j], -1);
                            buttons[j].classList.remove("active");
                        }
                    }

                  if (this.classList.contains("active")) {
                        changeReactionCount(this, -1);
                        this.classList.remove("active");
                    } else {
                        changeReactionCount(this, 1);
                        this.classList.add("active");
                    }
                });
            }
        }
    }

    function changeReactionCount(button, changeValue) {
        var countSpan = button.querySelector("span");
        var currentCount = parseInt(countSpan.textContent);
        countSpan.textContent = currentCount + changeValue;
    }

    function addPostActionEvents() {
        var replyButtons = document.querySelectorAll(".post-action-btn.reply");
        var shareButtons = document.querySelectorAll(".post-action-btn.share");
        var saveButtons = document.querySelectorAll(".post-action-btn.save");

        for (var i = 0; i < replyButtons.length; i++) {
            if (!replyButtons[i].hasAttribute("data-ready")) {
                replyButtons[i].setAttribute("data-ready", "true");
                replyButtons[i].addEventListener("click", function () {
                    alert("Reply feature can be added next.");
                });
            }
        }

        for (var j = 0; j < shareButtons.length; j++) {
            if (!shareButtons[j].hasAttribute("data-ready")) {
                shareButtons[j].setAttribute("data-ready", "true");
                shareButtons[j].addEventListener("click", function () {
                    alert("Wish link shared successfully.");
                });
            }
        }

        for (var k = 0; k < saveButtons.length; k++) {
            if (!saveButtons[k].hasAttribute("data-ready")) {
                saveButtons[k].setAttribute("data-ready", "true");
                saveButtons[k].addEventListener("click", function () {
                    if (this.classList.contains("active")) {
                        this.classList.remove("active");
                        this.textContent = "🔖 Save";
                    } else {
                        this.classList.add("active");
                        this.textContent = "✅ Saved";
                    }
                });
            }
        }
    }

    function addTabEvents() {
        for (var i = 0; i < tabButtons.length; i++) {
            tabButtons[i].addEventListener("click", function () {
                for (var j = 0; j < tabButtons.length; j++) {
                    tabButtons[j].classList.remove("active");
                    tabButtons[j].setAttribute("aria-selected", "false");
                }

                this.classList.add("active");
                this.setAttribute("aria-selected", "true");
                sortPosts(this.textContent.trim());
            });
        }
    }

    function sortPosts(tabName) {
        var posts = document.querySelectorAll(".post-card");
        var postsArray = [];

        for (var i = 0; i < posts.length; i++) {
            postsArray.push(posts[i]);
        }

        if (tabName === "For You") {
            postsArray = originalPosts.slice();
        } else if (tabName === "Latest") {
            postsArray.sort(function (a, b) {
                return getTimeValue(a) - getTimeValue(b);
            });
        } else if (tabName === "Popular") {
            postsArray.sort(function (a, b) {
                return getTotalReactions(b) - getTotalReactions(a);
            });
        }

        for (var j = 0; j < postsArray.length; j++) {
            mainContent.insertBefore(postsArray[j], feedEnd);
        }

        filterPosts();
    }

    function getTimeValue(post) {
        var timeText = post.querySelector(".post-card-time").textContent.toLowerCase();

        if (timeText.indexOf("just now") !== -1) {
            return 0;
        }

        if (timeText.indexOf("min") !== -1) {
            return parseInt(timeText);
        }

        if (timeText.indexOf("hr") !== -1) {
            return parseInt(timeText) * 60;
        }

        return 9999;
    }

    function getTotalReactions(post) {
        var total = 0;
        var spans = post.querySelectorAll(".react-btn span");

        for (var i = 0; i < spans.length; i++) {
            total = total + parseInt(spans[i].textContent);
        }

        return total;
    }

    function filterPosts() {
        var searchText = searchInput.value.toLowerCase().trim();
        var posts = document.querySelectorAll(".post-card");

        for (var i = 0; i < posts.length; i++) {
            var postText = posts[i].innerText.toLowerCase();

            if (postText.indexOf(searchText) !== -1) {
                posts[i].style.display = "block";
            } else {
                posts[i].style.display = "none";
            }
        }
    }
    function filterPosts(){
        let searchText = searchInput.value.toLowerCase().trim();
        let post = document.querySelectorAll("#post-card");

        for(var i = 0 ;  i < posts.lenght ; i++  ){
            let postText = posts[i].innerText.toLoweCase();
            if (postText.indexOf(searchText) !== -1) {
                posts[i].style.display = "run";
            }
            else {
                posts[i].style.display = "none";
            }
          
        }
         
    }
});
