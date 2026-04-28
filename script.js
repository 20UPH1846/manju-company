const API_BASE = 'https://manju-company.onrender.com/api';

// ── SMOOTH SCROLL ──
function goToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (target) target.scrollIntoView({ behavior: 'smooth' });
}

// ── NAVBAR SHADOW ──
window.addEventListener('scroll', function () {
  const nav = document.querySelector('.navbar');
  nav.style.boxShadow = window.scrollY > 20 ? '0 4px 30px rgba(0,0,0,0.3)' : 'none';
});

// ── MOBILE NAV ──
function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}

function closeMobileNav() {
  document.getElementById('mobileNav').classList.remove('open');
}

document.addEventListener('click', function (e) {
  const nav = document.getElementById('mobileNav');
  const hamburger = document.getElementById('hamburger');
  if (nav && hamburger && !nav.contains(e.target) && !hamburger.contains(e.target)) {
    nav.classList.remove('open');
  }
});

// ── MODAL FUNCTIONS ──
function openLoginModal() {
  document.getElementById('loginModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function openRegisterModal() {
  document.getElementById('registerModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

function closeOnOverlay(event, id) {
  if (event.target.id === id) closeModal(id);
}

function switchToRegister() {
  closeModal('loginModal');
  document.getElementById('registerModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function switchToLogin() {
  closeModal('registerModal');
  document.getElementById('loginModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeModal('loginModal');
    closeModal('registerModal');
  }
});

// ── HELPERS ──
function setLoading(btn, isLoading, text) {
  btn.disabled = isLoading;
  btn.textContent = isLoading ? 'Please wait...' : text;
  btn.style.opacity = isLoading ? '0.7' : '1';
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '⚠ ' + msg;
  el.style.display = 'block';
  el.style.background = 'rgba(220,53,69,0.08)';
  el.style.borderColor = 'rgba(220,53,69,0.3)';
  el.style.color = '#c0392b';
}

function showSuccess(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '✓ ' + msg;
  el.style.display = 'block';
  el.style.background = 'rgba(58,134,255,0.08)';
  el.style.borderColor = 'rgba(58,134,255,0.3)';
  el.style.color = 'var(--accent, #3a86ff)';
}

// ── LOGIN FORM ──
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const btn = this.querySelector('.btn-submit');
  document.getElementById('loginMsg').style.display = 'none';

  if (!email || !password) {
    showError('loginMsg', 'Please enter email and password.');
    return;
  }

  setLoading(btn, true, 'Login →');
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('mg_token', data.token);
      localStorage.setItem('mg_user', JSON.stringify(data.user));
      showSuccess('loginMsg', `Welcome back, ${data.user.name}!`);
      this.reset();
      setTimeout(() => {
        document.getElementById('loginMsg').style.display = 'none';
        closeModal('loginModal');
      }, 1500);
    } else {
      showError('loginMsg', data.error || 'Login failed.');
    }
  } catch {
    showError('loginMsg', 'Cannot reach server. Please check connection.');
  } finally {
    setLoading(btn, false, 'Login →');
  }
});

// ── REGISTER FORM ──
document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const confirm = document.getElementById('regConfirm').value.trim();
  const btn = this.querySelector('.btn-submit');
  document.getElementById('registerMsg').style.display = 'none';

  if (!name || !email || !password || !confirm) {
    showError('registerMsg', 'All fields are required.');
    return;
  }
  if (password.length < 6) {
    showError('registerMsg', 'Password must be at least 6 characters.');
    return;
  }
  if (password !== confirm) {
    showError('registerMsg', 'Passwords do not match.');
    return;
  }

  setLoading(btn, true, 'Create Account →');
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.success) {
      showSuccess('registerMsg', data.message || 'Account created successfully!');
      this.reset();
      setTimeout(() => switchToLogin(), 2000);
    } else {
      showError('registerMsg', data.error || 'Registration failed.');
    }
  } catch {
    showError('registerMsg', 'Cannot reach server. Please check connection.');
  } finally {
    setLoading(btn, false, 'Create Account →');
  }
});

// ── CONTACT FORM ──
document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();
  const btn = this.querySelector('.btn-submit');
  document.getElementById('successMsg').style.display = 'none';

  if (!name || !email || !message) {
    showError('successMsg', 'Please fill Name, Email and Message.');
    return;
  }

  setLoading(btn, true, 'Send Message →');
  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message })
    });
    const data = await res.json();
    if (data.success) {
      showSuccess('successMsg', data.message);
      this.reset();
      setTimeout(() => { document.getElementById('successMsg').style.display = 'none'; }, 6000);
    } else {
      showError('successMsg', data.error || 'Something went wrong.');
    }
  } catch {
    showError('successMsg', 'Cannot reach server. Please try again.');
  } finally {
    setLoading(btn, false, 'Send Message →');
  }
});
