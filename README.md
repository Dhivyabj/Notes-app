Markdown Notes App
A full‑stack Markdown‑based note‑taking application with authentication, live preview, search, and responsive design. Built using React, Node.js, SQLite, JWT authentication, and Tailwind CSS.

🔹 Features
User Authentication

Register new users with username & password.

Login with JWT token stored in Local Storage.

Logout clears token and returns to login screen.

Responsive Dashboard

Works on laptop, tablet, and mobile screens.

Layout adapts using Tailwind responsive classes.

Live Split‑Screen Preview

Left panel → raw Markdown editor.

Center panel → rendered Markdown preview.

Preview updates live as user types.

Notes Management

Create new notes with Title, Content, Tags.

Edit existing notes → updates in place.

Delete notes → removes permanently.

Search & Filter

Search bar filters notes by title, content, or tags.

Dark Mode

Toggle between light and dark themes.

Demo Flow
Login/Register → authenticate user.

Dashboard → Editor, Preview, Notes List visible.

Create Note → type Markdown → Save → appears in Notes List.

Preview → shows formatted Markdown live.

Search → type keyword (e.g., “Python”) → filters notes.

Edit/Delete → modify or remove notes.

Logout → return to login screen.

🔹 Tech Stack
Frontend: React, Tailwind CSS, Axios

Backend: Node.js, Express, SQLite

Auth: JWT (JSON Web Token)

Deployment: Vercel / Render / Railway

🔹 Setup Instructions
Clone repository:


git clone https://github.com/<your-username>/markdown-notes-app.git
Install dependencies:


cd markdown-notes-app
npm install
Run backend:


cd backend
node index.js


Run frontend:


cd frontend
npm run dev
Open app at http://localhost:5173.




Notes list ordered by latest first (ORDER BY id DESC).
