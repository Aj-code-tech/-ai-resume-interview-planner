import { useState } from "react"
import { Link } from "react-router-dom"
import "../auth.form.scss"
import { requestPasswordReset } from "../services/auth.api"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      const response = await requestPasswordReset({ email: email.trim() })
      setMessage(response.message)
    } catch (err) {
      setError(err.response?.data?.message || "Unable to request a password reset right now.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="form-container">
        <h1>Forgot password</h1>
        <p>Enter your account email and we’ll send you a password reset link.</p>

        {error && <div className="auth-error" role="alert">{error}</div>}
        {message && <p role="status">{message}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              name="email"
              id="email"
              placeholder="Enter email address"
              autoComplete="email"
              required
            />
          </div>

          <button disabled={loading} className="button primary-button">
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p><Link to="/login">Back to login</Link></p>
      </div>
    </main>
  )
}

export default ForgotPassword
