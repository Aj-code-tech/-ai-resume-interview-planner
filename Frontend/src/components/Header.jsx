import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import './header.scss'

const Header = () => {
    const { user, loading, handleLogout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const onLogoutClick = async () => {
        await handleLogout()
        navigate('/')
    }

    return (
        <header className="app-header">
            <div className="header-container">
                {/* Brand Logo */}
                <Link to="/" className="brand-logo">
                    <span className="brand-logo__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                            <path d="M12 18v-6" />
                            <path d="m9 15 3 3 3-3" />
                        </svg>
                    </span>
                    <span className="brand-logo__text">
                        GenAI <span className="highlight">Resume</span>
                    </span>
                </Link>

                {/* Navigation Options */}
                <nav className="header-nav">
                    {loading ? (
                        <div style={{ width: '150px', height: '36px' }} />
                    ) : user ? (
                        <>
                            <div className="user-chip">
                                <span className="user-chip__avatar">
                                    {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                                </span>
                                <span className="user-chip__name">
                                    {user.username || user.email}
                                </span>
                            </div>
                            <button
                                onClick={onLogoutClick}
                                className="header-btn header-btn--ghost"
                                title="Sign out"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={`header-btn header-btn--outline ${location.pathname === '/login' ? 'active' : ''}`}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className={`header-btn header-btn--primary ${location.pathname === '/register' ? 'active' : ''}`}
                            >
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}

export default Header

