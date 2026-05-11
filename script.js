// ---------------- CURRENT USER ----------------
const currentUser = "Aisha K.";

// ---------------- POSTS ARRAY ----------------

let posts = [

    {
        name: "Rahul J.",
        owner: "Rahul J.",
        time: "2 min ago",
        text: "I wish I could travel to every country before I turn 30 🌍",
        likes: 42,
        replies: 18,
        saved: false,
        likedBy: ["User1", "User2", "User3"]
    },

    {
        name: "Anonymous",
        owner: "Anonymous",
        time: "15 min ago",
        text: "Learning frontend development step by step 🚀",
        likes: 25,
        replies: 7,
        saved: false,
        likedBy: ["User4", "User5"]
    },

    {
        name: "Sara A.",
        owner: "Sara A.",
        time: "1 hour ago",
        text: "Consistency is more important than motivation ✨",
        likes: 30,
        replies: 12,
        saved: false,
        likedBy: ["User6", "User7", "User8"]
    }

];




// ---------------- GET ELEMENTS ----------------

const postContainer = document.getElementById("postContainer");

const tabs = document.querySelectorAll(".tab");

const editBtn = document.querySelector(".edit-btn");

const wishBtn = document.querySelector(".wish-btn");

const profileName = document.querySelector(".profile-left h2");

const profileBio = document.querySelector(".bio");

const stats = document.querySelectorAll(".stat-box h2");




// ---------------- SHOW POSTS ----------------

function showPosts(array){

    postContainer.innerHTML = "";



    if(array.length === 0){

        postContainer.innerHTML = `
            <div class="post-card">
                <h3>No Posts Found</h3>
            </div>
        `;

        return;
    }



    array.forEach(function(post,index){

        const card = document.createElement("div");

        card.classList.add("post-card");

        const hasLiked = post.likedBy.includes(currentUser);
        const isOwner = post.owner === currentUser;
        const deleteButtonHTML = isOwner ? `<button onclick="deletePost(${index})">🗑 Delete</button>` : "";


        card.innerHTML = `

            <div class="post-top">

                <img src="https://i.pravatar.cc/100?img=${index + 10}">

                <div>

                    <h3>${post.name}</h3>

                    <p class="post-time">${post.time}</p>

                </div>

            </div>


            <p class="post-text">
                ${post.text}
            </p>


            <div class="post-actions">

                <button onclick="likePost(${index})" ${hasLiked ? "disabled" : ""} style="${hasLiked ? "opacity: 0.5; cursor: not-allowed;" : ""}">
                    👍 ${post.likes}
                </button>

                <button onclick="replyPost(${index})">
                    💬 ${post.replies}
                </button>

                <button onclick="savePost(${index})">
                    ${post.saved ? "⭐ Saved" : "⭐ Save"}
                </button>

                ${deleteButtonHTML}

            </div>

        `;

        postContainer.appendChild(card);

    });

}




// ---------------- LIKE POST ----------------

function likePost(index){

    if(posts[index].likedBy.includes(currentUser)){
        alert("You have already liked this post!");
        return;
    }

    posts[index].likes++;
    posts[index].likedBy.push(currentUser);

    showPosts(posts);
}




// ---------------- REPLY POST ----------------

function replyPost(index){

    posts[index].replies++;

    alert("Reply Added");

    showPosts(posts);
}




// ---------------- SAVE POST ----------------

function savePost(index){

    posts[index].saved = !posts[index].saved;

    showPosts(posts);
}




// ---------------- DELETE POST ----------------

function deletePost(index){

    if(posts[index].owner !== currentUser){
        alert("You can only delete your own posts!");
        return;
    }

    posts.splice(index,1);

    showPosts(posts);

    updateWishCount();
}




// ---------------- UPDATE WISH COUNT ----------------

function updateWishCount(){

    stats[0].innerText = posts.length;
}




// ---------------- TABS FUNCTION ----------------

tabs.forEach(function(tab){

    tab.addEventListener("click", function(){

        tabs.forEach(function(btn){

            btn.classList.remove("active-tab");

        });

        tab.classList.add("active-tab");



        if(tab.innerText === "Wishes"){

            showPosts(posts);

        }



        else if(tab.innerText === "Saved"){

            let savedPosts = posts.filter(function(post){

                return post.saved === true;

            });

            showPosts(savedPosts);
        }



        else if(tab.innerText === "Liked"){

            let likedPosts = posts.filter(function(post){

                return post.likes >= 30;

            });

            showPosts(likedPosts);
        }

    });

});




// ---------------- EDIT PROFILE ----------------

editBtn.addEventListener("click", function(){

    let newName = prompt("Enter new profile name");

    let newBio = prompt("Enter new bio");



    if(newName !== "" && newName !== null){

        profileName.innerText = newName;

    }



    if(newBio !== "" && newBio !== null){

        profileBio.innerText = newBio;

    }

});




// ---------------- NEW WISH BUTTON ----------------

wishBtn.addEventListener("click", function(){

    let text = prompt("Write your new wish");



    if(text === "" || text === null){

        return;
    }



    let newPost = {

        name: profileName.innerText,
        owner: currentUser,
        time: "Just now",
        text: text,
        likes: 0,
        replies: 0,
        saved: false,
        likedBy: []
    };



    posts.unshift(newPost);

    showPosts(posts);

    updateWishCount();

});




// ---------------- MENU ACTIVE EFFECT ----------------

const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach(function(item){

    item.addEventListener("click", function(){

        menuItems.forEach(function(menu){

            menu.classList.remove("active");
        });

        item.classList.add("active");

    });

});




// ---------------- INITIAL CALLS ----------------

showPosts(posts);

updateWishCount();