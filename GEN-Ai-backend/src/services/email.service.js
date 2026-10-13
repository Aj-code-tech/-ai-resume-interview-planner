const nodemailer = require("nodemailer")

async function sendPasswordResetEmail({ email, resetUrl }) {
    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT || 587)
    const from = process.env.SMTP_FROM
    const username = process.env.SMTP_USER
    const password = process.env.SMTP_PASSWORD

    if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !from) {
        throw new Error("SMTP_HOST, a valid SMTP_PORT, and SMTP_FROM must be configured")
    }

    if ((username && !password) || (!username && password)) {
        throw new Error("Both SMTP_USER and SMTP_PASSWORD must be configured together")
    }

    const transportOptions = {
        host,
        port,
        secure: process.env.SMTP_SECURE
            ? process.env.SMTP_SECURE.toLowerCase() === "true"
            : port === 465
    }

    if (username && password) {
        transportOptions.auth = { user: username, pass: password }
    }

    const transporter = nodemailer.createTransport(transportOptions)
    const safeResetUrl = resetUrl.replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character])

    await transporter.sendMail({
        from,
        to: email,
        subject: "Reset your password",
        text: `Use this link to reset your password. It expires in 30 minutes:\n\n${resetUrl}\n\nIf you did not request a password reset, you can ignore this email.`,
        html: `<p>We received a request to reset your password.</p><p><a href="${safeResetUrl}">Reset your password</a></p><p>This link expires in 30 minutes. If you did not request a password reset, you can ignore this email.</p>`
    })
}

module.exports = { sendPasswordResetEmail }
