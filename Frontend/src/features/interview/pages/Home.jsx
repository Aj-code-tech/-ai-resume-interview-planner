import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { useNavigate } from 'react-router-dom'

const Home = () => {

    const { loading, generateReport, reports } = useInterview()
    const { user, loading: authLoading } = useAuth()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ resumeFile, setResumeFile ] = useState(null)
    const [ isDragging, setIsDragging ] = useState(false)
    const [ showAuthModal, setShowAuthModal ] = useState(false)
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    const requireAuth = () => {
        if (!user) {
            setShowAuthModal(true)
            return false
        }
        return true
    }

    const formatFileSize = (bytes) => {
        if (!bytes) return ''
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setResumeFile(file)
        }
    }

    const handleRemoveFile = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setResumeFile(null)
        if (resumeInputRef.current) {
            resumeInputRef.current.value = ""
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            setResumeFile(file)
        }
    }

    const handleGenerateReport = async () => {
        if (!requireAuth()) return
        const fileToUpload = resumeFile || (resumeInputRef.current?.files ? resumeInputRef.current.files[0] : null)
        if (!jobDescription || !jobDescription.trim()) {
            alert("Please provide the Target Job Description.")
            return
        }
        if (!fileToUpload && (!selfDescription || !selfDescription.trim())) {
            alert("Please upload a Resume or provide a Quick Self-Description.")
            return
        }
        const data = await generateReport({ jobDescription: jobDescription.trim(), selfDescription: selfDescription?.trim() || "", resumeFile: fileToUpload })
        if (data && data._id) {
            navigate(`/interview/${data._id}`)
        }
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Generating your interview plan...</h1>
            </main>
        )
    }

    return (
        <div className='home-page'>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => {
                                if (!requireAuth()) {
                                    e.target.blur()
                                    return
                                }
                                setJobDescription(e.target.value)
                            }}
                            onFocus={(e) => {
                                if (!requireAuth()) {
                                    e.target.blur()
                                }
                            }}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>{authLoading ? 'Your Profile' : user ? (user.username || user.email || 'Your Profile') : 'Your Profile'}</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>
                            <label
                                className={`dropzone ${resumeFile ? 'dropzone--uploaded' : ''} ${isDragging ? 'dropzone--dragging' : ''}`}
                                htmlFor={user ? 'resume' : undefined}
                                onClick={(e) => {
                                    if (!requireAuth()) {
                                        e.preventDefault()
                                        e.stopPropagation()
                                    }
                                }}
                                onDragOver={(e) => {
                                    if (!requireAuth()) {
                                        e.preventDefault()
                                        return
                                    }
                                    handleDragOver(e)
                                }}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => {
                                    if (!requireAuth()) {
                                        e.preventDefault()
                                        return
                                    }
                                    handleDrop(e)
                                }}
                            >
                                {resumeFile ? (
                                    <>
                                        <span className='dropzone__icon dropzone__icon--success'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                <polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                        </span>
                                        <p className='dropzone__success'>
                                            Resume uploaded successfully!
                                        </p>
                                        <div className='dropzone__file-info'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                            <span className='dropzone__file-name'>{resumeFile.name}</span>
                                            <span className='dropzone__file-size'>({formatFileSize(resumeFile.size)})</span>
                                        </div>
                                        <button
                                            type="button"
                                            className='dropzone__remove-btn'
                                            onClick={handleRemoveFile}
                                        >
                                            ✕ Remove / Change File
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className='dropzone__icon'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                        </span>
                                        <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                        <p className='dropzone__subtitle'>PDF or DOCX (Max 5MB)</p>
                                    </>
                                )}
                                <input
                                    ref={resumeInputRef}
                                    hidden
                                    type='file'
                                    id='resume'
                                    name='resume'
                                    accept='.pdf,.docx'
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => {
                                    if (!requireAuth()) {
                                        e.target.blur()
                                        return
                                    }
                                    setSelfDescription(e.target.value)
                                }}
                                onFocus={(e) => {
                                    if (!requireAuth()) {
                                        e.target.blur()
                                    }
                                }}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy Generation &bull; Approx 30s</span>
                    <button
                        onClick={handleGenerateReport}
                        className='generate-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate My Interview Strategy
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Page Footer */}
            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a>
            </footer>

            {/* Auth Required Modal */}
            {showAuthModal && (
                <div className='auth-modal-overlay' onClick={() => setShowAuthModal(false)}>
                    <div className='auth-modal' onClick={(e) => e.stopPropagation()}>
                        <button
                            type='button'
                            className='auth-modal__close'
                            onClick={() => setShowAuthModal(false)}
                            aria-label='Close'
                        >
                            ✕
                        </button>
                        <div className='auth-modal__icon'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <h2>Login or Register to Continue</h2>
                        <p>
                            To customize your target job description, upload your resume, and generate AI-tailored interview strategies, please sign in or create an account.
                        </p>
                        <div className='auth-modal__actions'>
                            <button
                                type='button'
                                onClick={() => navigate('/login')}
                                className='btn-login'
                            >
                                Login
                            </button>
                            <button
                                type='button'
                                onClick={() => navigate('/register')}
                                className='btn-register'
                            >
                                Register
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home