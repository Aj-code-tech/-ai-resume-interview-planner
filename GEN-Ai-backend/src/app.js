const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Trust reverse proxy for HTTPS cookies on Render/cloud platforms
app.set("trust proxy", 1);

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());


// ===============================
// CORS CONFIGURATION
// ===============================

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4173"
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {

        // Allow requests without an Origin
        // (Postman, server-to-server requests, etc.)
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

app.use(cors(corsOptions));


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