import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../services/api';
import Animated3DBackground from '../components/ui/Animated3DBackground.jsx';

const LANGUAGES = ['English', 'Assamese', 'Bengali', 'Hindi', 'Khasi', 'Mizo', 'Nagamese', 'Manipuri', 'Nepali'];

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

const selectStyle = {
  ...inputStyle,
  paddingRight: '40px',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%235a9a5a' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  cursor: 'pointer',
};

const labelStyle = { color: '#333', fontSize: '12px', fontWeight: '600', marginBottom: '2px' };

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [signupType, setSignupType] = useState('patient');
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({ name: '', identifier: '', age: '', language: 'English', gender: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

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
    if (!form.name.trim() || !form.identifier.trim()) return;
    setLoading(true);
    setError('');
    try {
      const purpose = signupType === 'caregiver' ? 'caregiver' : 'signup';
      await authApi.sendOtp(form.identifier.trim(), purpose);
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
      if (signupType === 'caregiver') {
        const res = await authApi.verifyOtp({
          identifier: form.identifier.trim(),
          code: otp.trim(),
          purpose: 'caregiver',
          name: form.name.trim(),
        });
        await login(res.data.token, res.data.user, res.data.patient, res.data.caregiver || null);
        navigate('/caregiver');
      } else {
        const res = await authApi.verifyOtp({
          identifier: form.identifier.trim(),
          code: otp.trim(),
          purpose: 'signup',
          name: form.name.trim(),
          age: parseInt(form.age, 10) || 65,
          language: form.language,
          gender: form.gender,
        });
        await login(res.data.token, res.data.user, res.data.patient);
        navigate('/home');
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const isPatient = signupType === 'patient';
  const title = isPatient ? 'Create Patient Account' : 'Activate Caregiver Account';
  const subtitle = isPatient
    ? 'Start your cognitive wellness journey'
    : 'Already added by a patient? Activate your access';

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

            {/* Patient/Caregiver Toggle */}
            {step === 'form' && (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', background: 'rgba(122,170,122,0.08)', borderRadius: '12px', padding: '3px' }}>
                <button type="button" onClick={() => { setSignupType('patient'); setError(''); setForm({ name: '', identifier: '', age: '', language: 'English', gender: '' }); }}
                  style={{ flex: 1, padding: '7px', borderRadius: '10px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                    background: signupType === 'patient' ? 'linear-gradient(135deg, #3d7a3d, #2d5a2d)' : 'transparent',
                    color: signupType === 'patient' ? '#fff' : '#666',
                  }}>
                  Patient
                </button>
                <button type="button" onClick={() => { setSignupType('caregiver'); setError(''); setForm({ name: '', identifier: '', age: '', language: 'English', gender: '' }); }}
                  style={{ flex: 1, padding: '7px', borderRadius: '10px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                    background: signupType === 'caregiver' ? 'linear-gradient(135deg, #3d7a3d, #2d5a2d)' : 'transparent',
                    color: signupType === 'caregiver' ? '#fff' : '#666',
                  }}>
                  Caregiver
                </button>
              </div>
            )}

            {step === 'form' ? (
              <form onSubmit={handleSendOtp}>
                {/* Name */}
                <label style={labelStyle}>{isPatient ? 'Full Name' : 'Your Name'}</label>
                <div style={{ marginBottom: '6px' }}>
                  <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder={isPatient ? 'Enter your full name' : 'Enter your name'}
                    style={inputStyle} required
                    onFocus={(e) => { e.target.style.borderColor = '#5a9a5a'; e.target.style.boxShadow = '0 0 0 3px rgba(90,154,90,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#c8dcc8'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }} />
                </div>

                {/* Email/Phone */}
                <label style={labelStyle}>Email or Mobile Number</label>
                <div style={{ marginBottom: '6px' }}>
                  <input type="text" value={form.identifier} onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
                    placeholder={isPatient ? 'you@example.com or +91 9876543210' : 'Email/phone given by patient'}
                    style={inputStyle} required
                    onFocus={(e) => { e.target.style.borderColor = '#5a9a5a'; e.target.style.boxShadow = '0 0 0 3px rgba(90,154,90,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#c8dcc8'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }} />
                </div>

                {signupType === 'caregiver' && (
                  <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ fontSize: '14px', lineHeight: '1' }}>&#9432;</span>
                    <p style={{ color: '#92400e', fontSize: '11px', lineHeight: '1.4', margin: 0 }}>
                      A patient must add you as a caregiver first. Use the same email/phone they registered you with.
                    </p>
                  </div>
                )}

                {/* Patient-only fields */}
                {signupType === 'patient' && (
                  <>
                    {/* Age + Gender row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '6px' }}>
                      <div>
                        <label style={labelStyle}>Age</label>
                        <input type="text" inputMode="numeric" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value.replace(/\D/g, '') }))}
                          placeholder="--/--" style={inputStyle}
                          onFocus={(e) => { e.target.style.borderColor = '#5a9a5a'; e.target.style.boxShadow = '0 0 0 3px rgba(90,154,90,0.12)'; }}
                          onBlur={(e) => { e.target.style.borderColor = '#c8dcc8'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }} />
                      </div>
                      <div>
                        <label style={labelStyle}>Gender</label>
                        <input type="text" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                          placeholder="--/--" style={inputStyle}
                          onFocus={(e) => { e.target.style.borderColor = '#5a9a5a'; e.target.style.boxShadow = '0 0 0 3px rgba(90,154,90,0.12)'; }}
                          onBlur={(e) => { e.target.style.borderColor = '#c8dcc8'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }} />
                      </div>
                    </div>

                    {/* Language */}
                    <label style={labelStyle}>Preferred Language</label>
                    <div style={{ marginBottom: '8px' }}>
                      <select value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                        style={selectStyle}>
                        {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {error && (
                  <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '10px' }}>
                    <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading || !form.name.trim() || !form.identifier.trim()}
                  style={{
                    width: '100%', padding: '11px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #3d7a3d, #2d5a2d)',
                    color: '#fff', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading || !form.name.trim() || !form.identifier.trim() ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                  {loading ? <><IconSpinner /> Sending OTP...</> : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <button type="button" onClick={() => { setStep('form'); setOtp(''); setError(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                    <IconArrowLeft size={20} />
                  </button>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>Verify OTP</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>Sent to {form.identifier}</p>
                  </div>
                </div>

                <label style={{ ...labelStyle, marginBottom: '4px', display: 'block' }}>6-Digit Code</label>
                <div style={{ marginBottom: '14px' }}>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000" maxLength={6} autoFocus
                    style={{ ...inputStyle, padding: '12px 16px', fontSize: '22px', letterSpacing: '8px', textAlign: 'center', fontWeight: '700' }} />
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
                  {loading ? <><IconSpinner /> Creating Account...</> : isPatient ? 'Create Account' : 'Activate Account'}
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
            Already have an account?{' '}
            <Link to="/signin" style={{ color: '#3d7a3d', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
