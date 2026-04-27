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

let currentToken = null;
let currentUser = null;
let currentTeacherCourses = [];
let currentAdminUsers = [];
let currentAdminCourses = [];

const modalState = {
  currentAction: null,
  currentData: {},
};

function ensureToastHost() {
  let host = document.getElementById('toast-host');
  if (host) return host;

  host = document.createElement('div');
  host.id = 'toast-host';
  host.className = 'toast-host';
  document.body.appendChild(host);
  return host;
}

function showToast(message, type = 'success') {
  const host = ensureToastHost();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  host.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 180);
  }, 2600);
}

function setPostReloadToast(message, type = 'success') {
  sessionStorage.setItem(
    'post_reload_toast',
    JSON.stringify({ message, type }),
  );
}

function showPendingPostReloadToast() {
  const raw = sessionStorage.getItem('post_reload_toast');
  if (!raw) return;

  sessionStorage.removeItem('post_reload_toast');
  try {
    const payload = JSON.parse(raw);
    if (payload?.message) {
      showToast(payload.message, payload.type || 'success');
    }
  } catch {
    // no-op
  }
}

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

function ensureModal() {
  let backdrop = document.getElementById('crud-modal-backdrop');

  if (backdrop) return backdrop;

  backdrop = document.createElement('div');
  backdrop.id = 'crud-modal-backdrop';
  backdrop.className = 'modal-backdrop hidden';
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="crud-modal-title">
      <div class="modal-header">
        <h3 id="crud-modal-title">Create</h3>
        <button class="modal-close" type="button" id="crud-modal-close" aria-label="Close modal">×</button>
      </div>
      <div class="modal-body" id="crud-modal-body"></div>
    </div>
  `;
  document.body.appendChild(backdrop);

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) {
      closeModal();
    }
  });

  backdrop.querySelector('.modal').addEventListener('click', (event) => {
    event.stopPropagation();
  });

  backdrop
    .querySelector('#crud-modal-close')
    .addEventListener('click', closeModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });

  return backdrop;
}

function openModal(title, content) {
  const backdrop = ensureModal();
  const modalTitle = backdrop.querySelector('#crud-modal-title');
  const modalBody = backdrop.querySelector('#crud-modal-body');
  modalTitle.textContent = title;
  modalBody.innerHTML = content;
  backdrop.classList.remove('hidden');
}

function closeModal() {
  const backdrop = document.getElementById('crud-modal-backdrop');
  if (!backdrop) return;
  backdrop.classList.add('hidden');
  modalState.currentAction = null;
  modalState.currentData = {};
}

function getTeacherCourseOptions() {
  if (!currentTeacherCourses.length) {
    return '<option value="">No courses available</option>';
  }

  return currentTeacherCourses
    .map((course) => `<option value="${course.id}">${course.title}</option>`)
    .join('');
}

function openTeacherCourseModal() {
  modalState.currentAction = 'teacher-create-course';
  modalState.currentData = {};
  openModal(
    'New Course',
    `
      <form class="form-grid" id="crud-form">
        <div class="field">
          <label for="course-title">Title</label>
          <input id="course-title" name="title" type="text" maxlength="150" required />
        </div>
        <div class="field">
          <label for="course-description">Description</label>
          <textarea id="course-description" name="description" required></textarea>
        </div>
        <div class="field">
          <label for="course-price">Price</label>
          <input id="course-price" name="price" type="number" min="0" step="1" value="0" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" type="button" id="crud-cancel">Cancel</button>
          <button class="btn btn-primary" type="submit">Create Course</button>
        </div>
      </form>
    `,
  );
  bindCrudFormHandlers();
}

function openTeacherLessonModal() {
  modalState.currentAction = 'teacher-create-lesson';
  modalState.currentData = {};
  openModal(
    'New Lesson',
    `
      <form class="form-grid" id="crud-form">
        <div class="field">
          <label for="lesson-title">Title</label>
          <input id="lesson-title" name="title" type="text" maxlength="150" required />
        </div>
        <div class="field">
          <label for="lesson-content-url">Content URL</label>
          <input id="lesson-content-url" name="contentUrl" type="url" maxlength="500" required />
        </div>
        <div class="field">
          <label for="lesson-course-id">Course</label>
          <select id="lesson-course-id" name="courseId" required>
            ${getTeacherCourseOptions()}
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" type="button" id="crud-cancel">Cancel</button>
          <button class="btn btn-primary" type="submit">Create Lesson</button>
        </div>
      </form>
    `,
  );
  bindCrudFormHandlers();
}

function openAdminUserModal() {
  modalState.currentAction = 'admin-create-user';
  modalState.currentData = {};
  openModal(
    'New User',
    `
      <form class="form-grid" id="crud-form">
        <div class="field">
          <label for="user-username">Username</label>
          <input id="user-username" name="username" type="text" minlength="3" required />
        </div>
        <div class="field">
          <label for="user-password">Password</label>
          <input id="user-password" name="password" type="password" minlength="6" required />
        </div>
        <div class="field">
          <label for="user-role">Role</label>
          <select id="user-role" name="role" required>
            <option value="student">student</option>
            <option value="teacher">teacher</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" type="button" id="crud-cancel">Cancel</button>
          <button class="btn btn-primary" type="submit">Create User</button>
        </div>
      </form>
    `,
  );
  bindCrudFormHandlers();
}

function getAdminStudentOptions() {
  const students = currentAdminUsers.filter((user) => user.role === 'student');
  if (!students.length) {
    return '<option value="">No students available</option>';
  }

  return students
    .map(
      (student) => `<option value="${student.id}">${student.username}</option>`,
    )
    .join('');
}

function getAdminCourseOptions() {
  if (!currentAdminCourses.length) {
    return '<option value="">No courses available</option>';
  }

  return currentAdminCourses
    .map((course) => `<option value="${course.id}">${course.title}</option>`)
    .join('');
}

function openAdminAssignEnrollmentModal() {
  modalState.currentAction = 'admin-assign-enrollment';
  modalState.currentData = {};
  openModal(
    'Assign Student To Course',
    `
      <form class="form-grid" id="crud-form">
        <div class="field">
          <label for="assign-student-id">Student</label>
          <select id="assign-student-id" name="userId" required>
            ${getAdminStudentOptions()}
          </select>
        </div>
        <div class="field">
          <label for="assign-course-id">Course</label>
          <select id="assign-course-id" name="courseId" required>
            ${getAdminCourseOptions()}
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" type="button" id="crud-cancel">Cancel</button>
          <button class="btn btn-primary" type="submit">Assign</button>
        </div>
      </form>
    `,
  );
  bindCrudFormHandlers();
}

function openTeacherEditCourseModal(course) {
  modalState.currentAction = 'teacher-edit-course';
  modalState.currentData = { courseId: course.id };
  openModal(
    'Edit Course',
    `
      <form class="form-grid" id="crud-form">
        <div class="field">
          <label for="course-title">Title</label>
           <input id="course-title" name="title" type="text" maxlength="150" required value="${escapeHtml(course.title)}" />
        </div>
        <div class="field">
          <label for="course-description">Description</label>
           <textarea id="course-description" name="description" required>${escapeHtml(course.description || '')}</textarea>
        </div>
        <div class="field">
          <label for="course-price">Price</label>
          <input id="course-price" name="price" type="number" min="0" step="1" value="${Number(course.price ?? 0)}" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" type="button" id="crud-cancel">Cancel</button>
          <button class="btn btn-primary" type="submit">Save Changes</button>
        </div>
      </form>
    `,
  );
  bindCrudFormHandlers();
}

function openTeacherEditLessonModal(lesson) {
  modalState.currentAction = 'teacher-edit-lesson';
  modalState.currentData = { lessonId: lesson.id };
  openModal(
    'Edit Lesson',
    `
      <form class="form-grid" id="crud-form">
        <div class="field">
          <label for="lesson-title">Title</label>
           <input id="lesson-title" name="title" type="text" maxlength="150" required value="${escapeHtml(lesson.title)}" />
        </div>
        <div class="field">
          <label for="lesson-content-url">Content URL</label>
           <input id="lesson-content-url" name="contentUrl" type="url" maxlength="500" required value="${escapeHtml(lesson.contentUrl || '')}" />
        </div>
        <div class="field">
          <label for="lesson-course-id">Course</label>
          <select id="lesson-course-id" name="courseId" required>
            ${getTeacherCourseOptions()}
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" type="button" id="crud-cancel">Cancel</button>
          <button class="btn btn-primary" type="submit">Save Changes</button>
        </div>
      </form>
    `,
  );
  bindCrudFormHandlers();

  const select = document.getElementById('lesson-course-id');
  if (select && lesson.course?.id) {
    select.value = lesson.course.id;
  }
}

function openAdminEditUserModal(user) {
  modalState.currentAction = 'admin-edit-user';
  modalState.currentData = { userId: user.id };
  openModal(
    'Edit User',
    `
      <form class="form-grid" id="crud-form">
        <div class="field">
          <label for="user-username">Username</label>
           <input id="user-username" name="username" type="text" minlength="3" required value="${escapeHtml(user.username)}" />
        </div>
        <div class="field">
          <label for="user-password">Password</label>
          <input id="user-password" name="password" type="password" minlength="6" placeholder="Leave blank to keep current password" />
        </div>
        <div class="field">
          <label for="user-role">Role</label>
          <select id="user-role" name="role" required>
            <option value="student">student</option>
            <option value="teacher">teacher</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" type="button" id="crud-cancel">Cancel</button>
          <button class="btn btn-primary" type="submit">Save Changes</button>
        </div>
      </form>
    `,
  );
  bindCrudFormHandlers();

  const roleSelect = document.getElementById('user-role');
  if (roleSelect) {
    roleSelect.value = user.role || 'student';
  }
}

function bindCrudFormHandlers() {
  const form = document.getElementById('crud-form');
  const cancelBtn = document.getElementById('crud-cancel');
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!currentToken || !currentUser) return;

    const formData = new FormData(form);

    try {
      if (modalState.currentAction === 'teacher-create-course') {
        await apiRequest('/courses', currentToken, {
          method: 'POST',
          body: {
            title: String(formData.get('title') || '').trim(),
            description: String(formData.get('description') || '').trim(),
            price: Number(formData.get('price') || 0),
          },
        });
      }

      if (modalState.currentAction === 'teacher-edit-course') {
        await apiRequest(
          `/courses/${modalState.currentData.courseId}`,
          currentToken,
          {
            method: 'PATCH',
            body: {
              title: String(formData.get('title') || '').trim(),
              description: String(formData.get('description') || '').trim(),
              price: Number(formData.get('price') || 0),
            },
          },
        );
      }

      if (modalState.currentAction === 'teacher-create-lesson') {
        await apiRequest('/lessons', currentToken, {
          method: 'POST',
          body: {
            title: String(formData.get('title') || '').trim(),
            contentUrl: String(formData.get('contentUrl') || '').trim(),
            courseId: String(formData.get('courseId') || ''),
          },
        });
      }

      if (modalState.currentAction === 'teacher-edit-lesson') {
        await apiRequest(
          `/lessons/${modalState.currentData.lessonId}`,
          currentToken,
          {
            method: 'PATCH',
            body: {
              title: String(formData.get('title') || '').trim(),
              contentUrl: String(formData.get('contentUrl') || '').trim(),
              courseId: String(formData.get('courseId') || ''),
            },
          },
        );
      }

      if (modalState.currentAction === 'admin-create-user') {
        await apiRequest('/users', currentToken, {
          method: 'POST',
          body: {
            username: String(formData.get('username') || '').trim(),
            password: String(formData.get('password') || ''),
            role: String(formData.get('role') || 'student'),
          },
        });
      }

      if (modalState.currentAction === 'admin-edit-user') {
        const payload = {
          username: String(formData.get('username') || '').trim(),
          role: String(formData.get('role') || 'student'),
        };

        const passwordValue = String(formData.get('password') || '').trim();
        if (passwordValue) {
          payload.password = passwordValue;
        }

        await apiRequest(
          `/users/${modalState.currentData.userId}`,
          currentToken,
          {
            method: 'PATCH',
            body: payload,
          },
        );
      }

      if (modalState.currentAction === 'admin-assign-enrollment') {
        await apiRequest('/enrollments/assign', currentToken, {
          method: 'POST',
          body: {
            userId: String(formData.get('userId') || ''),
            courseId: String(formData.get('courseId') || ''),
          },
        });
      }

      setPostReloadToast('Saved successfully');
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error('Create action failed:', error);
      showToast(
        error?.message || 'Save failed. Please check values and try again.',
        'error',
      );
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

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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

async function apiRequest(path, token, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const raw = await res.text();
  const payload = raw ? JSON.parse(raw) : null;

  if (!res.ok) {
    const message =
      payload?.message || payload?.error || `Request failed (${res.status})`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return payload;
}

async function fetchStudentCourses(token) {
  const payload = await apiRequest('/enrollments/my-courses', token);
  return Array.isArray(payload?.data) ? payload.data : [];
}

async function fetchStudentCatalog(token) {
  const payload = await apiRequest('/courses/published', token);
  return Array.isArray(payload?.data) ? payload.data : [];
}

async function fetchCourseLessons(token, courseId) {
  const payload = await apiRequest(`/lessons/course/${courseId}`, token);
  return Array.isArray(payload?.data) ? payload.data : payload;
}

async function fetchTeacherCourses(token) {
  const payload = await apiRequest('/courses/my', token);
  return Array.isArray(payload?.data) ? payload.data : [];
}

async function fetchTeacherLessons(token) {
  const payload = await apiRequest('/lessons/my', token);
  return Array.isArray(payload?.data) ? payload.data : [];
}

async function fetchAdminUsers(token) {
  const payload = await apiRequest('/users/all', token);
  return Array.isArray(payload?.data) ? payload.data : [];
}

async function fetchAdminCourses(token) {
  const payload = await apiRequest('/courses', token);
  return Array.isArray(payload?.data) ? payload.data : [];
}

async function fetchAdminEnrollments(token) {
  const payload = await apiRequest('/enrollments', token);
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

function renderStudentProfileCourses(courses) {
  const countEl = document.getElementById('profile-enrolled-count');
  const listEl = document.getElementById('profile-student-courses');

  if (countEl) {
    countEl.textContent = String(courses.length);
  }

  if (!listEl) return;

  if (courses.length === 0) {
    listEl.innerHTML =
      '<li><span>No enrolled courses</span><span class="badge warning">Empty</span></li>';
    return;
  }

  listEl.innerHTML = courses
    .map(
      (course) =>
        `<li><span>${course.title}</span><span class="badge">Joined</span></li>`,
    )
    .join('');
}

function renderStudentLessonsByCourse(courses, lessonsByCourse) {
  const listEl = document.getElementById('student-lessons-list');
  if (!listEl) return;

  if (courses.length === 0) {
    listEl.innerHTML =
      '<li><span>Enroll in a course to see lessons</span><span class="badge warning">Empty</span></li>';
    return;
  }

  const rows = [];
  for (const course of courses) {
    const lessons = lessonsByCourse[course.id] || [];

    if (lessons.length === 0) {
      rows.push(
        `<li><div><div>${course.title}</div><div class="profile-label">No lessons yet</div></div><span class="badge warning">0</span></li>`,
      );
      continue;
    }

    for (const lesson of lessons) {
      rows.push(
        `<li><div><div>${lesson.title}</div><div class="profile-label">${course.title}</div></div><a class="btn btn-ghost action-btn" href="${lesson.contentUrl}" target="_blank" rel="noopener noreferrer">Open</a></li>`,
      );
    }
  }

  listEl.innerHTML = rows.join('');
}

function renderStudentCatalog(courses, enrolledCourseIds = new Set()) {
  const listEl = document.getElementById('student-catalog-list');
  if (!listEl) return;

  if (courses.length === 0) {
    listEl.innerHTML =
      '<li><span>No published courses available</span><span class="badge warning">Empty</span></li>';
    return;
  }

  listEl.innerHTML = courses
    .map((course) => {
      const teacherName = course.teacher?.username || 'unknown';
      const isEnrolled = enrolledCourseIds.has(course.id);
      return `
        <li>
          <div>
            <div>${course.title}</div>
            <div class="profile-label">${teacherName} • ${formatPrice(course.price)}</div>
          </div>
          ${
            isEnrolled
              ? '<span class="badge">Enrolled</span>'
              : `<button class="btn btn-ghost action-btn" data-action="student-enroll" data-course-id="${course.id}">Enroll</button>`
          }
        </li>
      `;
    })
    .join('');
}

async function initStudentView(token) {
  const [catalog, enrollments] = await Promise.all([
    fetchStudentCatalog(token),
    fetchStudentCourses(token),
  ]);

  const enrolledCourses = enrollments
    .map((item) => item?.course)
    .filter((course) => !!course);
  const enrolledCourseIds = new Set(enrolledCourses.map((course) => course.id));

  const lessonsEntries = await Promise.all(
    enrolledCourses.map(async (course) => {
      const lessons = await fetchCourseLessons(token, course.id);
      return [course.id, lessons];
    }),
  );

  const lessonsByCourse = Object.fromEntries(lessonsEntries);

  renderStudentCatalog(catalog, enrolledCourseIds);
  renderStudentCourses(enrollments);
  renderStudentProfileCourses(enrolledCourses);
  renderStudentLessonsByCourse(enrolledCourses, lessonsByCourse);
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
      return `
        <li>
          <div>
            <div>${course.title}</div>
            <div class="profile-label">${formatPrice(course.price)}</div>
          </div>
          <div class="list-actions">
            <span class="${badge}">${course.status}</span>
            <button class="btn btn-ghost action-btn" data-action="teacher-edit-course" data-course-id="${course.id}" data-title="${encodeURIComponent(course.title)}" data-description="${encodeURIComponent(course.description || '')}" data-price="${Number(course.price ?? 0)}">Edit</button>
            <button class="btn btn-ghost action-btn" data-action="teacher-delete-course" data-course-id="${course.id}">Delete</button>
          </div>
        </li>
      `;
    })
    .join('');
}

function renderTeacherLessons(lessons) {
  const listEl = document.getElementById('teacher-lessons-list');
  if (!listEl) return;

  if (lessons.length === 0) {
    listEl.innerHTML =
      '<li><span>No lessons found</span><span class="badge warning">Empty</span></li>';
    return;
  }

  listEl.innerHTML = lessons
    .map((lesson) => {
      const courseTitle = lesson.course?.title || 'unknown course';
      return `
        <li>
          <div>
            <div>${lesson.title}</div>
            <div class="profile-label">${courseTitle}</div>
          </div>
          <button class="btn btn-ghost action-btn" data-action="teacher-delete-lesson" data-lesson-id="${lesson.id}">Delete</button>
          <button class="btn btn-ghost action-btn" data-action="teacher-edit-lesson" data-lesson-id="${lesson.id}" data-title="${encodeURIComponent(lesson.title)}" data-content-url="${encodeURIComponent(lesson.contentUrl || '')}" data-course-id="${lesson.course?.id || ''}">Edit</button>
        </li>
      `;
    })
    .join('');
}

async function initTeacherView(token) {
  const [courses, lessons] = await Promise.all([
    fetchTeacherCourses(token),
    fetchTeacherLessons(token),
  ]);
  currentTeacherCourses = courses;
  renderTeacherCourses(courses);
  renderTeacherLessons(lessons);
}

function renderAdminUsers(users) {
  const listEl = document.getElementById('admin-users-list');
  if (!listEl) return;

  if (users.length === 0) {
    listEl.innerHTML =
      '<li><span>No users found</span><span class="badge warning">Empty</span></li>';
    return;
  }

  listEl.innerHTML = users
    .map((user) => {
      const canDelete = user.role !== 'admin';
      const canEdit = user.role !== 'admin';
      return `
        <li>
          <div>
            <div>${user.username}</div>
            <div class="profile-label">${user.role}</div>
          </div>
          <div class="list-actions">
            <span class="badge">${user.role}</span>
            ${canEdit ? `<button class="btn btn-ghost action-btn" data-action="admin-edit-user" data-user-id="${user.id}" data-username="${encodeURIComponent(user.username)}" data-role="${user.role}">Edit</button>` : ''}
            ${canDelete ? `<button class="btn btn-ghost action-btn" data-action="admin-delete-user" data-user-id="${user.id}">Delete</button>` : ''}
          </div>
        </li>
      `;
    })
    .join('');
}

function renderAdminData(users, courses) {
  const totalUsersEl = document.getElementById('admin-total-users');
  const activeTeachersEl = document.getElementById('admin-active-teachers');
  const totalStudentsEl = document.getElementById('admin-total-students');
  const listEl = document.getElementById('admin-queue-list');
  const enrollmentCountEl = document.getElementById('admin-total-enrollments');

  if (!totalUsersEl || !activeTeachersEl || !totalStudentsEl || !listEl) return;

  const teachers = users.filter((user) => user.role === 'teacher');
  const students = users.filter((user) => user.role === 'student');

  totalUsersEl.textContent = String(users.length);
  activeTeachersEl.textContent = String(teachers.length);
  totalStudentsEl.textContent = String(students.length);

  if (enrollmentCountEl) {
    enrollmentCountEl.textContent = String(currentAdminEnrollments.length);
  }

  renderAdminUsers(users);

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
      const publishButton =
        course.status === 'draft'
          ? `<button class="btn btn-ghost action-btn" data-action="admin-publish-course" data-course-id="${course.id}">Publish</button>`
          : '';

      return `
        <li>
          <div>
            <div>${course.title}</div>
            <div class="profile-label">${teacherName}</div>
          </div>
          <div class="list-actions">
            <span class="${badge}">${course.status}</span>
            <button class="btn btn-ghost action-btn" data-action="teacher-edit-course" data-course-id="${course.id}" data-title="${encodeURIComponent(course.title)}" data-description="${encodeURIComponent(course.description || '')}" data-price="${Number(course.price ?? 0)}">Edit</button>
            ${publishButton}
            <button class="btn btn-ghost action-btn" data-action="admin-delete-course" data-course-id="${course.id}">Delete</button>
          </div>
        </li>
      `;
    })
    .join('');
}

let currentAdminEnrollments = [];

function renderAdminEnrollments(enrollments) {
  const listEl = document.getElementById('admin-enrollments-list');
  if (!listEl) return;

  if (enrollments.length === 0) {
    listEl.innerHTML =
      '<li><span>No enrollments yet</span><span class="badge warning">Empty</span></li>';
    return;
  }

  listEl.innerHTML = enrollments
    .map((enrollment) => {
      const studentName = enrollment.user?.username || 'unknown student';
      const courseTitle = enrollment.course?.title || 'unknown course';
      const teacherName =
        enrollment.course?.teacher?.username || 'unknown teacher';
      return `
        <li>
          <div>
            <div>${studentName} → ${courseTitle}</div>
            <div class="profile-label">Teacher: ${teacherName} • ${formatDate(enrollment.enrolledAt)}</div>
          </div>
          <span class="badge">Enrolled</span>
        </li>
      `;
    })
    .join('');
}

async function initAdminView(token) {
  const [users, courses, enrollments] = await Promise.all([
    fetchAdminUsers(token),
    fetchAdminCourses(token),
    fetchAdminEnrollments(token),
  ]);

  currentAdminUsers = users;
  currentAdminCourses = courses;
  currentAdminEnrollments = enrollments;

  renderAdminData(users, courses);
  renderAdminEnrollments(enrollments);
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
  currentToken = token;
  currentUser = user;

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

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('button[data-action]');
  if (!trigger) return;

  const action = trigger.dataset.action;

  if (action === 'open-create-course') {
    openTeacherCourseModal();
  }

  if (action === 'open-create-lesson') {
    openTeacherLessonModal();
  }

  if (action === 'open-create-user') {
    openAdminUserModal();
  }

  if (action === 'open-assign-enrollment') {
    openAdminAssignEnrollmentModal();
  }

  if (action === 'teacher-edit-course') {
    openTeacherEditCourseModal({
      id: trigger.dataset.courseId,
      title: decodeURIComponent(trigger.dataset.title || ''),
      description: decodeURIComponent(trigger.dataset.description || ''),
      price: Number(trigger.dataset.price || 0),
    });
  }

  if (action === 'teacher-edit-lesson') {
    openTeacherEditLessonModal({
      id: trigger.dataset.lessonId,
      title: decodeURIComponent(trigger.dataset.title || ''),
      contentUrl: decodeURIComponent(trigger.dataset.contentUrl || ''),
      course: {
        id: trigger.dataset.courseId || '',
      },
    });
  }

  if (action === 'admin-edit-user') {
    openAdminEditUserModal({
      id: trigger.dataset.userId,
      username: decodeURIComponent(trigger.dataset.username || ''),
      role: trigger.dataset.role || 'student',
    });
  }
});

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

document.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || !currentToken || !currentUser) return;

  const action = button.dataset.action;

  const ignoredActions = new Set([
    'open-create-course',
    'open-create-lesson',
    'open-create-user',
    'open-assign-enrollment',
    'teacher-edit-course',
    'teacher-edit-lesson',
    'admin-edit-user',
  ]);

  if (ignoredActions.has(action)) return;

  try {
    let successMessage = 'Action completed successfully';
    let shouldReload = true;

    if (action === 'student-enroll') {
      const courseId = button.dataset.courseId;
      if (!courseId) return;
      await apiRequest('/enrollments', currentToken, {
        method: 'POST',
        body: { courseId },
      });
      successMessage = 'Enrolled successfully';
      shouldReload = false;
      await initStudentView(currentToken);
      showToast(successMessage);
      return;
    }

    if (action === 'teacher-delete-course') {
      const courseId = button.dataset.courseId;
      if (!courseId) return;
      await apiRequest(`/courses/${courseId}`, currentToken, {
        method: 'DELETE',
      });
    }

    if (action === 'teacher-delete-lesson') {
      const lessonId = button.dataset.lessonId;
      if (!lessonId) return;
      await apiRequest(`/lessons/${lessonId}`, currentToken, {
        method: 'DELETE',
      });
    }

    if (action === 'admin-delete-user') {
      const userId = button.dataset.userId;
      if (!userId) return;
      await apiRequest(`/users/${userId}`, currentToken, {
        method: 'DELETE',
      });
    }

    if (action === 'admin-publish-course') {
      const courseId = button.dataset.courseId;
      if (!courseId) return;
      await apiRequest(`/courses/${courseId}/publish`, currentToken, {
        method: 'PATCH',
      });
    }

    if (shouldReload) {
      setPostReloadToast(successMessage);
      window.location.reload();
      return;
    }

    showToast(successMessage);
  } catch (error) {
    console.error('Dashboard action failed:', error);
    showToast(error?.message || 'Action failed. Please try again.', 'error');
  }
});

showPendingPostReloadToast();
initDashboard();
setupProfilePanelHandlers();
