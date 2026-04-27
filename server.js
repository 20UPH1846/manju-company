require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(__dirname));
const USERS_FILE = path.join(__dirname, 'users.json');

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Manju Groups API is running' });
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, error: 'Name, email and password required.' });
    if (!isValidEmail(email))
      return res.status(400).json({ success: false, error: 'Invalid email address.' });
    if (password.length < 6)
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });

    const users = loadUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return res.status(409).json({ success: false, error: 'Email already registered.' });

    const passwordHash = await bcrypt.hash(password, 10);
    users.push({ id: Date.now(), name, email, passwordHash, createdAt: new Date().toISOString() });
    saveUsers(users);

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"Manju Groups" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Welcome to Manju Groups, ${name}!`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0f1c3f;padding:30px;border-radius:12px 12px 0 0;text-align:center">
            <h2 style="color:white;margin:0">Welcome to Manju Groups!</h2>
          </div>
          <div style="background:#f4f6fb;padding:30px;border-radius:0 0 12px 12px">
            <p>Hi <strong>${name}</strong>, உங்கள் account successfully create ஆகிவிட்டது!</p>
            <p><strong>Email:</strong> ${email}</p>
            <p>— The Manju Groups Team</p>
          </div></div>`
      });
      await transporter.sendMail({
        from: `"Manju Groups Website" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
        subject: `New User Registered: ${name}`,
        html: `<p><strong>New user registered!</strong></p><p>Name: ${name}</p><p>Email: ${email}</p><p>Time: ${new Date().toLocaleString('en-IN')}</p>`
      });
    }

    res.json({ success: true, message: 'Account created successfully! Welcome to Manju Groups.' });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password are required.' });

    const users = loadUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ success: false, error: 'Invalid email or password.' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ success: false, error: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'manju-secret',
      { expiresIn: '7d' }
    );
    res.json({ success: true, token, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ success: false, error: 'Name, email and message are required.' });
    if (!isValidEmail(email))
      return res.status(400).json({ success: false, error: 'Invalid email address.' });

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"Manju Groups Website" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
        replyTo: email,
        subject: `New Contact: ${subject || 'General Inquiry'} from ${name}`,
        html: `<div style="font-family:sans-serif"><h2 style="color:#0f1c3f">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
          <p><strong>Message:</strong></p>
          <p style="background:#f4f6fb;padding:16px;border-radius:8px">${message}</p></div>`
      });
      await transporter.sendMail({
        from: `"Manju Groups" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Thanks for reaching out, ${name}!`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0f1c3f;padding:30px;border-radius:12px 12px 0 0;text-align:center">
            <h2 style="color:white;margin:0">Thanks for reaching out!</h2>
          </div>
          <div style="background:#f4f6fb;padding:30px;border-radius:0 0 12px 12px">
            <p>Hi <strong>${name}</strong>, we received your message and will reply within 24 hours.</p>
            <p>— The Manju Groups Team</p>
          </div></div>`
      });
    }
    res.json({ success: true, message: "Message sent! We'll be in touch within 24 hours." });
  } catch (err) {
    console.error('Contact error:', err.message);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

app.get('/api/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'manju-secret');
    res.json({ success: true, user: { name: decoded.name, email: decoded.email } });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Manju Groups API running on http://localhost:${PORT}`);
});
// ── MOBILE NAV ──
function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}

function closeMobileNav() {
  document.getElementById('mobileNav').classList.remove('open');
}

// Close mobile nav when clicking outside
document.addEventListener('click', function(e) {
  const nav = document.getElementById('mobileNav');
  const hamburger = document.getElementById('hamburger');
  if (nav && hamburger && !nav.contains(e.target) && !hamburger.contains(e.target)) {
    nav.classList.remove('open');
  }
});
