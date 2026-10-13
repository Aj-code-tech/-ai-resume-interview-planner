import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import "../auth.form.scss"
import { resetPassword } from "../services/auth.api"

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const response = await resetPassword({ token, newPassword })
      setMessage(response.message)
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password right now.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="form-container">
        <h1>Reset password</h1>

        {error && <div className="auth-error" role="alert">{error}</div>}
        {message && <p role="status">{message}</p>}

        {token ? (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="new-password">New password</label>
              <input
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                type="password"
                id="new-password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirm-password">Confirm new password</label>
              <input
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                id="confirm-password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <button disabled={loading || Boolean(message)} className="button primary-button">
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>
        ) : (
          <p>This password reset link is invalid. Please request a new one.</p>
        )}

        <p><Link to="/login">Back to login</Link></p>
      </div>
    </main>
  )
}

export default ResetPassword
