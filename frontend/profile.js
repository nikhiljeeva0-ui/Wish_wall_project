// profile.js
document.addEventListener("DOMContentLoaded", function () {
    let tabs = document.querySelectorAll(".p-tab");
    let contents = document.querySelectorAll(".tab-content");

    tabs.forEach(function(tab) {
        tab.addEventListener("click", function() {
            // Remove active from all tabs
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active-tab"));

            // Add active to clicked
            this.classList.add("active");
            let targetId = this.getAttribute("data-tab") + "-tab";
            let targetContent = document.getElementById(targetId);
            if(targetContent) {
                targetContent.classList.add("active-tab");
            }
        });
    });
});
