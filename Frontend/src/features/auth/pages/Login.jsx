import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {

  const { loading, handleLogin } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password")
      return
    }

    const res = await handleLogin({ email, password })
    if (res?.success) {
      navigate('/')
    } else {
      setError(res?.message || "Invalid credentials")
    }
  }

  return (
    <div>
      <main>
        <div className="form-container">
          <h1>Login</h1>

          {error && (
            <div className="auth-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError("") }}
                type="email"
                name="email"
                id="email"
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError("") }}
                type="password"
                name="password"
                id="password"
                placeholder="Enter password"
                required
              />
            </div>

            <button disabled={loading} className='button primary-button'>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p>Don't Registered yet ? <Link to={"/register"}>Register</Link></p>
        </div>
      </main>
    </div>
  )
}

export default Login
