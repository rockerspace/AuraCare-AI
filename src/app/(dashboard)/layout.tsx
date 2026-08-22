/* eslint-disable */

"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/gcp/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState<'phone' | 'otp'>('phone');
  const [authMethod, setAuthMethod] = useState('');
  const [inputValue, setInputValue] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState('');
  const [userProfile, setUserProfile] = useState<{name: string, role: string} | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('mvp_vrn_session');
    if (session) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setIsAuthenticated(true);
      setUserProfile(JSON.parse(session));
    }
  }, []);

  const [serverHash, setServerHash] = useState<string>('');

  const handleSendOtp = async () => {
    if (!inputValue) return alert("Please enter your email or phone number.");
    
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: !inputValue.includes('@') ? countryCode + inputValue : inputValue })
      });
      const data = await res.json();
      
      if (data.error) {
        if (data.hash) {
          alert(data.error); // Show Twilio Trial warning but proceed for demo
          setServerHash(data.hash);
          setAuthStep('otp');
        } else {
          alert(data.error);
        }
      } else {
        setServerHash(data.hash);
        setAuthStep('otp');
      }
    } catch (e) {
      alert("Failed to reach auth server.");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) return alert("Invalid code.");
    
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otp, hash: serverHash, phone: !inputValue.includes('@') ? countryCode + inputValue : inputValue })
      });
      
      const data = await res.json();
      
      if (data.success) {
        const profile = { name: inputValue.includes('@') ? inputValue.split('@')[0] : 'Caregiver', role: 'Verified User' };
        localStorage.setItem('mvp_vrn_session', JSON.stringify(profile));
        setUserProfile(profile);
        setIsAuthenticated(true);
      } else {
        alert(data.error || "Invalid OTP code.");
      }
    } catch (e) {
      alert("Verification failed.");
    }
  };

  
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const profile = { name: user.displayName || 'Google User', role: 'Verified Provider' };
      localStorage.setItem('mvp_vrn_session', JSON.stringify(profile));
      setUserProfile(profile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error(error);
      alert("Google Sign-In failed: " + (error.message || error.code || "Unknown error"));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mvp_vrn_session');
    setIsAuthenticated(false);
    setAuthStep('phone');
    setInputValue('');
    setOtp('');
  };
  
  const sidebarItems = [
    { name: 'Vitals', path: '/patients' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Alerts', path: '/alerts' },
    { name: 'Room View', path: '/room-view' },
    { name: 'Agent Chat', path: '/agent-chat' },
    { name: 'Family Chat', path: '/family-chat' },
    { name: 'Settings', path: '/settings' }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-outfit p-4 bg-cover bg-center" style={{ backgroundImage: "url('/bg.jpg')" }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 bg-neutral-900/80 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl backdrop-blur-xl">
          <div className="flex justify-center mb-6">
            <img src="/logo.jpg" alt="Logo" className="w-16 h-16 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">Sign in to AuraCare AI</h2>
          <p className="text-neutral-200 text-center text-sm mb-8">Secure access for authorized caregivers.</p>

          <AnimatePresence mode="wait">
            {authStep === 'phone' && (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <label className="text-sm text-neutral-200 block mb-1">
                  Mobile Number
                </label>
                
                <div className="flex gap-2">
                  <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 w-24">
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+49">🇩🇪 +49</option>
                  </select>
                  <input 
                    type="tel" 
                    placeholder="99309 12345"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                
                <button onClick={handleSendOtp} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition">
                  Send Verification Code
                </button>
                <div className="relative flex py-4 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-neutral-400 text-sm">or</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>
                <button onClick={handleGoogleLogin} className="w-full py-3 bg-white hover:bg-neutral-200 text-black rounded-xl font-bold transition flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Sign in with Google
                </button>

              </motion.div>
            )}

            {authStep === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <label className="text-sm text-neutral-200 block text-center mb-1">
                  Enter the code sent to {!inputValue.includes('@') ? countryCode : ""}{inputValue}
                </label>
                <input 
                  type="text" 
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-center tracking-widest text-2xl focus:outline-none focus:border-emerald-500"
                />
                <button onClick={handleVerifyOtp} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition">
                  Verify & Sign In
                </button>
                <button onClick={handleSendOtp} className="w-full py-2 text-emerald-400 text-sm hover:text-emerald-300 transition mt-2">Resend Code</button>
                <button onClick={() => setAuthStep('phone')} className="w-full py-2 text-neutral-300 text-sm hover:text-white transition">Cancel</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen text-neutral-100 font-outfit selection:bg-emerald-500/30 bg-cover bg-center bg-no-repeat fixed inset-0 overflow-y-auto"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/75 z-0"></div>
      
      {/* Sidebar / Navigation */}
      <nav className="fixed left-0 top-0 h-full w-72 bg-black/50 backdrop-blur-3xl border-r border-white/5 p-8 flex flex-col justify-between z-10 shadow-2xl">
        <div>
          <Link href="/patients" className="block">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-4 mb-14 cursor-pointer"
            >
              <img src="/logo.jpg" alt="AuraCare AI Logo" className="w-12 h-12 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">AuraCare AI</h1>
            </motion.div>
          </Link>
          
          <div className="space-y-3">
            {sidebarItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <Link key={item.name} href={item.path} passHref className="block">
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className={`w-full text-left block px-5 py-3.5 rounded-2xl transition-all duration-300 font-medium ${isActive ? 'bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-400 border-l-2 border-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' : 'text-neutral-200 hover:text-white hover:bg-white/5'}`}
                  >
                    {item.name}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="p-5 bg-gradient-to-br from-neutral-900/80 to-black/80 rounded-2xl border border-white/5 backdrop-blur-md shadow-lg relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl"></div>
            <div className="text-xs text-neutral-200 mb-3 uppercase tracking-widest font-semibold">Global Security</div>
            <div className="flex flex-col gap-2">
              <div className="text-xs font-medium flex items-center gap-2 text-neutral-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </span>
                HIPAA & SOC 2 Type II
              </div>
              <div className="text-xs font-medium flex items-center gap-2 text-neutral-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </span>
                GDPR Compliant
              </div>
              <div className="text-xs font-medium flex items-center gap-2 text-neutral-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </span>
                ISO 27001 Certified
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl border border-white/5 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(16,185,129,0.5)] uppercase">
                {userProfile?.name?.substring(0, 2) || 'US'}
              </div>
              <div>
                <div className="text-sm font-bold text-white truncate max-w-[100px]">{userProfile?.name || 'User'}</div>
                <div className="text-xs text-emerald-400">{userProfile?.role || 'Caregiver'}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="text-neutral-200 hover:text-white transition" title="Log out">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-72 p-10 relative z-10 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
