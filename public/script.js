
// DOM Elements & Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Dark Mode
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            if (toggleSwitch) toggleSwitch.checked = true;
        }
    }

    if (toggleSwitch) {
        toggleSwitch.addEventListener('change', function (e) {
            if (e.target.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Add Course Form
    const addCourseForm = document.getElementById('addCourseForm');
    if (addCourseForm) {
        addCourseForm.addEventListener('submit', handleAddCourse);
    }

    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContact);
    }

    // Search & Filter (Dashboard)
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    if (searchInput && categoryFilter) {
        searchInput.addEventListener('input', () => loadCourses());
        categoryFilter.addEventListener('change', () => loadCourses());
    }

    // Forgot Password
    const forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) {
        forgotLink.addEventListener('click', handleForgotPassword);
    }
});

// Session Management
function checkSession() {
    fetch('/api/session')
        .then(res => res.json())
        .then(data => {
            if (data.loggedIn) {
                const userSpan = document.getElementById('userName');
                if (userSpan) userSpan.textContent = data.user.name;
            } else {
                window.location.href = 'index.html';
            }
        })
        .catch(err => console.error(err));
}

// Handlers
function handleLogin(e) {
    e.preventDefault();
    const roll = document.getElementById('roll_no').value;
    const pass = document.getElementById('password').value;
    const msg = document.getElementById('loginMessage');

    if (!roll || !pass) {
        msg.textContent = 'Please fill in all fields.';
        return;
    }

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roll_no: roll, password: pass })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.location.href = data.redirect;
            } else {
                msg.textContent = data.message;
            }
        })
        .catch(err => msg.textContent = 'Login Error.');
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const roll = document.getElementById('regRoll').value;
    const pass = document.getElementById('regPass').value;
    const confirm = document.getElementById('regConfirmPass').value;
    const msg = document.getElementById('regMessage');

    if (pass !== confirm) {
        document.getElementById('matchError').style.display = 'block';
        return;
    } else {
        document.getElementById('matchError').style.display = 'none';
    }

    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, roll_no: roll, password: pass })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                msg.style.color = 'green';
                msg.textContent = 'Registration Successful! Redirecting to login...';
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                msg.style.color = 'red';
                msg.textContent = data.message;
            }
        })
        .catch(err => msg.textContent = 'Registration Error.');
}

function handleLogout(e) {
    e.preventDefault();
    fetch('/api/logout', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            if (data.success) window.location.href = 'index.html';
        });
}

function handleAddCourse(e) {
    e.preventDefault();
    const title = document.getElementById('cTitle').value;
    const instructor = document.getElementById('cInstructor').value;
    const category = document.getElementById('cCategory').value;
    const duration = document.getElementById('cDuration').value;
    const description = document.getElementById('cDesc').value;
    const msg = document.getElementById('addMessage');

    fetch('/api/courses/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, instructor, category, duration, description })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                msg.style.color = 'green';
                msg.textContent = data.message;
                e.target.reset(); // Clear form
            } else {
                msg.style.color = 'red';
                msg.textContent = data.message;
            }
        });
}

function handleContact(e) {
    e.preventDefault();
    const name = document.getElementById('cntName').value;
    const email = document.getElementById('cntEmail').value;
    const subject = document.getElementById('cntSubject').value;
    const message = document.getElementById('cntMessage').value;
    const msg = document.getElementById('contactMessage');

    fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                msg.style.color = 'green';
                msg.textContent = data.message;
                e.target.reset();
            } else {
                msg.style.color = 'red';
                msg.textContent = data.message;
            }
        });
}

function handleForgotPassword(e) {
    e.preventDefault();
    const roll = document.getElementById('roll_no').value;
    const reveal = document.getElementById('passwordReveal');

    if (!roll) {
        alert('Please enter your Roll Number first.');
        return;
    }

    fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roll_no: roll })
    })
        .then(res => res.json())
        .then(data => {
            reveal.style.display = 'block';
            if (data.success) {
                reveal.textContent = 'Your Password: ' + data.password;
            } else {
                reveal.textContent = data.message;
            }
        });
}

// Data Loading
function loadCourses() {
    const search = document.getElementById('searchInput').value;
    const category = document.getElementById('categoryFilter').value;
    const grid = document.getElementById('courseGrid');

    if (!grid) return;

    let url = `/api/courses?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`;

    fetch(url)
        .then(res => res.json())
        .then(courses => {
            grid.innerHTML = '';
            if (courses.length === 0) {
                grid.innerHTML = '<p>No courses found.</p>';
                return;
            }
            courses.forEach(course => {
                const card = document.createElement('div');
                card.className = 'course-card card';
                card.innerHTML = `
                    <h3>${course.title}</h3>
                    <div class="course-meta">
                        <span>${course.instructor}</span>
                        <span>${course.duration}</span>
                    </div>
                    <p class="course-desc">${course.description}</p>
                    <a href="course_detail.html?id=${course.id}" class="btn">View Details</a>
                `;
                grid.appendChild(card);
            });
        });
}

function loadCourseDetail(id) {
    const detailContainer = document.getElementById('courseDetail');
    fetch(`/api/courses/${id}`)
        .then(res => res.json())
        .then(course => {
            if (course.error) {
                detailContainer.innerHTML = `<p>${course.error}</p>`;
                return;
            }

            let btnHtml = '';
            if (course.isEnrolled) {
                btnHtml = `<button class="btn btn-secondary" disabled>Enrolled</button>`;
            } else {
                btnHtml = `<button class="btn" onclick="enrollCourse(${course.id})">Enroll Now</button>`;
            }

            // Check if completed
            let progress = JSON.parse(localStorage.getItem('completedCourses') || '[]');
            let completeBtn = '';
            if (progress.includes(String(course.id))) {
                completeBtn = `<button class="btn btn-secondary" disabled style="margin-left: 10px;">Completed</button>`;
            } else {
                completeBtn = `<button class="btn" style="margin-left: 10px; background-color: #f59e0b;" onclick="markCompleted(${course.id}, '${course.title}')">Mark as Completed</button>`;
            }

            detailContainer.innerHTML = `
                <h1 style="color: var(--primary-color);">${course.title}</h1>
                <h3 style="color: var(--text-muted);">${course.instructor} | ${course.category}</h3>
                <div style="margin: 1rem 0; font-weight: bold;">
                    Duration: ${course.duration} &nbsp;&bull;&nbsp; 
                    <span style="color: var(--secondary-color);">
                        ${course.enrolledCount} Students Enrolled
                    </span>
                </div>
                <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 1rem 0;">
                <p style="margin-bottom: 2rem;">${course.description}</p>
                ${btnHtml}
                ${completeBtn}
                <div id="enrollMsg" style="margin-top: 1rem;"></div>
            `;
        });
}

function enrollCourse(id) {
    fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Successfully Enrolled!');
                location.reload();
            } else {
                alert(data.message);
            }
        });
}

function markCompleted(id, title) {
    let progress = JSON.parse(localStorage.getItem('completedCourses') || '[]');
    let progressDetails = JSON.parse(localStorage.getItem('completedCoursesDetails') || '[]'); // Store details to show on progress page easily without re-fetching

    if (!progress.includes(String(id))) {
        progress.push(String(id));
        progressDetails.push({ id, title, date: new Date().toDateString() });

        localStorage.setItem('completedCourses', JSON.stringify(progress));
        localStorage.setItem('completedCoursesDetails', JSON.stringify(progressDetails));

        alert('Course marked as Completed!');
        location.reload();
    }
}

function loadProgress() {
    const container = document.getElementById('progressContainer');
    if (!container) return;

    let progressDetails = JSON.parse(localStorage.getItem('completedCoursesDetails') || '[]');

    if (progressDetails.length === 0) {
        container.innerHTML = '<p>You have not completed any courses yet.</p>';
        return;
    }

    container.innerHTML = '';
    progressDetails.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${item.title}</h3>
            <p style="color: var(--secondary-color); font-weight: bold;">Completed</p>
            <p style="font-size: 0.8rem; color: var(--text-muted);">On ${item.date}</p>
            <a href="course_detail.html?id=${item.id}" class="btn" style="margin-top: 1rem; font-size: 0.8rem;">Review Course</a>
        `;
        container.appendChild(card);
    });
}

// Motivational Quote
function loadQuote() {
    const box = document.getElementById('quoteBox');
    if (!box) return;

    // Using a reliable public API: quotable.io
    fetch('https://api.quotable.io/random?tags=inspirational')
        .then(res => res.json())
        .then(data => {
            box.innerHTML = `"${data.content}" — ${data.author}`;
        })
        .catch(err => {
            // Fallback quote if API fails
            box.innerHTML = `"The beautiful thing about learning is that nobody can take it away from you." — B.B. King`;
        });
}
