'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { signupAction } from './action'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [particles, setParticles] = useState([])
  const [strength, setStrength] = useState(0)
  const [passwordVal, setPasswordVal] = useState('')

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 8}s`,
        animationDuration: `${6 + Math.random() * 6}s`,
        width: `${1 + Math.random() * 2}px`,
        height: `${1 + Math.random() * 2}px`,
        opacity: 0.15 + Math.random() * 0.25,
      }))
    )
  }, [])

  function getStrength(pw) {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }

  function handlePasswordChange(e) {
    const val = e.target.value
    setPasswordVal(val)
    setStrength(getStrength(val))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.target)
    const password = formData.get('password')
    const confirm = formData.get('confirm')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    startTransition(async () => {
      const result = await signupAction(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(true)
      }
    })
  }

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['', '#e05555', '#e09955', '#9f94f0', '#5dcaa5']

  if (success) {
    return (
      <div className="login-root">
        <div className="bg-grid" aria-hidden="true" />
        <div className="bg-orb orb-1" aria-hidden="true" />
        <div className="bg-orb orb-2" aria-hidden="true" />

        <main className="login-card success-card">
          <div className="success-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="19" stroke="var(--mv-accent)" strokeWidth="1.5" />
              <path d="M12 20.5l6 6 10-12" stroke="var(--mv-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="heading" style={{ textAlign: 'center', marginBottom: '10px' }}>Check your email</h1>
          <p className="subheading" style={{ textAlign: 'center', lineHeight: '1.7' }}>
            We sent a confirmation link to your email. Click it to activate your account and start using sma.
          </p>
          <Link href="/login" className="back-link">Back to sign in</Link>
        </main>

        <style>{`
          .login-root {
            min-height: 100vh; background: var(--mv-bg);
            display: flex; align-items: center; justify-content: center;
            padding: 24px; position: relative; overflow: hidden;
            font-family: 'Syne', sans-serif;
          }
          .bg-grid {
            position: absolute; inset: 0;
            background-image: linear-gradient(var(--mv-border) 1px, transparent 1px), linear-gradient(90deg, var(--mv-border) 1px, transparent 1px);
            background-size: 48px 48px; opacity: 0.35;
            mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
          }
          .bg-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
          .orb-1 { width: 520px; height: 520px; background: var(--mv-primary); opacity: 0.07; top: -180px; right: -160px; animation: orb-drift 14s ease-in-out infinite alternate; }
          .orb-2 { width: 400px; height: 400px; background: var(--mv-pink); opacity: 0.05; bottom: -140px; left: -120px; animation: orb-drift 18s ease-in-out infinite alternate-reverse; }
          @keyframes orb-drift { from { transform: translate(0,0); } to { transform: translate(30px,20px); } }
          .login-card { position: relative; z-index: 10; width: 100%; max-width: 420px; background: var(--mv-surface); border: 0.5px solid var(--mv-border); border-radius: 20px; padding: 40px 36px; animation: card-in 0.6s cubic-bezier(0.16,1,0.3,1) both; }
          @keyframes card-in { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
          .success-card { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
          .success-icon { animation: pop-in 0.5s 0.2s cubic-bezier(0.16,1,0.3,1) both; }
          @keyframes pop-in { from { opacity:0; transform: scale(0.6); } to { opacity:1; transform: scale(1); } }
          .heading { font-size: 24px; font-weight: 700; color: var(--mv-text); letter-spacing: -0.02em; margin: 0; }
          .subheading { font-size: 14px; color: var(--mv-muted); margin: 0; font-weight: 400; }
          .back-link { margin-top: 8px; font-size: 13px; color: var(--mv-accent); text-decoration: none; font-weight: 500; }
          .back-link:hover { color: var(--mv-text); }
        `}</style>
      </div>
    )
  }

  return (
    <div className="login-root">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-orb orb-1" aria-hidden="true" />
      <div className="bg-orb orb-2" aria-hidden="true" />

      {particles.map((p) => (
        <span key={p.id} className="particle" style={{
          left: p.left, top: p.top,
          animationDelay: p.animationDelay,
          animationDuration: p.animationDuration,
          width: p.width, height: p.height, opacity: p.opacity,
        }} aria-hidden="true" />
      ))}

      <main className="login-card">
        {/* Logo */}
        <div className="logo-block">
          <div className="logo-mark">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 26,9 26,19 14,26 2,19 2,9" fill="none" stroke="var(--mv-primary)" strokeWidth="1.5" />
              <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="var(--mv-primary)" opacity="0.25" />
              <circle cx="14" cy="14" r="3" fill="var(--mv-accent)" />
            </svg>
          </div>
          <span className="logo-text">sma</span>
        </div>

        <div className="heading-block">
          <h1 className="heading">Create account</h1>
          <p className="subheading">Join sma and start connecting</p>
        </div>

        <form onSubmit={handleSubmit} className="form" noValidate>

          {/* Username */}
          <div className="field">
            <label htmlFor="username" className="field-label">Username</label>
            <div className="input-wrap">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" />
                <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <input
                id="username" name="username" type="text"
                autoComplete="username" placeholder="yourhandle"
                className="input" required
              />
            </div>
          </div>

          {/* Email */}
          <div className="field">
            <label htmlFor="email" className="field-label">Email</label>
            <div className="input-wrap">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1 5.5L8 9.5L15 5.5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              <input
                id="email" name="email" type="email"
                autoComplete="email" placeholder="you@example.com"
                className="input" required
              />
            </div>
          </div>

          {/* Password */}
          <div className="field">
            <label htmlFor="password" className="field-label">Password</label>
            <div className="input-wrap">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="8" cy="10.5" r="1" fill="currentColor" />
              </svg>
              <input
                id="password" name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password" placeholder="Min. 8 characters"
                className="input" required
                onChange={handlePasswordChange}
              />
              <button type="button" className="eye-btn"
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
                    <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                )}
              </button>
            </div>
            {/* Password strength bar */}
            {passwordVal.length > 0 && (
              <div className="strength-wrap">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="strength-bar"
                      style={{ background: n <= strength ? strengthColors[strength] : 'var(--mv-border)' }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthColors[strength] }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="field">
            <label htmlFor="confirm" className="field-label">Confirm password</label>
            <div className="input-wrap">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6 10.5l1.5 1.5 2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                id="confirm" name="confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password" placeholder="Repeat your password"
                className="input" required
              />
              <button type="button" className="eye-btn"
                onClick={() => setShowConfirm(p => !p)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                {showConfirm ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
                    <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className="terms-row">
            <input type="checkbox" name="terms" className="terms-checkbox" required />
            <span className="terms-text">
              I agree to the{' '}
              <Link href="/terms" className="terms-link">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="terms-link">Privacy Policy</Link>
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="error-box" role="alert">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                <line x1="7" y1="4" x2="7" y2="7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="7" cy="10" r="0.7" fill="currentColor" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="submit-btn" disabled={isPending}>
            {isPending ? (
              <span className="btn-inner">
                <span className="spinner" />
                Creating account...
              </span>
            ) : (
              <span className="btn-inner">
                Create account
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span className="divider-line" />
          <span className="divider-text">or continue with</span>
          <span className="divider-line" />
        </div>

        {/* OAuth */}
        <div className="oauth-row">
          <button className="oauth-btn" type="button" aria-label="Sign up with Google">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Google
          </button>
          <button className="oauth-btn" type="button" aria-label="Sign up with GitHub">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M9 0C4.03 0 0 4.03 0 9c0 3.98 2.58 7.35 6.16 8.54.45.08.62-.19.62-.43v-1.5c-2.5.54-3.03-1.2-3.03-1.2-.41-1.04-1-1.32-1-1.32-.82-.56.06-.55.06-.55.9.06 1.38.93 1.38.93.8 1.37 2.1.97 2.61.74.08-.58.31-.97.57-1.19-1.99-.23-4.09-1-4.09-4.43 0-.98.35-1.78.93-2.4-.09-.23-.4-1.14.09-2.37 0 0 .76-.24 2.48.93A8.67 8.67 0 019 4.36c.77 0 1.54.1 2.26.3 1.72-1.17 2.48-.93 2.48-.93.49 1.23.18 2.14.09 2.37.58.62.93 1.42.93 2.4 0 3.44-2.1 4.2-4.1 4.42.32.28.61.82.61 1.65v2.45c0 .24.16.52.62.43A9.01 9.01 0 0018 9C18 4.03 13.97 0 9 0z" />
            </svg>
            GitHub
          </button>
        </div>

        <p className="signup-text">
          Already have an account?{' '}
          <Link href="/login" className="signup-link">Sign in</Link>
        </p>
      </main>

      <style>{`
        .login-root {
          min-height: 100vh; background: var(--mv-bg);
          display: flex; align-items: center; justify-content: center;
          padding: 24px; position: relative; overflow: hidden;
          font-family: 'Syne', sans-serif;
        }
        .bg-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(var(--mv-border) 1px, transparent 1px), linear-gradient(90deg, var(--mv-border) 1px, transparent 1px);
          background-size: 48px 48px; opacity: 0.35;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
        }
        .bg-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .orb-1 { width: 520px; height: 520px; background: var(--mv-primary); opacity: 0.07; top: -180px; right: -160px; animation: orb-drift 14s ease-in-out infinite alternate; }
        .orb-2 { width: 400px; height: 400px; background: var(--mv-pink); opacity: 0.05; bottom: -140px; left: -120px; animation: orb-drift 18s ease-in-out infinite alternate-reverse; }
        @keyframes orb-drift { from { transform: translate(0,0); } to { transform: translate(30px,20px); } }
        .particle { position: absolute; border-radius: 50%; background: var(--mv-accent); animation: float linear infinite; pointer-events: none; }
        @keyframes float { 0% { transform: translateY(0) scale(1); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-80px) scale(0.5); opacity: 0; } }
        .login-card {
          position: relative; z-index: 10; width: 100%; max-width: 420px;
          background: var(--mv-surface); border: 0.5px solid var(--mv-border);
          border-radius: 20px; padding: 36px 36px 32px;
          animation: card-in 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes card-in { from { opacity:0; transform: translateY(24px) scale(0.97); } to { opacity:1; transform: translateY(0) scale(1); } }
        .logo-block { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; animation: fade-up 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
        .logo-mark { display: flex; align-items: center; justify-content: center; }
        .logo-text { font-size: 22px; font-weight: 700; letter-spacing: 0.12em; text-transform: lowercase; color: var(--mv-text); }
        .heading-block { margin-bottom: 24px; animation: fade-up 0.5s 0.15s cubic-bezier(0.16,1,0.3,1) both; }
        .heading { font-size: 26px; font-weight: 700; color: var(--mv-text); margin: 0 0 6px; letter-spacing: -0.02em; }
        .subheading { font-size: 14px; color: var(--mv-muted); margin: 0; font-weight: 400; }
        .form { display: flex; flex-direction: column; gap: 16px; animation: fade-up 0.5s 0.2s cubic-bezier(0.16,1,0.3,1) both; }
        .field { display: flex; flex-direction: column; gap: 7px; }
        .field-label { font-size: 11px; font-weight: 500; color: var(--mv-muted); letter-spacing: 0.06em; text-transform: uppercase; }
        .input-wrap { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 14px; color: var(--mv-dim); pointer-events: none; flex-shrink: 0; }
        .input {
          width: 100%; height: 44px; background: var(--mv-surface-2);
          border: 0.5px solid var(--mv-border); border-radius: 10px;
          padding: 0 44px 0 42px; font-size: 14px; color: var(--mv-text);
          font-family: 'Syne', sans-serif; outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .input::placeholder { color: var(--mv-dim); }
        .input:focus { border-color: var(--mv-primary); background: #1a1a30; }
        .eye-btn { position: absolute; right: 14px; background: none; border: none; cursor: pointer; color: var(--mv-dim); padding: 0; display: flex; align-items: center; transition: color 0.15s; }
        .eye-btn:hover { color: var(--mv-muted); }
        .strength-wrap { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
        .strength-bars { display: flex; gap: 4px; flex: 1; }
        .strength-bar { height: 3px; flex: 1; border-radius: 2px; transition: background 0.3s; }
        .strength-label { font-size: 11px; font-weight: 500; min-width: 36px; text-align: right; transition: color 0.3s; }
        .terms-row { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
        .terms-checkbox { width: 15px; height: 15px; margin-top: 1px; accent-color: var(--mv-primary); flex-shrink: 0; cursor: pointer; }
        .terms-text { font-size: 12px; color: var(--mv-muted); line-height: 1.5; }
        .terms-link { color: var(--mv-accent); text-decoration: none; }
        .terms-link:hover { color: var(--mv-text); }
        .error-box { display: flex; align-items: center; gap: 8px; padding: 11px 14px; background: rgba(240,80,80,0.08); border: 0.5px solid rgba(240,80,80,0.25); border-radius: 8px; font-size: 13px; color: #f07090; }
        .submit-btn { height: 46px; background: var(--mv-primary); border: none; border-radius: 10px; color: var(--mv-text); font-size: 14px; font-weight: 600; font-family: 'Syne', sans-serif; cursor: pointer; transition: opacity 0.15s, transform 0.1s; letter-spacing: 0.03em; margin-top: 2px; }
        .submit-btn:hover:not(:disabled) { opacity: 0.88; }
        .submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(232,234,255,0.3); border-top-color: var(--mv-text); border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; animation: fade-up 0.5s 0.25s cubic-bezier(0.16,1,0.3,1) both; }
        .divider-line { flex: 1; height: 0.5px; background: var(--mv-border); }
        .divider-text { font-size: 12px; color: var(--mv-dim); white-space: nowrap; letter-spacing: 0.04em; }
        .oauth-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; animation: fade-up 0.5s 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        .oauth-btn { height: 42px; display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--mv-surface-2); border: 0.5px solid var(--mv-border); border-radius: 10px; color: var(--mv-muted); font-size: 13px; font-weight: 500; font-family: 'Syne', sans-serif; cursor: pointer; transition: border-color 0.15s, color 0.15s, background 0.15s; letter-spacing: 0.02em; }
        .oauth-btn:hover { border-color: var(--mv-primary); color: var(--mv-text); background: #1a1a30; }
        .signup-text { text-align: center; font-size: 13px; color: var(--mv-muted); margin: 20px 0 0; animation: fade-up 0.5s 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .signup-link { color: var(--mv-accent); text-decoration: none; font-weight: 500; }
        .signup-link:hover { color: var(--mv-text); }
        @keyframes fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 480px) { .login-card { padding: 32px 24px; } .heading { font-size: 22px; } }
      `}</style>
    </div>
  )
}