const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Persistent local JSON file fallback database path
const LOCAL_DB_PATH = path.join(__dirname, "db_storage.json");

// Helper to hash passwords securely
function hashPassword(password) {
    return crypto.createHash("sha256").update(password + "SCC_SALT_2026").digest("hex");
}

// Initial default seed state for local fallback DB
const defaultInitialState = {
    users: [
        {
            id: "student-demo-uuid-1",
            email: "alex.student@campus.edu",
            password: hashPassword("password123"),
            full_name: "Alex Rivera",
            role: "student",
            register_number: "21CS042",
            department: "Computer Science & Engineering",
            year: "4th Year",
            section: "A",
            phone: "+1 555-0192",
            dob: "2003-05-14",
            college_name: "Smart Campus University"
        },
        {
            id: "student-demo-uuid-2",
            email: "sarah.student@campus.edu",
            password: hashPassword("password123"),
            full_name: "Sarah Chen",
            role: "student",
            register_number: "21CS088",
            department: "Computer Science & Engineering",
            year: "4th Year",
            section: "B",
            phone: "+1 555-0193",
            dob: "2003-08-22",
            college_name: "Smart Campus University"
        },
        {
            id: "admin-demo-uuid-1",
            email: "admin@campus.edu",
            password: hashPassword("admin123"),
            full_name: "Dean Robert Harrison",
            role: "admin",
            department: "Computer Science & Engineering",
            college_name: "Smart Campus University"
        }
    ],
    attendance: [
        { id: "att-1", student_id: "student-demo-uuid-1", subject_id: "subj-1", subject_name: "Database Management Systems", subject_code: "CS8551", present_days: 26, total_days: 30, last_updated: new Date().toISOString() },
        { id: "att-2", student_id: "student-demo-uuid-1", subject_id: "subj-2", subject_name: "Computer Networks", subject_code: "CS8591", present_days: 28, total_days: 30, last_updated: new Date().toISOString() },
        { id: "att-3", student_id: "student-demo-uuid-1", subject_id: "subj-3", subject_name: "Artificial Intelligence & ML", subject_code: "CS8601", present_days: 22, total_days: 30, last_updated: new Date().toISOString() },
        { id: "att-4", student_id: "student-demo-uuid-1", subject_id: "subj-4", subject_name: "Operating Systems", subject_code: "CS8651", present_days: 27, total_days: 30, last_updated: new Date().toISOString() },
        { id: "att-5", student_id: "student-demo-uuid-1", subject_id: "subj-5", subject_name: "Software Engineering & Agile", subject_code: "CS8691", present_days: 29, total_days: 30, last_updated: new Date().toISOString() },
        { id: "att-6", student_id: "student-demo-uuid-2", subject_id: "subj-1", subject_name: "Database Management Systems", subject_code: "CS8551", present_days: 20, total_days: 30, last_updated: new Date().toISOString() },
        { id: "att-7", student_id: "student-demo-uuid-2", subject_id: "subj-2", subject_name: "Computer Networks", subject_code: "CS8591", present_days: 24, total_days: 30, last_updated: new Date().toISOString() },
        { id: "att-8", student_id: "student-demo-uuid-2", subject_id: "subj-3", subject_name: "Artificial Intelligence & ML", subject_code: "CS8601", present_days: 25, total_days: 30, last_updated: new Date().toISOString() }
    ],
    subjects: [
        { id: "subj-1", code: "CS8551", name: "Database Management Systems", department: "Computer Science & Engineering", year: "4th Year", credits: 4, faculty_name: "Prof. Alan Turing" },
        { id: "subj-2", code: "CS8591", name: "Computer Networks", department: "Computer Science & Engineering", year: "4th Year", credits: 3, faculty_name: "Dr. Radia Perlman" },
        { id: "subj-3", code: "CS8601", name: "Artificial Intelligence & ML", department: "Computer Science & Engineering", year: "4th Year", credits: 4, faculty_name: "Prof. Geoffrey Hinton" },
        { id: "subj-4", code: "CS8651", name: "Operating Systems", department: "Computer Science & Engineering", year: "4th Year", credits: 3, faculty_name: "Dr. Linus Torvalds" },
        { id: "subj-5", code: "CS8691", name: "Software Engineering & Agile", department: "Computer Science & Engineering", year: "4th Year", credits: 3, faculty_name: "Prof. Margaret Hamilton" }
    ],
    timetable: [],
    assignments: [],
    submissions: [],
    exams: [],
    results: [],
    materials: [],
    events: [],
    announcements: [],
    notifications: []
};

// Initialize file storage if missing
if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(defaultInitialState, null, 2));
}

function readStorage() {
    try {
        const raw = fs.readFileSync(LOCAL_DB_PATH, "utf8");
        return JSON.parse(raw);
    } catch {
        return defaultInitialState;
    }
}

function writeStorage(data) {
    try {
        fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error writing to persistent JSON DB:", e);
    }
}

// Default attendance generator for newly registered students
function initStudentAttendance(studentId, department = "Computer Science & Engineering", year = "4th Year") {
    const store = readStorage();
    const existing = store.attendance.filter(a => a.student_id === studentId);
    if (existing.length > 0) return existing;

    const departmentSubjects = store.subjects.filter(s => s.department === department || s.department === "Computer Science & Engineering");
    const newAttendanceRecords = departmentSubjects.map((subj, i) => ({
        id: "att-" + Date.now() + "-" + i,
        student_id: studentId,
        subject_id: subj.id,
        subject_name: subj.name,
        subject_code: subj.code,
        present_days: 24 + (i % 5),
        total_days: 30,
        last_updated: new Date().toISOString()
    }));

    store.attendance.push(...newAttendanceRecords);
    writeStorage(store);
    return newAttendanceRecords;
}

// Healthcheck
app.get("/", (req, res) => {
    res.json({
        message: "Smart Campus Companion API is running",
        database: "Connected (Persistent Engine)"
    });
});

// AUTH REGISTRATION API
app.post("/api/auth/register", (req, res) => {
    try {
        const { full_name, email, password, role, register_number, department, year, section, phone, dob, college_name } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({ message: "Full name, email, and password are required." });
        }

        const userRole = role || "student";
        if (userRole === "student" && !register_number) {
            return res.status(400).json({ message: "Register number is required for student registration." });
        }

        const store = readStorage();

        // Prevent duplicate email
        const existingEmail = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingEmail) {
            return res.status(400).json({ message: "An account with this email address already exists." });
        }

        // Prevent duplicate register number for students
        if (userRole === "student" && register_number) {
            const existingReg = store.users.find(u => u.role === "student" && u.register_number && u.register_number.toUpperCase() === register_number.toUpperCase());
            if (existingReg) {
                return res.status(400).json({ message: "A student with this Register Number already exists." });
            }
        }

        const newUserId = (userRole === "admin" ? "admin-" : "student-") + Date.now();
        const newUser = {
            id: newUserId,
            email: email.toLowerCase().trim(),
            password: hashPassword(password),
            full_name: full_name.trim(),
            role: userRole,
            register_number: userRole === "student" ? register_number.trim().toUpperCase() : undefined,
            department: department || "Computer Science & Engineering",
            year: year || "4th Year",
            section: section || "A",
            phone: phone || "",
            dob: dob || "",
            college_name: college_name || "Smart Campus University",
            created_at: new Date().toISOString()
        };

        store.users.push(newUser);
        writeStorage(store);

        // Initialize subject attendance records for student
        if (userRole === "student") {
            initStudentAttendance(newUserId, newUser.department, newUser.year);
        }

        // Return user profile without password hash
        const { password: _, ...userProfile } = newUser;
        res.status(201).json({ user: userProfile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Registration failed: " + err.message });
    }
});

// AUTH LOGIN API
app.post("/api/auth/login", (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const store = readStorage();
        const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

        if (!user) {
            return res.status(401).json({ message: "Account not found. Please check your email or register a new account." });
        }

        if (role && user.role !== role) {
            return res.status(403).json({ message: `Access denied. This account is registered as ${user.role}, not ${role}.` });
        }

        // Validate password if provided
        if (password && user.password) {
            const hashedInput = hashPassword(password);
            if (hashedInput !== user.password) {
                return res.status(401).json({ message: "Incorrect password. Please try again." });
            }
        }

        const { password: _, ...userProfile } = user;
        res.json({ user: userProfile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login failed: " + err.message });
    }
});

// GET PROFILE BY ID
app.get("/api/profiles/:id", (req, res) => {
    const store = readStorage();
    const user = store.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, ...userProfile } = user;
    res.json(userProfile);
});

// UPDATE PROFILE
app.put("/api/profiles/:id", (req, res) => {
    const store = readStorage();
    const idx = store.users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "User not found" });

    const updates = req.body;
    delete updates.password; // Do not allow updating password via profile route
    store.users[idx] = { ...store.users[idx], ...updates, updated_at: new Date().toISOString() };
    writeStorage(store);

    const { password, ...userProfile } = store.users[idx];
    res.json(userProfile);
});

// STUDENTS LIST API
app.get("/api/students", (req, res) => {
    const store = readStorage();
    const safeUsers = store.users.map(({ password, ...u }) => u);
    res.json(safeUsers);
});

// ATTENDANCE API GET BY STUDENT ID
app.get("/api/attendance/:studentId", (req, res) => {
    try {
        const studentId = req.params.studentId;
        const store = readStorage();
        let records = store.attendance.filter(a => a.student_id === studentId);

        // If no attendance records exist yet for this student, initialize default subject attendance
        if (records.length === 0) {
            const student = store.users.find(u => u.id === studentId);
            records = initStudentAttendance(studentId, student?.department, student?.year);
        }

        res.json(records);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch attendance: " + err.message });
    }
});

// ATTENDANCE UPDATE / INSERT API
app.post("/api/attendance", (req, res) => {
    try {
        const { student_id, subject_id, present_days, total_days } = req.body;
        if (!student_id || !subject_id) {
            return res.status(400).json({ message: "student_id and subject_id are required." });
        }

        const store = readStorage();
        const subject = store.subjects.find(s => s.id === subject_id);
        const idx = store.attendance.findIndex(a => a.student_id === student_id && a.subject_id === subject_id);

        let updatedRecord;
        if (idx !== -1) {
            store.attendance[idx] = {
                ...store.attendance[idx],
                present_days: Number(presentDays),
                total_days: Number(totalDays),
                last_updated: new Date().toISOString()
            };
            updatedRecord = store.attendance[idx];
        } else {
            updatedRecord = {
                id: "att-" + Date.now(),
                student_id,
                subject_id,
                subject_name: subject?.name || "Subject",
                subject_code: subject?.code || "SUBJ",
                present_days: Number(presentDays),
                total_days: Number(totalDays),
                last_updated: new Date().toISOString()
            };
            store.attendance.push(updatedRecord);
        }

        writeStorage(store);
        res.json(updatedRecord);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update attendance: " + err.message });
    }
});

// TIMETABLE API
app.get("/api/timetable", (req, res) => {
    const store = readStorage();
    const { department, year } = req.query;
    let list = store.timetable;
    if (department && department !== "All") list = list.filter(t => t.department === department);
    if (year && year !== "All") list = list.filter(t => t.year === year);
    res.json(list);
});

app.post("/api/timetable", (req, res) => {
    const store = readStorage();
    const newSlot = { ...req.body, id: "tt-" + Date.now() };
    store.timetable.push(newSlot);
    writeStorage(store);
    res.status(201).json(newSlot);
});

// ASSIGNMENTS API
app.get("/api/assignments", (req, res) => {
    const store = readStorage();
    const { department, year } = req.query;
    let list = store.assignments;
    if (department && department !== "All") list = list.filter(a => a.department === department || a.department === "All");
    if (year && year !== "All") list = list.filter(a => a.year === year || a.year === "All");
    res.json(list);
});

app.post("/api/assignments", (req, res) => {
    const store = readStorage();
    const newAsg = { ...req.body, id: "asg-" + Date.now(), created_at: new Date().toISOString() };
    store.assignments.push(newAsg);
    writeStorage(store);
    res.status(201).json(newAsg);
});

// SUBMISSIONS API
app.get("/api/submissions/:studentId", (req, res) => {
    const store = readStorage();
    const list = store.submissions.filter(s => s.student_id === req.params.studentId);
    res.json(list);
});

app.post("/api/submissions", (req, res) => {
    const store = readStorage();
    const sub = { ...req.body, id: "sub-" + Date.now(), submitted_at: new Date().toISOString() };
    store.submissions.push(sub);
    writeStorage(store);
    res.status(201).json(sub);
});

// EXAMS API
app.get("/api/exams", (req, res) => {
    const store = readStorage();
    const { department, year } = req.query;
    let list = store.exams;
    if (department && department !== "All") list = list.filter(e => e.department === department || e.department === "All");
    if (year && year !== "All") list = list.filter(e => e.year === year || e.year === "All");
    res.json(list);
});

app.post("/api/exams", (req, res) => {
    const store = readStorage();
    const newExam = { ...req.body, id: "exam-" + Date.now(), created_at: new Date().toISOString() };
    store.exams.push(newExam);
    writeStorage(store);
    res.status(201).json(newExam);
});

// RESULTS API
app.get("/api/results/:studentId", (req, res) => {
    const store = readStorage();
    const list = store.results.filter(r => r.student_id === req.params.studentId);
    res.json(list);
});

// MATERIALS API
app.get("/api/materials", (req, res) => {
    const store = readStorage();
    res.json(store.materials);
});

// EVENTS API
app.get("/api/events", (req, res) => {
    const store = readStorage();
    res.json(store.events);
});

// NOTIFICATIONS API
app.get("/api/notifications", (req, res) => {
    const store = readStorage();
    const { userId } = req.query;
    const list = store.notifications.filter(n => !n.user_id || n.user_id === userId);
    res.json(list);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});