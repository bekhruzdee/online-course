const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

function getApiBaseUrl() {
  const fromStorage = localStorage.getItem('api_base_url');
  if (fromStorage) return fromStorage;

  const { protocol, hostname, port, origin } = window.location;

  if (window.location.protocol === 'file:') {
    return 'http://localhost:3000';
  }

  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
  if (isLocalHost && port && port !== '3000') {
    return 'http://localhost:3000';
  }

  if (!origin || origin === 'null') {
    return 'http://localhost:3000';
  }

  if (protocol === 'http:' || protocol === 'https:') {
    return origin;
  }

  return 'http://localhost:3000';
}

const API_BASE_URL = getApiBaseUrl();

const roleRoutes = {
  admin: `${API_BASE_URL}/admin.html`,
  teacher: `${API_BASE_URL}/teacher.html`,
  student: `${API_BASE_URL}/student.html`,
};

function redirectByRole(role) {
  const route = roleRoutes[role];
  if (!route) return;
  window.location.href = route;
}

async function getCurrentUserFromToken(token) {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return null;
  return res.json();
}

async function bootstrapSession() {
  const token = localStorage.getItem('access_token');
  if (!token) return;

  const user = await getCurrentUserFromToken(token);
  if (!user?.role) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    return;
  }

  localStorage.setItem('username', user.username);
  localStorage.setItem('role', user.role);
  redirectByRole(user.role);
}

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
  window.location.href = `${API_BASE_URL}/auth/google`;
};

document.getElementById('manual-login').onclick = async () => {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('access_token', data.access_token);
      redirectByRole(data.user.role);
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
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert('Registered successfully ✅\nNow you can login!');
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
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
const usernameFromCallback = params.get('username');
const tokenFromCallback = params.get('token');
const roleFromCallback = params.get('role');

if (usernameFromCallback && tokenFromCallback && roleFromCallback) {
  localStorage.setItem('username', usernameFromCallback);
  localStorage.setItem('access_token', tokenFromCallback);
  localStorage.setItem('role', roleFromCallback);
  window.history.replaceState({}, document.title, window.location.pathname);
  redirectByRole(roleFromCallback);
}

bootstrapSession();
