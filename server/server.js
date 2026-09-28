const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mysql = require("mysql2/promise");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
});

// MySQL connection test
app.get("/", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS connected");

        res.json({
            message: "Smart Campus Companion API is running",
            mysql: rows[0].connected === 1 ? "Connected" : "Not connected"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "MySQL connection failed",
            error: error.message
        });
    }
});

// Students API
app.get("/api/students", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM students");

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch students",
            details: error.message
        });
    }
});
// Attendance API
app.get("/api/attendance/:studentId", async (req, res) => {
    try {
        const studentId = req.params.studentId;

        const [rows] = await db.query(
            "SELECT * FROM attendance WHERE student_id = ?",
            [studentId]
        );

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch attendance",
            details: error.message
        });
    }
});
// Timetable API
app.get("/api/timetable", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM timetable ORDER BY day, period"
        );

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch timetable",
            details: error.message
        });
    }
});
// Assignments API
app.get("/api/assignments", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM assignments ORDER BY due_date"
        );

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch assignments",
            details: error.message
        });
    }
});
// Exams API
app.get("/api/exams", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM exams ORDER BY exam_date"
        );

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch exams",
            details: error.message
        });
    }
});
// Results API
app.get("/api/results/:studentId", async (req, res) => {
    try {
        const studentId = req.params.studentId;

        const [rows] = await db.query(
            "SELECT * FROM results WHERE student_id = ?",
            [studentId]
        );

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch results",
            details: error.message
        });
    }
});
// Materials API
app.get("/api/materials", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM materials ORDER BY uploaded_at DESC"
        );

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch materials",
            details: error.message
        });
    }
});
// Events API
app.get("/api/events", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM events ORDER BY event_date"
        );

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch events",
            details: error.message
        });
    }
});
// Notifications API
app.get("/api/notifications", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM notifications ORDER BY created_at DESC"
        );

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch notifications",
            details: error.message
        });
    }
});
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});