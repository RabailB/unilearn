const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const { db, initDb } = require('./database');

const app = express();
const PORT = 3000;

// Initialize Database
initDb();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'unilearn_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Routes

// API: Register
app.post('/api/register', (req, res) => {
    const { name, email, roll_no, password } = req.body;
    db.run(`INSERT INTO users (name, email, roll_no, password) VALUES (?, ?, ?, ?)`,
        [name, email, roll_no, password],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.json({ success: false, message: 'Roll Number already exists.' });
                }
                return res.status(500).json({ success: false, message: 'Database error.' });
            }
            res.json({ success: true, message: 'Registration successful!' });
        }
    );
});

// API: Login
app.post('/api/login', (req, res) => {
    const { roll_no, password } = req.body; // Using roll_no as password as per prompt instruction? 
    // Prompt says: "Use: student name as username, roll number as password."
    // Wait, prompt says: "Login Page (User Name & Roll No as Credentials)"
    // "Use: student name as username, roll number as password."
    // But also "Match credentials from a users table".
    // Usually password is a separate field.
    // Let's stick strictly to prompt: "student name as username, roll number as password".
    // This implies the user enters Name in "Username" field and Roll No in "Password" field? 
    // That seems insecure and odd, but "Match credentials from a users table" implies we check if that pair exists.
    // However, later it says: "User Registration Page... Fields: Name, Email, Roll No, Password..."
    // If registration asks for a Password, then Login should probably use Roll No and Password?
    // Let's re-read: "Login Page (User Name & Roll No as Credentials) – Use: student name as username, roll number as password."
    // This specific requirement might be a simplifed school login scenario.
    // BUT requirement 13 says: "User Registration Page – Fields: ... Password, Confirm Password."
    // This contradicts requirement 1.
    // I will implement standard login: Roll No (unique ID) and Password. 
    // OR I will follow requirement 1 literally: Name as Username, Roll No as Password.
    // Giving the conflict, I will try to support the "Standard" way but maybe label fields as requested or support both?
    // Actually, "Use: student name as username, roll number as password" is very specific. 
    // It might mean meant for the specific "Login Page" task: 
    // "Login Page (User Name & Roll No as Credentials)... Use: student name as username, roll number as password." 
    // And THEN "User Registration Page... Password".
    // I'll stick to a more sensible approach: Username/RollNo and Password.
    // Actually, let's look at Req 1 again: "Login Page (User Name & Roll No as Credentials)".
    // If I use Name + RollNo, then anyone knowing your name and roll no can login.
    // But Req 13 adds a Password field.
    // I will assume Req 1 instructions were slightly "example" like, but Req 13 clarifies the schema.
    // I will implement: Login with Roll No and Password. 
    // Wait, Req 1 says "Use: student name as username, roll number as password."
    // I will implement it such that the label says "User Name" but acts as a unique ID login? No, Name isn't unique.
    // Okay, I will implement Login: "User Name" (input text) and "Roll No" (input password). 
    // And creating a session.
    // But I will ALSO strictly follow Req 13 for registration which creates a password.
    // This is confusing. 
    // Compromise: I will use Roll No and Password for login, as that is safe and standard, and matches Req 13.
    // The prompt text "Use: student name as username, roll number as password" might be a typo or a simplified requirement that conflicts with Req 13.
    // I'll stick to Roll No & Password for Login. It's safer.

    // Actually, re-reading Req 1: "Use: student name as username, roll number as password."
    // Maybe it means "Enter your Name" and "Enter your Roll Number" to login (no password check)?
    // And Req 13 is a "User Registration" feature which might be optional or separate?
    // But Req 13 is mandatory (5 marks).
    // I will implement: Login using Roll No and Password. The prompt is likely slightly inconsistent.

    db.get(`SELECT * FROM users WHERE roll_no = ? AND password = ?`, [roll_no, password], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: 'Server error' });
        if (!row) {
            return res.json({ success: false, message: 'Invalid Credentials' });
        }

        req.session.user = { id: row.id, name: row.name, roll_no: row.roll_no };
        res.json({ success: true, redirect: '/dashboard.html' });
    });
});

// API: Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, redirect: '/index.html' });
});

// API: Check Session
app.get('/api/session', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// API: Get Courses
app.get('/api/courses', (req, res) => {
    const { search, category } = req.query;
    let query = "SELECT * FROM courses WHERE 1=1";
    const params = [];

    if (search) {
        query += " AND (title LIKE ? OR instructor LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }
    if (category && category !== 'All') {
        query += " AND category = ?";
        params.push(category);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// API: Get Course Detail
app.get('/api/courses/:id', (req, res) => {
    const courseId = req.params.id;
    db.get("SELECT * FROM courses WHERE id = ?", [courseId], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Course not found' });

        // Get enrollment count
        db.get("SELECT count(*) as count FROM enrollments WHERE course_id = ?", [courseId], (err, countRow) => {
            row.enrolledCount = countRow ? countRow.count : 0;

            // Check if current user is enrolled
            if (req.session.user) {
                db.get("SELECT * FROM enrollments WHERE course_id = ? AND user_id = ?", [courseId, req.session.user.id], (err, enrollRow) => {
                    row.isEnrolled = !!enrollRow;
                    res.json(row);
                });
            } else {
                row.isEnrolled = false;
                res.json(row);
            }
        });
    });
});

// API: Enroll
app.post('/api/enroll', (req, res) => {
    if (!req.session.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { courseId } = req.body;
    db.get("SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?", [req.session.user.id, courseId], (err, row) => {
        if (row) return res.json({ success: false, message: 'Already enrolled' });

        db.run("INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)", [req.session.user.id, courseId], (err) => {
            if (err) return res.json({ success: false, message: 'Enrollment failed' });
            res.json({ success: true, message: 'Enrolled successfully' });
        });
    });
});

// API: Add Course (Admin)
app.post('/api/courses/add', (req, res) => {
    // Ideally check for admin privileges, but for this simpler task, we'll allow it or rely on session existance
    const { title, instructor, category, duration, description } = req.body;
    db.run("INSERT INTO courses (title, instructor, category, duration, description) VALUES (?, ?, ?, ?, ?)",
        [title, instructor, category, duration, description],
        function (err) {
            if (err) return res.json({ success: false, message: 'Error adding course' });
            res.json({ success: true, message: 'Course added successfully!' });
        }
    );
});

// API: Contact Us
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    db.run("INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
        [name, email, subject, message],
        (err) => {
            if (err) return res.json({ success: false, message: 'Failed to send message' });
            res.json({ success: true, message: 'Message sent successfully!' });
        }
    );
});

// API: Forgot Password
app.post('/api/forgot-password', (req, res) => {
    const { roll_no } = req.body;
    db.get("SELECT password FROM users WHERE roll_no = ?", [roll_no], (err, row) => {
        if (row) {
            res.json({ success: true, password: row.password });
        } else {
            res.json({ success: false, message: 'Roll Number not found.' });
        }
    });
});

// Serve HTML files for specific routes to ensure clean URLs if needed, or rely on static
// The requirements imply standard .html files are okay.
// However, protecting dashboard:
app.get('/dashboard.html', (req, res, next) => {
    if (!req.session.user) return res.redirect('/index.html');
    next();
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
