# JioHotstar Full-Stack Clone (2nd Year Website Copy Project)

A full-stack recreation of **JioHotstar** featuring the authentic JioHotstar fonts (`Inter`, `soul-icons`), brand gradients (`#1492ff` -> `#0860c4` -> `#eb0066`), and dark `#0f1014` starlight theme extracted from `www.hotstar.com`, backed by **Node.js + Express**, **Firebase Firestore**, and **`bcryptjs`** password hashing.

---

## Project Checklist Against Assignment Rubric

1. **Three Recreated Pages**:
   - **Landing / Home Page** (`public/index.html` at `/`) — Expandable left sidebar navigation, 4K Hero Banner with video modal, Live Cricket & Sports row, Top 10 in India Today, Hotstar Specials, Category Filters, and Live Search.
   - **Sign Up Page** (`public/signup.html` at `/signup.html`) — Real account creation with subscription tier selection.
   - **Log In Page** (`public/login.html` at `/login.html`) — Real authentication verifying against hashed passwords.
2. **Secure Password Storage**:
   - Passwords are hashed using **`bcryptjs`** (`10` salt rounds) before saving to the `users` collection (`passwordHash: "$2a$10$..."`). Plaintext passwords are never stored.
3. **Database Persistence**:
   - Built with **`firebase-admin` (Cloud Firestore)** in `firebaseConfig.js`.
   - Includes a zero-config persistent local Firestore engine (`data/firestore-db.json`) so the app runs out-of-the-box and seamlessly switches to live Google Cloud Firestore as soon as `serviceAccountKey.json` or `FIREBASE_SERVICE_ACCOUNT` is provided.
4. **Additional Working CRUD Features Beyond Authentication**:
   - **My Watchlist (`POST /api/watchlist/toggle`, `GET /api/watchlist`)**: Add/remove movies & live sports to/from your personal Firestore Watchlist.
   - **Community Reviews (`GET /api/reviews`, `POST /api/reviews`, `DELETE /api/reviews/:id`)**: Post and delete fan reviews & star ratings persisted in Firestore.
   - **My Space Profile Management (`PUT /api/auth/profile`)**: Update display name, mobile number, and JioHotstar plan in Firestore.

---

## Running Locally

```bash
npm install
npm start
```

Open **http://localhost:3000** in your browser.

---

## Connecting Your Live Firebase Cloud Firestore Project

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Navigate to **Build -> Firestore Database** and click **Create Database**.
3. Go to **Project Settings (⚙️) -> Service Accounts** and click **Generate new private key**.
4. Save the downloaded JSON file in the root of this project as **`serviceAccountKey.json`** (or paste its JSON contents into the `FIREBASE_SERVICE_ACCOUNT` environment variable when deploying to Render/Railway).
5. Restart the server (`npm start`). You will see:
   `✅ Connected to live Firebase Cloud Firestore`
