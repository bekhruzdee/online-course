const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authCard = document.getElementById('auth-card');
const welcomePage = document.getElementById('welcome-page');
const welcomeText = document.getElementById('welcome-text');

document.getElementById('go-register').onclick = () => {
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
};

document.getElementById('go-login').onclick = () => {
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
};

document.getElementById('google-login').onclick = () => {
  window.location.href = 'http://localhost:3000/auth/google';
};

document.getElementById('manual-login').onclick = async () => {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  const res = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('username', data.user.username);
    showWelcome(data.user.username);
  } else {
    alert('Login failed ❌');
  }
};

document.getElementById('register-btn').onclick = async () => {
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;

  const res = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (res.ok) {
    alert('Registered successfully ✅');
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  } else {
    alert('Register failed ❌');
  }
};

const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const usernameFromCallback = params.get('username');

if (token && usernameFromCallback) {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('username', usernameFromCallback);
  showWelcome(usernameFromCallback);
  window.history.replaceState({}, document.title, window.location.pathname);
}

function showWelcome(username) {
  authCard.classList.add('hidden');
  welcomePage.classList.remove('hidden');
  welcomeText.textContent = `Welcome, ${username}! 🎉`;
}

document.getElementById('logout-btn').onclick = () => {
  localStorage.clear();
  welcomePage.classList.add('hidden');
  authCard.classList.remove('hidden');
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
};
