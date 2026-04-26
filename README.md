# Manju Groups — Backend API

Full backend for the Manju Groups website. Handles contact form submissions (with email) and login with JWT auth.

---

## 📁 Project Structure

```
manju-backend/
├── server.js          ← Main Express API server
├── package.json
├── .env.example       ← Copy to .env and fill in your values
└── public/            ← Your frontend files (served by Express)
    ├── index.html
    ├── style.css
    └── script.js      ← Updated to call real API
```

---

## 🚀 Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env
# → Edit .env with your SMTP credentials and JWT secret

# 3. Start the server
npm start
# or for auto-reload during development:
npm run dev

# 4. Open http://localhost:3000
```

---

## 🌐 Deploy to Production (Render — Free)

1. Push this folder to a GitHub repo
2. Go to https://render.com → New → Web Service
3. Connect your repo
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add **Environment Variables** (from your .env):
   - `JWT_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
   - `CONTACT_EMAIL`
   - `FRONTEND_URL` (your domain)
7. Deploy!

After deploy, update `API_BASE` in `public/script.js`:
```js
const API_BASE = 'https://your-app.onrender.com/api';
```

---

## 📧 Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Create an App Password for "Mail"
4. Use that 16-character password as `SMTP_PASS` in your .env

---

## 🔑 API Endpoints

| Method | Endpoint       | Description                  |
|--------|---------------|------------------------------|
| GET    | /api/health   | Server health check          |
| POST   | /api/contact  | Submit contact form          |
| POST   | /api/login    | Login → returns JWT token    |
| GET    | /api/me       | Get current user (needs JWT) |

### POST /api/contact
```json
{ "name": "John", "email": "john@example.com", "subject": "Hi", "message": "Hello!" }
```

### POST /api/login
```json
{ "email": "admin@manjugroups.com", "password": "admin123" }
```
> Change the demo credentials in `server.js` or connect a real database.

---

## 🔒 Security Notes

- Change `JWT_SECRET` to a long random string before going live
- For production, use a real database (MongoDB, PostgreSQL) instead of the in-memory users array
- Set `FRONTEND_URL` to your exact domain (not `*`) in production
- Enable HTTPS (Render provides this automatically)
