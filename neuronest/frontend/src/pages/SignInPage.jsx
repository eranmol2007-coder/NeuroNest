import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../services/api';
import Animated3DBackground from '../components/ui/Animated3DBackground.jsx';

function IconMail({ size = 22, color = '#3d7a3d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <rect x="2" y="4" width="18" height="14" rx="3" stroke={color} strokeWidth="1.8" fill={`${color}08`} />
      <path d="M2 7 L11 13 L20 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPhone({ size = 22, color = '#3d7a3d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <rect x="5" y="1" width="12" height="20" rx="3" stroke={color} strokeWidth="1.8" fill={`${color}08`} />
      <line x1="9" y1="17" x2="13" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconHeart({ size = 22, color = '#3d7a3d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path d="M11 19 C5 14 2 10 2 7 C2 4.5 4 2.5 6.5 2.5 C8 2.5 9.5 3.2 11 5 C12.5 3.2 14 2.5 15.5 2.5 C18 2.5 20 4.5 20 7 C20 10 17 14 11 19Z" stroke={color} strokeWidth="1.8" fill={`${color}10`} />
    </svg>
  );
}

function IconUser({ size = 22, color = '#3d7a3d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="7" r="4" stroke={color} strokeWidth="1.8" fill={`${color}08`} />
      <path d="M3 20 C3 15.5 6.5 13 11 13 C15.5 13 19 15.5 19 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function IconShield({ size = 22, color = '#3d7a3d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path d="M11 2 L19 6 V11 C19 15.5 15.5 19.5 11 21 C6.5 19.5 3 15.5 3 11 V6 L11 2Z" stroke={color} strokeWidth="1.8" fill={`${color}10`} />
      <path d="M7 11 L10 14 L15 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrowLeft({ size = 18, color = '#6b7280' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M11 4 L6 9 L11 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="animate-spin-slow">
      <circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
      <path d="M10 2 A8 8 0 0 1 18 10" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const inputStyle = {
  padding: '8px 10px',
  borderRadius: '10px',
  border: '1px solid #c8dcc8',
  background: '#fff',
  fontSize: '13px',
  color: '#1a1a1a',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'all 0.2s ease',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

export default function SignInPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginType, setLoginType] = useState('patient');
  const [step, setStep] = useState('identifier');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const isEmail = identifier.includes('@');

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setLoading(true);
    setError('');
    try {
      const purpose = loginType === 'caregiver' ? 'caregiver' : 'signin';
      await authApi.sendOtp(identifier.trim(), purpose);
      setOtpSent(true);
      setStep('otp');
      startCountdown();
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const purpose = loginType === 'caregiver' ? 'caregiver' : 'signin';
      const res = await authApi.verifyOtp({
        identifier: identifier.trim(),
        code: otp.trim(),
        purpose,
      });
      await login(res.data.token, res.data.user, res.data.patient, res.data.caregiver || null);
      if (res.data.caregiver) {
        navigate('/caregiver');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const isPatient = loginType === 'patient';
  const Icon = isPatient ? IconHeart : IconUser;
  const title = isPatient ? 'Patient Sign In' : 'Caregiver Sign In';
  const subtitle = isPatient
    ? 'Access your cognitive wellness dashboard'
    : 'Monitor your patient\'s care and progress';
  const placeholder = isPatient
    ? 'you@example.com or +91 9876543210'
    : 'Email/phone given by patient';

  return (
    <div className="modern-page" style={{ position: 'relative', background: 'transparent', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <Animated3DBackground />
      <div className="page-container" style={{ position: 'relative', zIndex: 1, maxWidth: '460px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Logo */}
          <div style={{ marginBottom: '6px', textAlign: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(61,122,61,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
              <IconShield size={20} color="#3d7a3d" />
            </div>
            <h1 style={{ color: '#1a2e1a', fontWeight: '700', fontSize: '1.3rem', margin: '0' }}>{title}</h1>
            <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '2px 0 0' }}>{subtitle}</p>
          </div>

          {/* Card */}
          <div className="glass-card" style={{ padding: '14px', margin: '0', width: '100%' }}>

            {step === 'identifier' && (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', background: 'rgba(122,170,122,0.08)', borderRadius: '12px', padding: '3px' }}>
                <button type="button" onClick={() => { setLoginType('patient'); setError(''); setIdentifier(''); setStep('identifier'); }}
                  style={{ flex: 1, padding: '7px', borderRadius: '10px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                    background: loginType === 'patient' ? 'linear-gradient(135deg, #3d7a3d, #2d5a2d)' : 'transparent',
                    color: loginType === 'patient' ? '#fff' : '#666',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  }}>
                  <IconHeart size={14} color={loginType === 'patient' ? '#fff' : '#666'} />
                  Patient
                </button>
                <button type="button" onClick={() => { setLoginType('caregiver'); setError(''); setIdentifier(''); setStep('identifier'); }}
                  style={{ flex: 1, padding: '7px', borderRadius: '10px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                    background: loginType === 'caregiver' ? 'linear-gradient(135deg, #3d7a3d, #2d5a2d)' : 'transparent',
                    color: loginType === 'caregiver' ? '#fff' : '#666',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  }}>
                  <IconUser size={14} color={loginType === 'caregiver' ? '#fff' : '#666'} />
                  Caregiver
                </button>
              </div>
            )}

            {step === 'identifier' ? (
              <form onSubmit={handleSendOtp}>
                {loginType === 'caregiver' && (
                  <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', marginBottom: '10px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ fontSize: '14px', lineHeight: '1' }}>&#9432;</span>
                    <p style={{ color: '#92400e', fontSize: '11px', lineHeight: '1.4', margin: 0 }}>
                      Enter the email or phone number that the patient used when adding you as a caregiver.
                    </p>
                  </div>
                )}

                <label style={{ color: '#333', fontSize: '12px', fontWeight: '600', marginBottom: '2px' }}>
                  {isPatient ? 'Email or Mobile Number' : 'Email or Mobile Number'}
                </label>
                <div style={{ marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                    placeholder={placeholder}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#5a9a5a'; e.target.style.boxShadow = '0 0 0 3px rgba(90,154,90,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#c8dcc8'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
                    autoFocus
                  />
                </div>

                {error && (
                  <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '10px' }}>
                    <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading || !identifier.trim()}
                  style={{
                    width: '100%', padding: '11px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #3d7a3d, #2d5a2d)',
                    color: '#fff', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading || !identifier.trim() ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                  {loading ? <><IconSpinner /> Sending OTP...</> : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <button type="button" onClick={() => { setStep('identifier'); setOtp(''); setError(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                    <IconArrowLeft size={20} />
                  </button>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>Enter OTP</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>Sent to {identifier}</p>
                  </div>
                </div>

                <label style={{ color: '#333', fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>6-Digit Code</label>
                <div style={{ marginBottom: '14px' }}>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                    placeholder="000000"
                    style={{ ...inputStyle, padding: '12px 16px', fontSize: '22px', letterSpacing: '8px', textAlign: 'center', fontWeight: '700' }}
                    maxLength={6}
                    autoFocus
                  />
                </div>

                {error && (
                  <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '10px' }}>
                    <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading || otp.length !== 6}
                  style={{
                    width: '100%', padding: '11px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #3d7a3d, #2d5a2d)',
                    color: '#fff', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading || otp.length !== 6 ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                  {loading ? <><IconSpinner /> Verifying...</> : 'Sign In'}
                </button>

                {countdown > 0 ? (
                  <p className="text-center text-xs mt-3" style={{ color: '#6b7280' }}>Resend OTP in {countdown}s</p>
                ) : (
                  <button type="button" onClick={handleSendOtp} disabled={loading}
                    className="text-center text-xs mt-3 block w-full"
                    style={{ color: '#3d7a3d', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Resend OTP
                  </button>
                )}
              </form>
            )}
          </div>

          {/* Footer link */}
          <p className="text-sm mt-4" style={{ color: '#6b7280', fontSize: '13px' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#3d7a3d', fontWeight: '700', textDecoration: 'none' }}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
