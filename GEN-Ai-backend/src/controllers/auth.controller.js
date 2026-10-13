const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const tokenBlacklistModel = require("../models/blacklist.model")
const { sendPasswordResetEmail } = require("../services/email.service")

const isProduction = process.env.NODE_ENV === "production"

const getCookieOptions = () => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
})

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            })
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [ { username }, { email } ]
        })

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists with this email address or username"
            })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username,
            email,
            password: hash
        })

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, getCookieOptions())

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        console.error("Register error:", err)
        return res.status(500).json({
            message: err.message || "Registration failed"
        })
    }
}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            })
        }

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "User does not exist"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Wrong password"
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, getCookieOptions())
        return res.status(200).json({
            message: "User loggedIn successfully.",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        console.error("Login error:", err)
        return res.status(500).json({
            message: err.message || "Login failed"
        })
    }
}

/**
 * @name forgotPasswordController
 * @description send a single-use password reset link to the user's email
 * @access Public
 */
async function forgotPasswordController(req, res) {
    try {
        const email = typeof req.body?.email === "string" ? req.body.email.trim() : ""

        if (!email) {
            return res.status(400).json({
                message: "Please provide an email address"
            })
        }

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(200).json({
                message: "If an account exists for this email, a password reset link has been sent."
            })
        }

        const resetToken = crypto.randomBytes(32).toString("hex")
        const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")
        const resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000)

        await userModel.updateOne(
            { _id: user._id },
            { $set: { resetPasswordToken: hashedResetToken, resetPasswordExpires } }
        )

        try {
            const frontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL
            if (!frontendUrl) {
                throw new Error("CLIENT_URL or FRONTEND_URL must be configured to send password reset links")
            }

            const resetUrl = `${frontendUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(resetToken)}`
            await sendPasswordResetEmail({ email: user.email, resetUrl })
        } catch (err) {
            await userModel.updateOne(
                { _id: user._id, resetPasswordToken: hashedResetToken },
                { $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 } }
            )
            throw err
        }

        return res.status(200).json({
            message: "If an account exists for this email, a password reset link has been sent."
        })
    } catch (err) {
        console.error("Forgot password error:", err)
        return res.status(500).json({
            message: "Unable to send a password reset email right now. Please try again later."
        })
    }
}

/**
 * @name resetPasswordController
 * @description replace the user's password using a valid, unexpired reset token
 * @access Public
 */
async function resetPasswordController(req, res) {
    try {
        const { token, newPassword } = req.body || {}

        if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
            return res.status(400).json({
                message: "Invalid or expired password reset link"
            })
        }

        if (typeof newPassword !== "string" || newPassword.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            })
        }

        const hashedResetToken = crypto.createHash("sha256").update(token).digest("hex")
        const password = await bcrypt.hash(newPassword, 10)
        const result = await userModel.updateOne(
            {
                resetPasswordToken: hashedResetToken,
                resetPasswordExpires: { $gt: new Date() }
            },
            {
                $set: { password },
                $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 }
            }
        )

        if (result.modifiedCount !== 1) {
            return res.status(400).json({
                message: "Invalid or expired password reset link"
            })
        }

        return res.status(200).json({
            message: "Password reset successfully. You can now log in with your new password."
        })
    } catch (err) {
        console.error("Reset password error:", err)
        return res.status(500).json({
            message: "Unable to reset password right now. Please try again later."
        })
    }
}


/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token || req.headers.authorization?.replace("Bearer ", "")

        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
        })

        return res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (err) {
        console.error("Logout error:", err)
        return res.status(500).json({
            message: err.message || "Logout failed"
        })
    }
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id)

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        return res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        console.error("GetMe error:", err)
        return res.status(500).json({
            message: err.message || "Failed to fetch user details"
        })
    }
}



module.exports = {
    registerUserController,
    loginUserController,
    forgotPasswordController,
    resetPasswordController,
    logoutUserController,
    getMeController
}