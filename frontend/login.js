// HTML Elements for Login Card
var loginCard = document.querySelector("#login-card");
var loginEmailInput = document.querySelector("#login-email");
var loginPasswordInput = document.querySelector("#login-password");
var loginBtn = document.querySelector("#login-btn");
var loginError = document.querySelector("#login-error");
var loginEyeBtn = document.querySelector("#login-eye");
var guestBtn = document.querySelector("#guest-btn");
var forgotBtn = document.querySelector("#forgot-btn");
var showSignupBtn = document.querySelector("#show-signup-btn");

// HTML Elements for Signup Card
var signupCard = document.querySelector("#signup-card");
var signupNameInput = document.querySelector("#signup-name");
var signupEmailInput = document.querySelector("#signup-email");
var signupPasswordInput = document.querySelector("#signup-password");
var signupConfirmInput = document.querySelector("#signup-confirm");
var signupBtn = document.querySelector("#signup-btn");
var signupError = document.querySelector("#signup-error");
var signupEyeBtn = document.querySelector("#signup-eye");
var confirmEyeBtn = document.querySelector("#confirm-eye");
var showLoginBtn = document.querySelector("#show-login-btn");

var API_BASE = "https://wish-wall-d30y.onrender.com";

// Check if already logged in
if (localStorage.getItem("token")) {
    window.location.href = "index.html";
}

// Simple function to switch to Signup Form
function showSignupForm() {
    loginCard.style.display = "none";
    signupCard.style.display = "block";
    
    // Clear any existing error messages
    loginError.style.display = "none";
    signupError.style.display = "none";
}

// Simple function to switch to Login Form
function showLoginForm() {
    signupCard.style.display = "none";
    loginCard.style.display = "block";
    
    // Clear any existing error messages
    loginError.style.display = "none";
    signupError.style.display = "none";
}

// Simple function to show or hide the password text
function togglePassword(inputElement, buttonElement) {
    if (inputElement.type === "password") {
        inputElement.type = "text";
        buttonElement.textContent = "Hide";
    } else {
        inputElement.type = "password";
        buttonElement.textContent = "Show";
    }
}

// Simple function to handle Login button click
async function handleLogin() {
    var email = loginEmailInput.value.trim();
    var password = loginPasswordInput.value;

    if (email === "") {
        loginError.textContent = "Please enter email";
        loginError.style.display = "block";
        loginError.classList.remove("success-message");
        return;
    } 
    if (password === "") {
        loginError.textContent = "Please enter password";
        loginError.style.display = "block";
        loginError.classList.remove("success-message");
        return;
    }
    
    try {
        var response = await fetch(API_BASE + "/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password })
        });
        
        var data = await response.json();
        
        if (response.ok) {
            loginError.textContent = "Login successful! Redirecting...";
            loginError.style.display = "block";
            loginError.classList.add("success-message");
            
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            setTimeout(function() {
                window.location.href = "index.html";
            }, 1000);
        } else {
            loginError.textContent = data.error || "Login failed";
            loginError.style.display = "block";
            loginError.classList.remove("success-message");
        }
    } catch (err) {
        loginError.textContent = "Cannot connect to server";
        loginError.style.display = "block";
        loginError.classList.remove("success-message");
    }
}

// Simple function to handle Create Account button click
async function handleSignup() {
    var name = signupNameInput.value.trim();
    var email = signupEmailInput.value.trim();
    var password = signupPasswordInput.value;
    var confirmPassword = signupConfirmInput.value;

    if (name === "") {
        signupError.textContent = "Please enter your full name";
        signupError.style.display = "block";
        signupError.classList.remove("success-message");
        return;
    } 
    if (email === "") {
        signupError.textContent = "Please enter email";
        signupError.style.display = "block";
        signupError.classList.remove("success-message");
        return;
    } 
    if (password === "") {
        signupError.textContent = "Please enter a password";
        signupError.style.display = "block";
        signupError.classList.remove("success-message");
        return;
    } 
    if (confirmPassword === "") {
        signupError.textContent = "Please confirm your password";
        signupError.style.display = "block";
        signupError.classList.remove("success-message");
        return;
    } 
    if (password !== confirmPassword) {
        signupError.textContent = "Passwords do not match";
        signupError.style.display = "block";
        signupError.classList.remove("success-message");
        return;
    }
    
    try {
        var response = await fetch(API_BASE + "/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name, email: email, password: password })
        });
        
        var data = await response.json();
        
        if (response.ok) {
            signupError.textContent = "Account created! You can now login.";
            signupError.style.display = "block";
            signupError.classList.add("success-message");
            
            setTimeout(function() {
                showLoginForm();
                loginEmailInput.value = email;
            }, 1500);
        } else {
            signupError.textContent = data.error || "Signup failed";
            signupError.style.display = "block";
            signupError.classList.remove("success-message");
        }
    } catch (err) {
        signupError.textContent = "Cannot connect to server";
        signupError.style.display = "block";
        signupError.classList.remove("success-message");
    }
}

// Simple function for Forgot Password link
function showForgotPassword() {
    alert("Password reset feature coming soon");
}

// Simple function for Guest Login button
function handleGuest() {
    loginError.textContent = "Logging in as guest...";
    loginError.style.display = "block";
    loginError.classList.add("success-message");
    
    // Clear token to be safe
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    setTimeout(function() {
        window.location.href = "index.html";
    }, 1000);
}

// Add Event Listeners for switching forms
showSignupBtn.addEventListener("click", showSignupForm);
showLoginBtn.addEventListener("click", showLoginForm);

// Add Event Listeners for buttons
loginBtn.addEventListener("click", handleLogin);
signupBtn.addEventListener("click", handleSignup);
forgotBtn.addEventListener("click", showForgotPassword);
guestBtn.addEventListener("click", handleGuest);

// Add Event Listeners for eye buttons to toggle password
loginEyeBtn.addEventListener("click", function() {
    togglePassword(loginPasswordInput, loginEyeBtn);
});

signupEyeBtn.addEventListener("click", function() {
    togglePassword(signupPasswordInput, signupEyeBtn);
});

confirmEyeBtn.addEventListener("click", function() {
    togglePassword(signupConfirmInput, confirmEyeBtn);
});
