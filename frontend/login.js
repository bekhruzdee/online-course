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

function setupToggle(toggleId, inputId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);

  toggle.onclick = () => {
    if (input.type === 'password') {
      input.type = 'text';
      toggle.textContent = '🙈';
    } else {
      input.type = 'password';
      toggle.textContent = '👁';
    }
  };
}

setupToggle('toggle-login-password', 'login-password');
setupToggle('toggle-register-password', 'register-password');

document.getElementById('google-login').onclick = () => {
  window.location.href = 'http://localhost:3000/auth/google';
};

document.getElementById('manual-login').onclick = async () => {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('username', data.user.username);
      showWelcome(data.user.username);
    } else {
      const errorMsg = Array.isArray(data.message)
        ? data.message.join('\n')
        : data.message || 'Login failed ❌';
      alert(errorMsg);
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Network error! Check if backend is running ❌');
  }
};

document.getElementById('register-btn').onclick = async () => {
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;

  if (!username || !password) {
    alert('Please fill in all fields!');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert('Registered successfully ✅\nNow you can login!');
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      // Clear inputs
      document.getElementById('register-username').value = '';
      document.getElementById('register-password').value = '';
    } else {
      const errorMsg = Array.isArray(data.message)
        ? data.message.join('\n')
        : data.message || 'Register failed ❌';
      alert(errorMsg);
    }
  } catch (error) {
    console.error('Register error:', error);
    alert('Network error! Check if backend is running ❌');
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

const savedUser = localStorage.getItem('username');
if (savedUser) {
  showWelcome(savedUser);
}

function showWelcome(username) {
  authCard.classList.add('hidden');
  welcomePage.classList.remove('hidden');
  // Prevent XSS by using textContent instead of innerHTML
  welcomeText.textContent = `Welcome, ${username}! 🎉`;
}

document.getElementById('logout-btn').onclick = () => {
  localStorage.clear();
  welcomePage.classList.add('hidden');
  authCard.classList.remove('hidden');
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
};
