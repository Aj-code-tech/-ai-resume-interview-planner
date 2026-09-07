const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Trust reverse proxy for HTTPS cookies on Render
app.set("trust proxy", 1);

// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());
app.use(cookieParser());

// ===============================
// CORS CONFIGURATION
// ===============================

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://gen-ai-resume-frontend-4wes.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4173"
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests without Origin
        // (Postman, direct browser requests, etc.)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ]
};

// Apply CORS
app.use(cors(corsOptions));

// Explicitly handle CORS preflight requests
app.options(/.*/, cors(corsOptions));

// ===============================
// HEALTH CHECK
// ===============================

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString()
    });
});

// ===============================
// ROUTES
// ===============================

const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

// ===============================
// EXPORT APP
// ===============================

module.exports = app;