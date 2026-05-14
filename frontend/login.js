// login.js
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

var API_URL = window.API_URL || "http://localhost:3000";

// 1. AUTH CHECK: If already logged in, go to index.html
if (localStorage.getItem("token")) {
    window.location.href = "index.html";
}

// Simple function to switch to Signup Form
function showSignupForm() {
    loginCard.style.display = "none";
    signupCard.style.display = "block";
    loginError.style.display = "none";
    signupError.style.display = "none";
}

// Simple function to switch to Login Form
function showLoginForm() {
    signupCard.style.display = "none";
    loginCard.style.display = "block";
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

// 2. REAL LOGIN
async function handleLogin() {
    var email = loginEmailInput.value.trim();
    var password = loginPasswordInput.value;

    if (!email || !password) {
        loginError.textContent = "Please enter email and password";
        loginError.style.display = "block";
        loginError.classList.remove("success-message");
        return;
    }
    
    try {
        var response = await fetch(API_URL + "/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password })
        });
        
        var data = await response.json();
        
        if (response.ok) {
            loginError.textContent = "Login successful! Redirecting...";
            loginError.style.display = "block";
            loginError.classList.add("success-message");
            
            // Save to localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            setTimeout(function() {
                window.location.href = "index.html";
            }, 1000);
        } else {
            loginError.textContent = data.error || "Invalid email or password";
            loginError.style.display = "block";
            loginError.classList.remove("success-message");
        }
    } catch (err) {
        loginError.textContent = "Cannot connect to server. Make sure backend is running.";
        loginError.style.display = "block";
        loginError.classList.remove("success-message");
    }
}

// 3. REAL SIGNUP
async function handleSignup() {
    var name = signupNameInput.value.trim();
    var email = signupEmailInput.value.trim();
    var password = signupPasswordInput.value;
    var confirmPassword = signupConfirmInput.value;

    if (!name || !email || !password) {
        signupError.textContent = "All fields are required";
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
        var response = await fetch(API_URL + "/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name, email: email, password: password })
        });
        
        var data = await response.json();
        
        if (response.ok) {
            signupError.textContent = "Account created! Please login.";
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
        signupError.textContent = "Cannot connect to server.";
        signupError.style.display = "block";
        signupError.classList.remove("success-message");
    }
}

// 4. GUEST LOGIN
function handleGuest() {
    alert("Guest mode disabled. Please create a real account.");
}

function showForgotPassword() {
    alert("Password reset feature coming soon");
}

// Add Event Listeners
if(showSignupBtn) showSignupBtn.addEventListener("click", showSignupForm);
if(showLoginBtn) showLoginBtn.addEventListener("click", showLoginForm);
if(loginBtn) loginBtn.addEventListener("click", handleLogin);
if(signupBtn) signupBtn.addEventListener("click", handleSignup);
if(forgotBtn) forgotBtn.addEventListener("click", showForgotPassword);
if(guestBtn) guestBtn.addEventListener("click", handleGuest);

if(loginEyeBtn) loginEyeBtn.addEventListener("click", function() { togglePassword(loginPasswordInput, loginEyeBtn); });
if(signupEyeBtn) signupEyeBtn.addEventListener("click", function() { togglePassword(signupPasswordInput, signupEyeBtn); });
if(confirmEyeBtn) confirmEyeBtn.addEventListener("click", function() { togglePassword(signupConfirmInput, confirmEyeBtn); });
