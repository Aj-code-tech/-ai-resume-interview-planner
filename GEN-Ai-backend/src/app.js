const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require("cors")

const app = express()

// Trust reverse proxy for HTTPS cookie transmission on Render/cloud platforms
app.set("trust proxy", 1)

app.use(express.json())
app.use(cookieParser())

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4173"
].filter(Boolean)

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true)
        if (
            allowedOrigins.includes(origin) ||
            origin.endsWith(".onrender.com") ||
            origin.endsWith(".vercel.app")
        ) {
            return callback(null, true)
        }
        return callback(null, true)
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}))

// Health check endpoint for Render
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() })
})

/*require all the routes here*/
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/*using  all the routes here*/
app.use("/api/auth" , authRouter)
app.use("/api/interview" , interviewRouter)



module.exports = app

