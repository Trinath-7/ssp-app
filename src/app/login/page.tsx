'use client';

import React, { useState } from 'react';
import { SSPLogo } from '@/components/common/SSPLogo';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Phone, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { setCurrentRole, showToast } = useApp();
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [emailOrPhone, setEmailOrPhone] = useState('admin@sspproperties.com');
  const [password, setPassword] = useState('••••••••');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrPhone, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentRole(data.user.role || 'ADMIN');
        showToast(`Welcome back, ${data.user.name}!`);
        router.push('/');
      } else {
        showToast('Login failed. Please check credentials.', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = () => {
    setOtpSent(true);
    showToast(`Verification OTP sent to ${emailOrPhone}: (Demo OTP: 456789)`, 'info');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-slate-100">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-200/60 space-y-6">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <SSPLogo size="lg" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest pt-1">
            Enterprise Operating Portal
          </p>
        </div>

        {/* Tab for Password vs OTP */}
        <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setLoginMode('password')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              loginMode === 'password'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('otp')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              loginMode === 'otp'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            OTP Login
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Email or Mobile Number
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="admin@sspproperties.com or 9845012345"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                required
              />
            </div>
          </div>

          {loginMode === 'password' ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 uppercase">Password</label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Password reset link dispatched to your registered email.');
                  }}
                  className="text-emerald-800 hover:text-emerald-950 font-semibold"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                One Time Password (OTP)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold tracking-widest text-base text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl whitespace-nowrap"
                >
                  {otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>
            </div>
          )}

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-emerald-700"
              />
              <span className="text-slate-600 font-medium">Remember Me</span>
            </label>
            <span className="text-[11px] text-emerald-800 font-bold">256-Bit SSL Encrypted</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'LOGIN TO PLATFORM'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Logins Strip */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
            Instant Demo Account Sign-in
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={() => {
                setEmailOrPhone('admin@sspproperties.com');
                setCurrentRole('ADMIN');
                showToast('Signed in as Admin');
                router.push('/');
              }}
              className="p-2 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 text-left font-semibold text-slate-800"
            >
              👑 Admin (Full Access)
            </button>
            <button
              onClick={() => {
                setEmailOrPhone('manager@sspproperties.com');
                setCurrentRole('MANAGER');
                showToast('Signed in as Manager');
                router.push('/');
              }}
              className="p-2 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 text-left font-semibold text-slate-800"
            >
              👔 Manager (Operations)
            </button>
            <button
              onClick={() => {
                setEmailOrPhone('rahul.agent@sspproperties.com');
                setCurrentRole('AGENT');
                showToast('Signed in as Field Agent');
                router.push('/');
              }}
              className="p-2 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 text-left font-semibold text-slate-800"
            >
              🏍️ Agent (Field & Repo)
            </button>
            <button
              onClick={() => {
                setEmailOrPhone('staff@sspproperties.com');
                setCurrentRole('STAFF');
                showToast('Signed in as Staff');
                router.push('/');
              }}
              className="p-2 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 text-left font-semibold text-slate-800"
            >
              📋 Staff (Read & Service)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
