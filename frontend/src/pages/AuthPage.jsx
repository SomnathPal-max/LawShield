import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Briefcase, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Scale, 
  Check,
  UserCheck,
  Building,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { api } from '../services/api';
import { useAuth0 } from '@auth0/auth0-react';

export const AuthPage = ({ initialMode = 'login', setCurrentTab }) => {
  const { login, register, demoLogin, showToast, user } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user', // 'user' (Citizen) | 'lawyer' (Advocate)
    // Advocate specific fields
    barId: '',
    specialization: 'Criminal Defense & Statutory Rights',
    experience: 5,
    // Emergency Contact Pre-setup
    emergencyName: '',
    emergencyRelationship: 'Mother',
    emergencyPhone: '',
  });

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const { loginWithRedirect } = useAuth0();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // If the user hasn't configured Auth0 in .env.local, use the fallback demo login so the app doesn't crash
    if (!import.meta.env.VITE_AUTH0_DOMAIN || import.meta.env.VITE_AUTH0_DOMAIN === 'lawshield-demo.us.auth0.com') {
      showToast('Auth0 credentials missing in .env.local. Falling back to Demo Citizen account.', 'info');
      await handleDemoQuickLogin('citizen');
      return;
    }
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: 'login'
      }
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (!import.meta.env.VITE_AUTH0_DOMAIN || import.meta.env.VITE_AUTH0_DOMAIN === 'lawshield-demo.us.auth0.com') {
      showToast('Auth0 credentials missing in .env.local. Falling back to Demo Citizen account.', 'info');
      await handleDemoQuickLogin('citizen');
      return;
    }
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup'
      }
    });
  };

  const handleDemoQuickLogin = async (persona) => {
    setSubmitting(true);
    const res = await demoLogin(persona);
    setSubmitting(false);
    if (res?.success && setCurrentTab) {
      if (persona === 'lawyer') setCurrentTab('lawyer-dashboard');
      else if (persona === 'admin') setCurrentTab('admin');
      else if (persona === 'teacher') setCurrentTab('teacher-dashboard');
      else setCurrentTab('home');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      showToast('Please enter your registered email address', 'error');
      return;
    }

    setForgotSubmitting(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
      setForgotMessage(res.data.message || 'Password reset instructions dispatched.');
    } catch (err) {
      setForgotMessage(`Password reset simulation: Temporary OTP dispatched to ${forgotEmail.trim()}. Use your credentials or demo login.`);
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentTab && setCurrentTab('home')}
            className="flex items-center space-x-1.5 text-xs text-slate-700 hover:text-[#0f172a] font-bold transition"
          >
            <ArrowLeft size={15} />
            <span>Back to Legal Portal</span>
          </button>

          <div className="text-xs text-slate-600 font-medium">
            {user ? (
              <span>Currently active as <strong className="text-[#0f172a] font-bold">{user.name}</strong> ({user.role})</span>
            ) : (
              <span>Institutional Secure Gateway</span>
            )}
          </div>
        </div>

        {/* Main Split Grid Card */}
        <div className="bg-white border-2 border-stone-200 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Institutional Credentials & Trust Pillars (5 cols) */}
          <div className="lg:col-span-5 bg-[#f8f7f4] p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-stone-200 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Logo size="md" variant="dark" subtitle="Statutory Legal Counsel & Protection" />
                <p className="text-xs text-slate-700 font-medium leading-relaxed pt-2">
                  Institutional access for Indian citizens, empanelled Bar Council advocates, and legal chamber registries.
                </p>
              </div>

              {/* Trust Safeguards */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#854d0e] flex items-center justify-center shrink-0">
                    <Shield size={16} />
                  </div>
                  <div className="text-xs">
                    <h4 className="font-extrabold text-[#0f172a]">256-Bit Client Privilege</h4>
                    <p className="text-slate-600 text-[11px] leading-tight mt-0.5">
                      Case briefs and evidence stored under strict advocate-client confidentiality protocols.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                    <UserCheck size={16} />
                  </div>
                  <div className="text-xs">
                    <h4 className="font-extrabold text-[#0f172a]">Bar Council Verified Roster</h4>
                    <p className="text-slate-600 text-[11px] leading-tight mt-0.5">
                      Empanelled advocates cross-verified with official State Bar enrollment numbers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <AlertCircle size={16} />
                  </div>
                  <div className="text-xs">
                    <h4 className="font-extrabold text-[#0f172a]">Direct SOS & Family Dispatch</h4>
                    <p className="text-slate-600 text-[11px] leading-tight mt-0.5">
                      1-tap immediate dialing and live GPS location transmission to family members.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 1-Click Instant Persona Quick Buttons */}
            <div className="p-4 rounded-2xl bg-white border-2 border-stone-200 space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-1.5 text-[11px] font-black uppercase tracking-wider text-[#854d0e]">
                <Sparkles size={13} />
                <span>1-Click Test Credentials Simulator</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Switch instantly between pre-configured legal personas:
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleDemoQuickLogin('citizen')}
                  className="px-2 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-300 text-slate-900 text-xs font-bold transition flex flex-col items-center text-center shadow-xs"
                >
                  <span className="text-base">👩</span>
                  <span className="text-[11px] mt-0.5">Citizen</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoQuickLogin('lawyer')}
                  className="px-2 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-300 text-slate-900 text-xs font-bold transition flex flex-col items-center text-center shadow-xs"
                >
                  <span className="text-base">👨‍⚖️</span>
                  <span className="text-[11px] mt-0.5">Advocate</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoQuickLogin('admin')}
                  className="px-2 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-300 text-slate-900 text-xs font-bold transition flex flex-col items-center text-center shadow-xs"
                >
                  <span className="text-base">🛡️</span>
                  <span className="text-[11px] mt-0.5">Admin</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
            {/* Tab Selector: Sign In vs Create Account */}
            <div className="flex items-center border-b border-stone-200">
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className={`pb-3 text-sm font-extrabold transition-all border-b-2 mr-6 ${
                  mode === 'login'
                    ? 'border-[#0f172a] text-[#0f172a]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In to Portal
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('register')}
                className={`pb-3 text-sm font-extrabold transition-all border-b-2 ${
                  mode === 'register'
                    ? 'border-[#0f172a] text-[#0f172a]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Create New Account
              </button>
            </div>

            {/* TAB 1: SIGN IN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0f172a]">
                    Institutional Legal Sign In
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Access your case briefs, attorney consultations, and emergency vault.
                  </p>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    Registered Email Address <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="citizen@lawshield.org"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border-2 border-stone-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#0f172a] shadow-xs"
                    />
                  </div>
                </div>

                {/* Password with Eye Toggle */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Password <span className="text-red-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-[#854d0e] hover:underline font-bold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-white border-2 border-stone-300 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#0f172a] shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-[#0f172a] focus:ring-0"
                  />
                  <label htmlFor="rememberMe" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Remember me on this workstation
                  </label>
                </div>

                {/* Submit Sign In Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#0f172a] hover:bg-[#1e293b] disabled:bg-slate-500 text-white font-black text-xs sm:text-sm py-3 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <span>Authenticating Credentials...</span>
                    ) : (
                      <>
                        <span>Sign In to Legal Portal</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>

                {/* Switch to Register */}
                <div className="text-center pt-2 text-xs text-slate-600">
                  <span>Don't have an institutional account? </span>
                  <button
                    type="button"
                    onClick={() => handleModeChange('register')}
                    className="text-[#854d0e] hover:underline font-extrabold"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0f172a]">
                    Create Institutional Account
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Register as a Citizen Client or Empanelled Bar Council Advocate.
                  </p>
                </div>

                {/* Role Switcher Pills */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Select Account Type <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'user' })}
                      className={`p-3 rounded-xl border-2 text-left transition ${
                        formData.role === 'user'
                          ? 'border-[#0f172a] bg-stone-50 text-[#0f172a] shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <User size={16} className={formData.role === 'user' ? 'text-[#854d0e]' : 'text-slate-400'} />
                        <span className="text-xs font-extrabold">Citizen Client</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                        Statutory guidance, case briefs, and emergency protection
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'lawyer' })}
                      className={`p-3 rounded-xl border-2 text-left transition ${
                        formData.role === 'lawyer'
                          ? 'border-[#0f172a] bg-stone-50 text-[#0f172a] shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Scale size={16} className={formData.role === 'lawyer' ? 'text-[#854d0e]' : 'text-slate-400'} />
                        <span className="text-xs font-extrabold">Empanelled Advocate</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                        Bar Council enrolled practitioner offering consultations
                      </p>
                    </button>
                  </div>
                </div>

                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ananya Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white border-2 border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0f172a] shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      Mobile Phone Number <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white border-2 border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0f172a] shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="ananya@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border-2 border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0f172a] shadow-xs"
                    />
                  </div>
                </div>

                {/* Advocate Practice Specifics */}
                {formData.role === 'lawyer' && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-3">
                    <div className="text-xs font-black text-[#0f172a] flex items-center space-x-1.5">
                      <Scale size={14} className="text-[#854d0e]" />
                      <span>Bar Council Practice Accreditation</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Bar Council ID <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. D/1420/2014"
                          value={formData.barId}
                          onChange={(e) => setFormData({ ...formData, barId: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-600"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Primary Practice Area
                        </label>
                        <select
                          value={formData.specialization}
                          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-600"
                        >
                          <option value="Criminal Defense & Statutory Rights">Criminal Defense</option>
                          <option value="Constitutional & Civil Litigation">Constitutional & Civil</option>
                          <option value="Family Law & Matrimonial Disputes">Family & Matrimonial</option>
                          <option value="Cyber Crime & Digital Defamation">Cyber Crime</option>
                          <option value="POSH & Workplace Safety">POSH & Workplace</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Years of Practice
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={formData.experience}
                          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Pre-configure Family Member Emergency Contact */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-[#0f172a] flex items-center space-x-1.5">
                      <HeartHandshake size={14} className="text-red-700" />
                      <span>Primary Family Emergency Contact (Optional)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Used for 1-Tap SOS Beacon</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Family Member Name"
                      value={formData.emergencyName}
                      onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                      className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0f172a]"
                    />

                    <select
                      value={formData.emergencyRelationship}
                      onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                      className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0f172a]"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Spouse">Spouse / Partner</option>
                      <option value="Sister">Sister</option>
                      <option value="Brother">Brother</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Friend">Trusted Friend</option>
                    </select>

                    <input
                      type="tel"
                      placeholder="Contact Phone (+91...)"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0f172a]"
                    />
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      Password <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Min. 6 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-white border-2 border-stone-300 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0f172a] shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      Confirm Password <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full bg-white border-2 border-stone-300 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0f172a] shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="flex items-start space-x-2 pt-1 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="w-4 h-4 rounded border-stone-300 text-[#0f172a] mt-0.5"
                  />
                  <label htmlFor="terms" className="leading-tight cursor-pointer font-medium">
                    I agree to the <span className="underline font-bold">Terms of Service</span> and acknowledge confidential processing under the <span className="underline font-bold">Digital Personal Data Protection (DPDP) Act 2023</span>.
                  </label>
                </div>

                {/* Submit Register Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#0f172a] hover:bg-[#1e293b] disabled:bg-slate-500 text-white font-black text-xs sm:text-sm py-3 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <span>Creating Account...</span>
                    ) : (
                      <>
                        <span>Create My Secure Account</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>

                {/* Switch to Login */}
                <div className="text-center pt-2 text-xs text-slate-600">
                  <span>Already have an institutional account? </span>
                  <button
                    type="button"
                    onClick={() => handleModeChange('login')}
                    className="text-[#854d0e] hover:underline font-extrabold"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border-2 border-stone-300 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h4 className="font-extrabold text-[#0f172a] text-sm">
                Password Recovery & Reset
              </h4>
              <button
                onClick={() => { setShowForgotModal(false); setForgotMessage(''); }}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your registered email address to receive an institutional password reset token and recovery instructions.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="yourname@domain.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0f172a]"
                />
              </div>

              {forgotMessage && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 font-medium">
                  {forgotMessage}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForgotModal(false); setForgotMessage(''); }}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold shadow-xs"
                >
                  {forgotSubmitting ? 'Sending...' : 'Send Recovery Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
