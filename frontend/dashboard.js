function getApiBaseUrl() {
  const fromStorage = localStorage.getItem('api_base_url');
  if (fromStorage) return fromStorage;

  if (window.location.protocol === 'file:') {
    return 'http://localhost:3000';
  }

  if (!window.location.origin || window.location.origin === 'null') {
    return 'http://localhost:3000';
  }

  return window.location.origin;
}

const API_BASE_URL = getApiBaseUrl();
const pageRole = document.body.dataset.role;

const roleRoutes = {
  admin: `${API_BASE_URL}/admin.html`,
  teacher: `${API_BASE_URL}/teacher.html`,
  student: `${API_BASE_URL}/student.html`,
};

const usernameEl = document.getElementById('username');
const roleEl = document.getElementById('role-chip');
const logoutBtn = document.getElementById('logout-btn');
const profileToggleBtn = document.getElementById('profile-toggle');
const profilePanel = document.getElementById('profile-panel');

function closeProfilePanel() {
  if (!profilePanel) return;
  profilePanel.classList.add('hidden');
  profilePanel.setAttribute('aria-hidden', 'true');
}

function toggleProfilePanel() {
  if (!profilePanel) return;
  const isHidden = profilePanel.classList.contains('hidden');
  if (isHidden) {
    profilePanel.classList.remove('hidden');
    profilePanel.setAttribute('aria-hidden', 'false');
  } else {
    closeProfilePanel();
  }
}

function setupProfilePanelHandlers() {
  if (!profileToggleBtn || !profilePanel) return;

  profileToggleBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleProfilePanel();
  });

  profilePanel.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  document.addEventListener('click', () => {
    closeProfilePanel();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeProfilePanel();
    }
  });
}

function formatDate(dateValue) {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}

function shortenId(id) {
  if (!id) return '-';
  const text = String(id);
  if (text.length < 10) return text;
  return `${text.slice(0, 8)}...${text.slice(-4)}`;
}

function renderProfile(user) {
  const profileUsername = document.getElementById('profile-username');
  const profileRole = document.getElementById('profile-role');
  const profileId = document.getElementById('profile-id');
  const profileCreated = document.getElementById('profile-created');
  const profileAvatar = document.getElementById('profile-avatar');

  if (profileUsername) profileUsername.textContent = user.username || 'User';
  if (profileRole) profileRole.textContent = user.role || '-';
  if (profileId) profileId.textContent = shortenId(user.id);
  if (profileCreated) profileCreated.textContent = formatDate(user.createdAt);
  if (profileAvatar) {
    const first = (user.username || 'U').trim().charAt(0).toUpperCase();
    profileAvatar.textContent = first || 'U';
  }
}

async function fetchWithToken(path, token) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return null;
  return res.json();
}

async function fetchStudentCourses(token) {
  const payload = await fetchWithToken('/enrollments/my-courses', token);
  if (!payload) return [];
  return Array.isArray(payload?.data) ? payload.data : [];
}

async function fetchTeacherCourses(token) {
  const payload = await fetchWithToken('/courses/my', token);
  if (!payload) return [];
  return Array.isArray(payload?.data) ? payload.data : [];
}

async function fetchAdminUsers(token) {
  const payload = await fetchWithToken('/users/all', token);
  if (!payload) return [];
  return Array.isArray(payload?.data) ? payload.data : [];
}

async function fetchAdminCourses(token) {
  const payload = await fetchWithToken('/courses', token);
  if (!payload) return [];
  return Array.isArray(payload?.data) ? payload.data : [];
}

function formatPrice(price) {
  const num = Number(price ?? 0);
  if (!Number.isFinite(num)) return '$0';
  return `$${num.toFixed(0)}`;
}

function renderStudentCourses(enrollments) {
  const enrolledEl = document.getElementById('stat-enrolled');
  const learningEl = document.getElementById('stat-learning');
  const listEl = document.getElementById('my-courses-list');

  if (!enrolledEl || !learningEl || !listEl) return;

  const courses = enrollments
    .map((item) => item?.course)
    .filter((course) => !!course);

  enrolledEl.textContent = String(courses.length);
  learningEl.textContent = String(courses.length);

  if (courses.length === 0) {
    listEl.innerHTML =
      '<li><span>No enrolled courses yet</span><span class="badge warning">Empty</span></li>';
    return;
  }

  listEl.innerHTML = courses
    .map(
      (course) =>
        `<li><span>${course.title}</span><span class="badge">${formatPrice(course.price)}</span></li>`,
    )
    .join('');
}

async function initStudentView(token) {
  const enrollments = await fetchStudentCourses(token);
  renderStudentCourses(enrollments);
}

function renderTeacherCourses(courses) {
  const totalEl = document.getElementById('teacher-total-courses');
  const publishedEl = document.getElementById('teacher-published-courses');
  const draftEl = document.getElementById('teacher-draft-courses');
  const listEl = document.getElementById('teacher-course-list');

  if (!totalEl || !publishedEl || !draftEl || !listEl) return;

  const published = courses.filter((course) => course.status === 'published');
  const draft = courses.filter((course) => course.status === 'draft');

  totalEl.textContent = String(courses.length);
  publishedEl.textContent = String(published.length);
  draftEl.textContent = String(draft.length);

  if (courses.length === 0) {
    listEl.innerHTML =
      '<li><span>No courses created yet</span><span class="badge warning">Empty</span></li>';
    return;
  }

  listEl.innerHTML = courses
    .map((course) => {
      const badge = course.status === 'published' ? 'badge' : 'badge warning';
      return `<li><span>${course.title}</span><span class="${badge}">${course.status}</span></li>`;
    })
    .join('');
}

async function initTeacherView(token) {
  const courses = await fetchTeacherCourses(token);
  renderTeacherCourses(courses);
}

function renderAdminData(users, courses) {
  const totalUsersEl = document.getElementById('admin-total-users');
  const activeTeachersEl = document.getElementById('admin-active-teachers');
  const totalStudentsEl = document.getElementById('admin-total-students');
  const listEl = document.getElementById('admin-queue-list');

  if (!totalUsersEl || !activeTeachersEl || !totalStudentsEl || !listEl) return;

  const teachers = users.filter((user) => user.role === 'teacher');
  const students = users.filter((user) => user.role === 'student');

  totalUsersEl.textContent = String(users.length);
  activeTeachersEl.textContent = String(teachers.length);
  totalStudentsEl.textContent = String(students.length);

  const recentCourses = courses.slice(0, 5);
  if (recentCourses.length === 0) {
    listEl.innerHTML =
      '<li><span>No courses found</span><span class="badge warning">Empty</span></li>';
    return;
  }

  listEl.innerHTML = recentCourses
    .map((course) => {
      const teacherName = course.teacher?.username || 'unknown';
      const badge = course.status === 'published' ? 'badge' : 'badge warning';
      return `<li><span>${course.title} • ${teacherName}</span><span class="${badge}">${course.status}</span></li>`;
    })
    .join('');
}

async function initAdminView(token) {
  const [users, courses] = await Promise.all([
    fetchAdminUsers(token),
    fetchAdminCourses(token),
  ]);

  renderAdminData(users, courses);
}

async function getCurrentUser(token) {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

function clearSessionAndGoLogin() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  window.location.href = `${API_BASE_URL}/login.html`;
}

async function initDashboard() {
  const token = localStorage.getItem('access_token');

  if (!token) {
    clearSessionAndGoLogin();
    return;
  }

  const user = await getCurrentUser(token);
  if (!user || !user.role) {
    clearSessionAndGoLogin();
    return;
  }

  localStorage.setItem('username', user.username);
  localStorage.setItem('role', user.role);

  if (user.role !== pageRole) {
    window.location.href =
      roleRoutes[user.role] || `${API_BASE_URL}/login.html`;
    return;
  }

  usernameEl.textContent = user.username;
  roleEl.textContent = user.role;
  renderProfile(user);

  if (pageRole === 'student') {
    await initStudentView(token);
  }

  if (pageRole === 'teacher') {
    await initTeacherView(token);
  }

  if (pageRole === 'admin') {
    await initAdminView(token);
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('access_token');

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });
    } finally {
      clearSessionAndGoLogin();
    }
  });
}

initDashboard();
setupProfilePanelHandlers();
