# 🎈 GARUDA WishWall - Full Stack Social Media

A modern, Instagram-style social media platform where users can share their wishes, follow others, and build a community of dreamers. Built with a focus on simplicity, performance, and a premium "Startup" aesthetic.

## 🚀 Live Demo
- **Frontend:** [https://wish-wall-project.vercel.app](https://wish-wall-project.vercel.app) (Replace with your actual link)
- **Backend:** [https://garuda-wishwall-backend.onrender.com](https://garuda-wishwall-backend.onrender.com)

## ✨ Features
- **Shared Home Feed:** See real-time wishes from all users across the platform.
- **Personal Profile:** A dedicated space for your own wishes, bio, and stats.
- **Social System:** Follow and unfollow users to build your network.
- **Interactive Posts:** Like, comment, and bookmark wishes you love.
- **Customizable Profiles:** Update your name, bio, and choose from unique avatars.
- **Real-time Moods:** Tag your wishes with moods like "Dreaming", "Hustle", or "Startup".

## 🛠️ Technology Stack
- **Frontend:** HTML5, Vanilla CSS3, JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT (JSON Web Tokens)
- **Icons:** Bootstrap Icons

## 📂 Project Structure
```text
Wish_wall_project/
├── backend/            # Express.js API & MongoDB Models
│   ├── controller/     # Logic for Users & Posts
│   ├── models/         # Database Schemas
│   ├── routes/         # API Endpoints
│   └── server.js       # Main Entry Point
└── frontend/           # Vanilla JS Web App
    ├── index.html      # Home Feed
    ├── profile.html    # User Profile
    ├── explore.html    # User Discovery
    └── script.js       # Core Frontend Logic
```

## ⚙️ Local Setup
1. **Clone the repo:** `git clone https://github.com/nikhiljeeva0-ui/Wish_wall_project.git`
2. **Backend:**
   - `cd backend`
   - `npm install`
   - Create `.env` with `MONGODB_URI` and `JWT_SECRET`.
   - `node server.js`
3. **Frontend:**
   - Open `frontend/index.html` using Live Server.

## 📄 License
MIT License - Created with ❤️ by Nikhil Jeeva.
