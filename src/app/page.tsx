/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { logTelemetryToBigQuery, runVertexAITriage, fetchDashboardMetrics } from './actions';
import { auth, ConfirmationResult } from '@/lib/gcp/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import VitalsChart from '@/components/VitalsChart';

export default function Home() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [heartRate, setHeartRate] = useState(72);
  const [lastSynced, setLastSynced] = useState('Just now');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginMode, setLoginMode] = useState<'sms' | 'email'>('email');
  const [email, setEmail] = useState('demo@mvpvrn.ai');
  const [password, setPassword] = useState('demo123');
  const [authStep, setAuthStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  // Agent Chat State
  const [agentChatInput, setAgentChatInput] = useState('');
  const [agentMessages, setAgentMessages] = useState<any[]>([
    { role: 'ai', text: "Hello Dr. Smith. I am the Medical Triage Agent (powered by Gemini 1.5 Pro via ADK). I coordinate with the A2A network and MCP to fetch real-time and historical context. How can I assist you today?", source: "ADK / A2A Network", actions: [] },
    { role: 'user', text: "Why did the behavioral anomaly alert trigger 10 minutes ago?", source: null, actions: [] },
    { role: 'ai', text: "The alert triggered because her step count dropped 40% below her 30-day baseline. I used the MCP tool to query Qdrant vectors, and the Nano Banana tool to process the raw sensor feed. After correlating with ambient temperature sensors, I determined she simply went to bed 2 hours earlier than usual.", source: "Gemini 1.5 Pro + Nano Banana", actions: ['View Qdrant Vectors', 'Dismiss Alert'] }
  ]);

  // Family Chat State
  const [familyChatInput, setFamilyChatInput] = useState('');
  const [familyMessages, setFamilyMessages] = useState<any[]>([
    { role: 'md', author: 'Dr. Smith (Caregiver)', text: "Good morning. Jane's latest Qdrant telemetry indicates a minor deviation in her gait today. We are monitoring her closely, but her baseline vitals remain stable." },
    { role: 'ai', author: 'AI Translator (Gemini)', text: "The doctor says Jane is walking slightly differently today, but her heart rate and other health signs are completely normal. There is no immediate cause for concern.", isTranslation: true },
    { role: 'family', author: 'Family Member', text: "Thank you! Is it okay if we visit her around 4 PM today?" },
    { role: 'md', author: 'Dr. Smith (Caregiver)', text: "Yes, 4 PM is perfect." }
  ]);

  // Real-time Patients Simulation (Mocking IoT Stream)
  const [patients, setPatients] = useState([
    { id: 'p1', name: 'Jane Doe', age: 82, status: 'Critical', lastActive: 'Just now', image: 'JD', vitals: { hr: 110, o2: 89, temp: 101.2 } },
    { id: 'p2', name: 'Robert Smith', age: 76, status: 'Stable', lastActive: '1 hr ago', image: 'RS', vitals: { hr: 72, o2: 98, temp: 98.6 } },
    { id: 'p3', name: 'Mary Johnson', age: 88, status: 'Review', lastActive: '15 mins ago', image: 'MJ', vitals: { hr: 85, o2: 95, temp: 99.1 } },
    { id: 'p4', name: 'William Brown', age: 91, status: 'Stable', lastActive: '3 hrs ago', image: 'WB', vitals: { hr: 68, o2: 99, temp: 98.4 } },
  ]);

  useEffect(() => {
    if (activeTab !== 'Patients') return;
    
    // Simulate real-time streaming updates from IoT sensors every 4 seconds
    const interval = setInterval(() => {
      setPatients(prev => prev.map(p => {
        const r = Math.random();
        
        // Clone patient to mutate
        const newPatient = { ...p, vitals: { ...p.vitals } };
        
        // 1. Simulate real-time fluctuating vitals (IoT streaming)
        if (r > 0.3) {
          newPatient.vitals.hr += Math.floor(Math.random() * 5) - 2; // fluctuate -2 to +2
          newPatient.vitals.o2 = Math.min(100, Math.max(80, newPatient.vitals.o2 + (Math.floor(Math.random() * 3) - 1)));
          newPatient.vitals.temp = parseFloat((newPatient.vitals.temp + (Math.random() * 0.4 - 0.2)).toFixed(1));
        }

        // 2. Randomly update last active time
        if (r > 0.6) {
          newPatient.lastActive = `${Math.floor(Math.random() * 59) + 1} mins ago`;
        } 
        
        // 3. Simulate Robert Smith having a sudden anomaly
        if (r > 0.85 && p.id === 'p2') {
          newPatient.status = p.status === 'Stable' ? 'Review' : 'Stable';
        }
        
        return newPatient;
      }));
    }, 4000);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  const loadMetrics = async () => {
    setIsRefreshing(true);
    const res = await fetchDashboardMetrics();
    if (res.success && res.avgHeartRate) {
      setHeartRate(res.avgHeartRate);
    }
    setIsRefreshing(false);
  };

  const handleAgentChatSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!agentChatInput.trim()) return;
    
    const newMsg = agentChatInput;
    setAgentMessages(prev => [...prev, { role: 'user', text: newMsg, source: null, actions: [] }]);
    setAgentChatInput('');
    
    // Simulate dynamic multi-agent processing pipeline
    setTimeout(() => {
      // 1. Initial acknowledgment (A2A Network routing)
      setAgentMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Routing query to the Clinical Context Agent...", 
        source: "A2A Router", 
        actions: [] 
      }]);
      
      // 2. Simulated Vertex AI response via MCP
      setTimeout(() => {
        let responseText = "I have cross-referenced the latest real-time IoT ingestion streams. Her vitals remain stable, and there are no immediate critical deviations detected.";
        let source = "Gemini 1.5 Pro + BigQuery";
        let actions = ["Acknowledge", "Escalate"];

        if (newMsg.toLowerCase().includes('haptic') || newMsg.toLowerCase().includes('wearable') || newMsg.toLowerCase().includes('sensor')) {
          responseText = "I've pulled the high-frequency haptic sensor data from the Edge node. The micro-tremor analysis indicates normal gait patterns, ruling out any immediate fall risk.";
          source = "Edge Agent + MCP";
          actions = ["View Micro-Tremor Graph", "Log Note"];
        } else if (newMsg.toLowerCase().includes('video') || newMsg.toLowerCase().includes('camera')) {
          responseText = "I requested video analysis from the Vision Agent. The Gemini 1.5 Pro multimodal model confirms she is resting comfortably in the living room.";
          source = "Vision Agent (A2A)";
          actions = ["View Frame", "Dismiss"];
        }
        
        // Replace the routing message with the final response
        setAgentMessages(prev => {
          const filtered = prev.filter(msg => msg.text !== "Routing query to the Clinical Context Agent...");
          return [...filtered, { role: 'ai', text: responseText, source, actions }];
        });
      }, 2500);
    }, 500);
  };

  const [familyTyping, setFamilyTyping] = useState(false);

  const familyMembers = [
    { name: 'Sarah (Daughter)', avatar: 'S', color: 'from-purple-400 to-pink-500' },
    { name: 'Michael (Son)', avatar: 'M', color: 'from-blue-400 to-indigo-500' },
    { name: 'Priya (Niece)', avatar: 'P', color: 'from-orange-400 to-rose-500' },
  ];

  const familySuggestions = [
    "How is Jane doing today?",
    "Any changes in her medication?",
    "Can we visit her this weekend?",
    "Was she eating properly?",
    "Did she sleep well last night?",
    "Is the mobility issue improving?",
  ];

  const handleFamilyChatSubmit = (e?: React.FormEvent, prefill?: string) => {
    if (e) e.preventDefault();
    const msg = prefill || familyChatInput;
    if (!msg.trim()) return;
    
    const newMessage = { role: 'md', author: 'Dr. Smith (Caregiver)', text: msg };
    setFamilyMessages(prev => [...prev, newMessage]);
    setFamilyChatInput('');
    setFamilyTyping(true);
    
    // Smart AI Translation based on keyword detection
    setTimeout(() => {
      let translation = `The doctor says: "${msg}" — everything is being monitored carefully.`;
      
      if (msg.toLowerCase().includes('mobility') || msg.toLowerCase().includes('walking') || msg.toLowerCase().includes('gait')) {
        translation = `The doctor says Jane's walking ability is being closely monitored by an AI sensor. There is nothing to panic about right now.`;
      } else if (msg.toLowerCase().includes('medication') || msg.toLowerCase().includes('medicine') || msg.toLowerCase().includes('drug')) {
        translation = `The doctor is updating Jane's medication plan. This is routine and will help her feel better.`;
      } else if (msg.toLowerCase().includes('sleep') || msg.toLowerCase().includes('rest')) {
        translation = `The doctor says Jane's sleep patterns are being tracked overnight by AI wearable sensors. She is getting some rest.`;
      } else if (msg.toLowerCase().includes('heart') || msg.toLowerCase().includes('vital') || msg.toLowerCase().includes('rate')) {
        translation = `The doctor says Jane's heart rate is being monitored in real-time. Current readings are within an acceptable range.`;
      } else if (msg.toLowerCase().includes('visit') || msg.toLowerCase().includes('come')) {
        translation = `The doctor is saying it is okay to visit. Please coordinate a time that works well so Jane is rested.`;
      } else if (msg.toLowerCase().includes('eat') || msg.toLowerCase().includes('food') || msg.toLowerCase().includes('appetite')) {
        translation = `The doctor says Jane's food intake and appetite are being logged daily. The caregivers are ensuring she eats properly.`;
      }

      setFamilyMessages(prev => [...prev, { 
        role: 'ai', 
        author: 'AI Translator (Gemini)',
        text: translation,
        isTranslation: true
      }]);

      // Randomized family member replies
      setTimeout(() => {
        setFamilyTyping(false);
        const member = familyMembers[Math.floor(Math.random() * familyMembers.length)];
        
        const contextReplies: Record<string, string[]> = {
          mobility: ["Oh okay, that's a relief!", "Thank you for the explanation, we were worried about her walking.", "Is there anything we can do to help at home?"],
          medication: ["Got it, should we pick up anything from the pharmacy?", "Understood, we'll make sure she takes them on time during our visit.", "Thanks for letting us know!"],
          sleep: ["She mentioned she's been having trouble sleeping. Good to know it's being tracked!", "We'll make sure not to call her too late then.", "Understood, thank you!"],
          heart: ["That's reassuring to hear.", "Should we be worried or is this normal for her age?", "We appreciate you keeping us updated!"],
          visit: ["Perfect! We were thinking Saturday afternoon works for us.", "Great, we will coordinate and let you know.", "Thank you doctor, we will be there!"],
          default: ["Got it, thank you for the update!", "We appreciate you keeping the family in the loop.", "Understood, please keep us posted!", "Thanks Dr. Smith, we trust you are taking good care of her!"],
        };
        
        let replyPool = contextReplies.default;
        if (msg.toLowerCase().includes('mobility') || msg.toLowerCase().includes('walking')) replyPool = contextReplies.mobility;
        else if (msg.toLowerCase().includes('medication') || msg.toLowerCase().includes('medicine')) replyPool = contextReplies.medication;
        else if (msg.toLowerCase().includes('sleep')) replyPool = contextReplies.sleep;
        else if (msg.toLowerCase().includes('heart') || msg.toLowerCase().includes('vital')) replyPool = contextReplies.heart;
        else if (msg.toLowerCase().includes('visit') || msg.toLowerCase().includes('come')) replyPool = contextReplies.visit;
        
        const randomReply = replyPool[Math.floor(Math.random() * replyPool.length)];
        
        setFamilyMessages(prev => [...prev, { 
          role: 'family', 
          author: member.name,
          avatar: member.avatar,
          color: member.color,
          text: randomReply 
        }]);
      }, 2000);
    }, 1500);
  };

  const handleAlertAction = (alert: any) => {
    setActiveTab('Agent Chat');
    const prompt = `Run AI triage and action protocol for alert: ${alert.id} (${alert.type}) for ${alert.patient}.`;
    
    setAgentMessages(prev => [...prev, { role: 'user', text: prompt, source: null, actions: [] }]);
    
    // Simulate dynamic multi-agent processing pipeline
    setTimeout(() => {
      setAgentMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Routing triage request to Medical Triage Agent...", 
        source: "A2A Router", 
        actions: [] 
      }]);
      
      setTimeout(() => {
        setAgentMessages(prev => {
          const filtered = prev.filter(m => m.source !== "A2A Router");
          return [...filtered, {
            role: 'ai',
            text: `I have analyzed Alert ${alert.id}. Cross-referencing ${alert.source} with historical baselines indicates immediate caregiver intervention is required. I have flagged ${alert.patient}'s profile for priority review and drafted an incident report.`,
            source: "Medical Triage Agent — Gemini 1.5 Pro",
            actions: ["View Patient History", "Escalate to Doctor"]
          }];
        });
      }, 2500);
    }, 400);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Demo fallback for quick testing
      if (email === 'demo@mvpvrn.ai' && password === 'demo123') {
        setIsAuthenticated(true);
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error("Email login error:", error);
      alert(`Login failed: ${error.message || "Please check your credentials."}`);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Using API Key:", auth.app.options.apiKey?.substring(0, 10) + "...");

      // Step 1: Destroy the old verifier instance cleanly
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (_) {
          console.warn("Could not clear old recaptcha verifier.");
        }
        (window as any).recaptchaVerifier = null;
      }

      // Step 2: Reset the global grecaptcha widget if it was previously rendered
      try {
        if (typeof (window as any).grecaptcha !== 'undefined' && typeof (window as any).grecaptcha.reset === 'function') {
          (window as any).grecaptcha.reset();
        }
      } catch (_) { /* gracefully ignore if widget wasn't rendered */ }

      // Step 3: Replace the DOM node entirely — Firebase tracks by element identity,
      // not innerHTML, so a fresh cloneNode is the only bulletproof reset.
      const container = document.getElementById('recaptcha-container');
      if (container && container.parentNode) {
        const fresh = document.createElement('div');
        fresh.id = 'recaptcha-container';
        container.parentNode.replaceChild(fresh, container);
      }

      // Step 4: Create a brand-new RecaptchaVerifier on the fresh element
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      const recaptchaVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setAuthStep('otp');
    } catch (error: any) {
      console.error("Firebase SMS error:", error);
      alert(`Failed to send SMS OTP: ${error.message || "Unknown error"}`);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmationResult) {
      try {
        await confirmationResult.confirm(otp);
        setIsAuthenticated(true);
      } catch (error: any) {
        console.error("OTP Verification error:", error);
        alert(`Invalid OTP: ${error.message || "Please try again."}`);
      }
    } else {
      alert("Please request an OTP first.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMetrics();
    const interval = setInterval(() => {
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-[#050505] text-white items-center justify-center relative overflow-hidden font-outfit">
        {/* Animated Background Gradients */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-900/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-900/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none"
        />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 w-full max-w-md p-10 bg-black/50 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-4 mb-10 justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              src="/logo.jpg" 
              alt="MVP VRN Logo" 
              className="w-12 h-12 rounded-full shadow-[0_0_25px_rgba(52,211,153,0.5)]" 
            />
            <h1 className="text-4xl font-bold tracking-tight">MVP <span className="text-emerald-500">VRN</span></h1>
          </div>

          <h2 className="text-2xl font-semibold mb-6 text-center text-neutral-200">Secure Access</h2>
          <div id="recaptcha-container"></div>
          
          <div className="flex bg-black/40 p-1 rounded-xl mb-6 border border-white/5">
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMode === 'email' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
              onClick={() => setLoginMode('email')}
            >
              Email Login
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMode === 'sms' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
              onClick={() => setLoginMode('sms')}
            >
              SMS OTP
            </button>
          </div>

          {loginMode === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@mvpvrn.ai" 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
              <button type="submit" className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all">
                Sign In Securely
              </button>
            </form>
          ) : authStep === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000" 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
              <button type="submit" className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all">
                Send SMS OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Enter OTP</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456" 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors tracking-widest text-center text-xl"
                  required
                />
              </div>
              <button type="submit" className="w-full py-3 mt-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
                Verify & Login
              </button>
            </form>
          )}
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
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-4 mb-14 cursor-pointer"
            onClick={() => setActiveTab('Dashboard')}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="MVP VRN Logo" className="w-12 h-12 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">MVP VRN</h1>
          </motion.div>
          
          <div className="space-y-3">
            {['Dashboard', 'Analytics', 'Patients', 'Alerts', 'Room View', 'Agent Chat', 'Family Chat', 'Settings'].map((item) => (
              <motion.button 
                whileHover={{ x: 5 }}
                key={item} 
                onClick={() => setActiveTab(item)}
                className={`w-full text-left block px-5 py-3.5 rounded-2xl transition-all duration-300 font-medium ${activeTab === item ? 'bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-400 border-l-2 border-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
              >
                {item}
              </motion.button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="p-5 bg-gradient-to-br from-neutral-900/80 to-black/80 rounded-2xl border border-white/5 backdrop-blur-md shadow-lg relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl"></div>
            <div className="text-xs text-neutral-400 mb-2 uppercase tracking-widest font-semibold">Security Status</div>
            <div className="text-sm font-medium flex items-center gap-3 text-white">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"></span>
              </span>
              HIPAA Compliant
            </div>
          </div>
          
          <div className="p-4 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl border border-white/5 backdrop-blur-md cursor-pointer flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                DR
              </div>
              <div>
                <div className="text-sm font-bold text-white">Dr. Smith</div>
                <div className="text-xs text-emerald-400">Primary Caregiver</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-72 p-10 relative z-10 max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-4xl font-bold tracking-tight drop-shadow-lg">{activeTab}</h2>
            {activeTab === 'Dashboard' && (
              <p className="text-neutral-400 text-sm mt-2 flex items-center gap-2 drop-shadow-md font-medium">
                Monitoring Jane Doe (Age 82) <span className="text-neutral-600">•</span> <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> Last synced: {lastSynced}
              </p>
            )}
          </motion.div>
          <button 
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-full text-sm transition-all duration-300 shadow-lg"
          >
            Export Report
          </button>
        </header>

        <AnimatePresence mode="wait">
        {activeTab === 'Dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Alerts Section (Mastra/Qdrant integration point) */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="mb-10 p-8 bg-gradient-to-r from-red-950/60 to-red-900/20 border border-red-500/30 rounded-[2rem] backdrop-blur-2xl shadow-[0_15px_40px_rgba(220,38,38,0.2)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
              <div className="flex items-center gap-4 mb-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]"></span>
                </span>
                <h3 className="text-red-400 font-bold text-xl tracking-wide">Behavioral Anomaly Detected</h3>
              </div>
              <p className="text-neutral-200 text-base leading-relaxed max-w-3xl">
                AI Agent (Mastra) has detected a <strong className="text-white">40% decrease in mobility</strong> compared to the historical baseline (Qdrant vector analysis) over the last 48 hours.
              </p>
            </motion.div>

            {/* Hardware SOS Panic Button Simulation */}
            <div className="mb-8 flex justify-end">
              <button 
                onClick={async () => {
                  alert('🚨 SOS PANIC BUTTON TRIGGERED! 🚨\nReal-time escalation sequence initiated via Cloud Run. Caregivers and Family Chat notified immediately.');
                  const res = await logTelemetryToBigQuery('patient_01', 'SOS_PANIC_TRIGGERED');
                  console.log('Successfully logged SOS to BigQuery:', res);
                  loadMetrics();
                }}
                className="group relative px-6 py-4 bg-red-600 hover:bg-red-500 rounded-full text-white font-bold tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.6)] hover:shadow-[0_0_35px_rgba(239,68,68,0.8)] transition-all duration-300 border-2 border-red-400/50 flex items-center gap-3"
              >
                <div className="absolute inset-0 bg-red-400/20 rounded-full animate-ping opacity-75"></div>
                <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <span className="relative z-10">SIMULATE SOS PANIC</span>
              </button>
            </div>

            {/* Vertex AI Agent Trigger Simulation */}
            <div className="mb-8 flex justify-end">
              <button 
                onClick={async () => {
                  alert('🧠 Triggering Vertex AI Triage Agent... Check console or UI for response.');
                  const res = await runVertexAITriage('patient_01', [{ value: 30, type: 'mobility' }]);
                  console.log('Vertex AI Triage Result:', res);
                  if (res.success && res.result) {
                    const result = res.result as any;
                    alert(`Vertex AI Response:\nDecision: ${result.decision || result.status}\nPriority: ${result.priority || 'N/A'}\nSummary: ${result.summary || 'Normal Baseline'}`);
                    loadMetrics();
                  } else {
                    alert(`Vertex AI Triage Failed:\n${res.error || 'Unknown Error'}\n\nThis usually happens if your Google Cloud Project hasn't enabled billing or if the Vertex AI API quota is exceeded.`);
                  }
                }}
                className="group relative px-6 py-4 bg-purple-600 hover:bg-purple-500 rounded-full text-white font-bold tracking-widest shadow-[0_0_20px_rgba(147,51,234,0.6)] hover:shadow-[0_0_35px_rgba(168,85,247,0.8)] transition-all duration-300 border-2 border-purple-400/50 flex items-center gap-3"
              >
                <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-pulse opacity-75"></div>
                <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <span className="relative z-10">RUN VERTEX AI TRIAGE</span>
              </button>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {[
                { label: 'Heart Rate Avg (BigQuery SQL)', value: isRefreshing ? '...' : `${heartRate} bpm`, trend: '+2%', color: 'from-rose-500 to-pink-600' },
                { label: 'Sleep Duration', value: '6h 45m', trend: '-15%', color: 'from-cyan-500 to-blue-600' },
                { label: 'Mobility Index', value: 'Low', trend: '-40%', color: 'from-amber-400 to-orange-600' },
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="p-8 bg-black/50 backdrop-blur-2xl border border-white/5 rounded-[2rem] relative overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                >
                  <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${stat.color} opacity-20 rounded-full blur-3xl group-hover:opacity-40 transition-opacity duration-500`}></div>
                  <div className="text-neutral-400 text-sm mb-3 font-medium uppercase tracking-wider">{stat.label}</div>
                  <div className="text-4xl font-bold mb-5 text-white drop-shadow-md">
                    {isRefreshing ? (
                      <div className="h-10 w-24 bg-white/10 rounded animate-pulse"></div>
                    ) : stat.value}
                  </div>
                  <div className={`text-sm font-bold tracking-wide ${stat.trend.startsWith('-') ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {stat.trend} <span className="text-neutral-500 font-medium">from last week</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'Analytics' && (
          <motion.div
            key="Analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Analytics & Trends</h2>
                <p className="text-neutral-400 mt-1">Deep dive into historical patient data using BigQuery</p>
              </div>
            </div>

            <VitalsChart />
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-neutral-400 mb-2">30-Day Average Mobility</h3>
                <div className="text-3xl font-bold text-white">76% <span className="text-sm text-red-500 font-normal ml-2">↓ 4%</span></div>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-neutral-400 mb-2">Sleep Efficiency</h3>
                <div className="text-3xl font-bold text-white">82% <span className="text-sm text-emerald-500 font-normal ml-2">↑ 2%</span></div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'Patients' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
            {patients.map((patient) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={patient.id} 
                className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl relative overflow-hidden group hover:border-white/30 hover:bg-black/50 transition-all shadow-xl flex flex-col"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${patient.status === 'Critical' ? 'from-red-500 to-rose-600' : patient.status === 'Review' ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-teal-500'} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`}></div>
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl font-medium text-white border border-white/20">
                    {patient.image}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{patient.name}</h3>
                    <p className="text-sm text-neutral-400">Age: {patient.age}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-6 relative z-10 text-sm">
                  <span className="text-neutral-400">Status</span>
                  <motion.span 
                    key={patient.status}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${patient.status === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : patient.status === 'Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
                  >
                    {patient.status}
                  </motion.span>
                </div>
                
                <div className="flex justify-between items-center mb-4 relative z-10 text-sm">
                  <span className="text-neutral-400">Last Active</span>
                  <motion.span 
                    key={patient.lastActive}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-200"
                  >
                    {patient.lastActive}
                  </motion.span>
                </div>

                {/* Simulated Real-Time IoT Vitals */}
                <div className="grid grid-cols-3 gap-2 mb-6 relative z-10 text-center bg-black/20 rounded-xl p-3 border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Heart</span>
                    <motion.span 
                      key={patient.vitals.hr}
                      initial={{ scale: 1.1, color: '#ef4444' }}
                      animate={{ scale: 1, color: '#e5e5e5' }}
                      transition={{ duration: 0.5 }}
                      className="font-mono font-medium text-sm"
                    >
                      {patient.vitals.hr} <span className="text-[10px] text-neutral-600">bpm</span>
                    </motion.span>
                  </div>
                  <div className="flex flex-col border-l border-r border-white/5">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">SpO2</span>
                    <motion.span 
                      key={patient.vitals.o2}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      className="font-mono font-medium text-sm"
                    >
                      {patient.vitals.o2}<span className="text-[10px] text-neutral-600">%</span>
                    </motion.span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Temp</span>
                    <motion.span 
                      key={patient.vitals.temp}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      className="font-mono font-medium text-sm"
                    >
                      {patient.vitals.temp}°<span className="text-[10px] text-neutral-600">F</span>
                    </motion.span>
                  </div>
                </div>
                
                <div className="mt-auto relative z-10">
                  <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors">
                    View Full Profile
                  </button>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'Alerts' && (
          <div className="space-y-4">
            {[
              { id: 'AL-901', patient: 'Jane Doe', type: 'Behavioral Anomaly', time: '10 mins ago', severity: 'High', source: 'Qdrant / Mastra', details: 'Mobility index dropped 40% below historical baseline. Escalated to Medical Triage Agent.' },
              { id: 'AL-902', patient: 'William Brown', type: 'Emotional Distress', time: '1 hr ago', severity: 'Critical', source: 'Voice AI / Sentiment Agent', details: 'High tremor and flattened pitch detected in voice. Transcript implies confusion about medication.' },
              { id: 'AL-903', patient: 'Mary Johnson', type: 'Irregular Sleep', time: '3 hrs ago', severity: 'Medium', source: 'IoT Wearable', details: 'Sleep duration significantly shorter than weekly average. Observation recommended.' },
            ].map((alert) => (
              <div key={alert.id} className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl relative overflow-hidden group hover:bg-black/60 transition-all shadow-lg flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${alert.severity === 'Critical' ? 'bg-red-500' : alert.severity === 'High' ? 'bg-orange-500' : 'bg-amber-400'}`}></div>
                
                <div className="flex-1 ml-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${alert.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : alert.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                      {alert.severity}
                    </span>
                    <span className="text-neutral-400 text-sm font-mono">{alert.id}</span>
                    <span className="text-neutral-500 text-sm ml-auto">{alert.time}</span>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">{alert.type} - {alert.patient}</h3>
                  <p className="text-neutral-300 text-sm mb-2">{alert.details}</p>
                  <div className="text-xs text-neutral-500 font-medium">Source: {alert.source}</div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                  <button className="flex-1 md:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors">
                    Acknowledge
                  </button>
                  <button 
                    onClick={() => handleAlertAction(alert)}
                    className="flex-1 md:flex-none px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Take Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity Settings */}
            <div className="p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-medium text-white mb-6">Security & Identity</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-neutral-400 block mb-2">Connected DID (Enkrypt)</label>
                  <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold">DID</div>
                    <span className="text-sm text-neutral-300 font-mono truncate">did:ethr:0x39fa8a2...</span>
                    <button className="ml-auto text-xs text-emerald-400 font-medium">Verified</button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">HIPAA Audit Logging</div>
                    <div className="text-xs text-neutral-400">Log all PHI access to GCP Cloud Audit Logs</div>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 bottom-1 w-4 bg-white rounded-full shadow"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Preferences */}
            <div className="p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-10 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-medium text-white mb-6">AI Agent Preferences</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Multimodal Processing</div>
                    <div className="text-xs text-neutral-400">Enable Voice AI & Sentiment Analysis</div>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 bottom-1 w-4 bg-white rounded-full shadow"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Agent-to-Agent (A2A)</div>
                    <div className="text-xs text-neutral-400">Allow agents to autonomously share tools</div>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 bottom-1 w-4 bg-white rounded-full shadow"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Room View' && (
          <div className="flex flex-col gap-6">
            <div className="p-1 bg-gradient-to-br from-emerald-500/50 to-blue-500/50 rounded-3xl overflow-hidden shadow-2xl relative group">
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <span className="px-3 py-1 bg-red-500/80 backdrop-blur-md rounded-full text-xs font-bold text-white flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> LIVE
                </span>
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/20">
                  Cam 01: Living Room
                </span>
              </div>
              <div className="absolute bottom-4 left-4 z-20">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
                  Gemini 1.5 Pro Video Analysis Active
                </span>
              </div>
              
              {/* Simulated Camera Feed with Analysis Overlays */}
              <div className="w-full h-[600px] bg-black rounded-[22px] relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('/camera_feed.jpg')" }}>
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Gemini Bounding Box Simulation */}
                <div className="absolute top-1/4 left-1/3 w-1/3 h-1/2 border-2 border-emerald-400/80 rounded-xl bg-emerald-400/10 shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-all duration-1000 ease-in-out">
                  <div className="absolute -top-7 left-0 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-t-md">
                    Subject Detected (Jane Doe)
                  </div>
                  <div className="absolute -bottom-10 left-0 right-0 flex gap-2">
                    <span className="px-2 py-1 bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-xs rounded-md">Posture: Stable</span>
                    <span className="px-2 py-1 bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-xs rounded-md">Fall Risk: 2%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl">
                <h3 className="text-lg font-medium text-white mb-4">Real-time Multimodal Logs</h3>
                <div className="space-y-3 font-mono text-xs text-neutral-400 h-40 overflow-y-auto pr-2">
                  <div className="flex gap-3"><span className="text-emerald-500">14:02:11</span> <span>[Gemini] Frame 4022 processed. No hazards detected in walking path.</span></div>
                  <div className="flex gap-3"><span className="text-emerald-500">14:02:12</span> <span>[Voice AI] Spatial audio analysis: Normal ambient noise level. No vocal distress identified.</span></div>
                  <div className="flex gap-3"><span className="text-emerald-500">14:02:14</span> <span>[Mastra] Correlating video posture with Qdrant historical baseline... Normal.</span></div>
                  <div className="flex gap-3"><span className="text-emerald-500">14:02:15</span> <span>[Gemini] Frame 4026 processed. Subject sitting down. Posture stable.</span></div>
                </div>
              </div>
              <div className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl">
                <h3 className="text-lg font-medium text-white mb-4">Sentiment & Environment</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-sm text-neutral-300">Voice AI Sentiment</span><span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/30">Calm (92%)</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-neutral-300">Vocal Tremor Index</span><span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/30">Low Risk</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-neutral-300">Lighting</span><span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/30">Adequate</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-neutral-300">Room Temp</span><span className="text-sm font-medium text-white">72°F</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Agent Chat' && (
          <div className="flex flex-col h-[70vh] bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <div>
                  <h3 className="text-white font-medium">Medical Triage Agent</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online & Context-Aware</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {agentMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${msg.role === 'user' ? 'bg-emerald-600 rounded-2xl rounded-tr-sm text-white shadow-lg' : 'bg-white/10 border border-white/10 rounded-2xl rounded-tl-sm text-neutral-200'} p-4 text-sm`}>
                    <p className={msg.source || msg.actions?.length ? "mb-2" : ""}>{msg.text}</p>
                    
                    {msg.source && (
                      <p className="text-xs text-neutral-400 font-mono bg-black/40 p-2 rounded-lg border border-white/5">Source: {msg.source}</p>
                    )}
                    
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {msg.actions.map((action: string) => (
                          <button key={action} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium hover:bg-white/10 transition-colors">{action}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Quick-send Agent Suggestion Chips */}
            <div className="px-4 py-2 border-t border-white/5 flex gap-2 overflow-x-auto scrollbar-none">
              {[
                { label: "🩺 Check vitals now", prompt: "Are her vitals stable right now?" },
                { label: "📡 Haptic sensor report", prompt: "What do the haptic wearable sensors say about Jane's mobility today?" },
                { label: "📷 Camera feed", prompt: "Can you check the living room camera video feed?" },
                { label: "⚠️ Why did alert trigger?", prompt: "Why did the behavioral anomaly alert trigger 10 minutes ago?" },
                { label: "💤 Sleep analysis", prompt: "How was her sleep last night compared to baseline?" },
                { label: "🧠 Run AI triage", prompt: "Run a full AI triage report on Jane Doe right now." },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => {
                    setAgentMessages(prev => [...prev, { role: 'user', text: chip.prompt, source: null, actions: [] }]);
                    
                    setTimeout(() => {
                      setAgentMessages(prev => [...prev, { role: 'ai', text: "Routing query to the Clinical Context Agent...", source: "A2A Router", actions: [] }]);
                      setTimeout(() => {
                        let responseText = "I have cross-referenced the latest real-time IoT ingestion streams. Her vitals remain stable, and there are no immediate critical deviations detected.";
                        let source = "Gemini 1.5 Pro + BigQuery";
                        let actions = ["Acknowledge", "Escalate"];
                        if (chip.prompt.toLowerCase().includes('haptic') || chip.prompt.toLowerCase().includes('mobility')) {
                          responseText = "I've pulled the high-frequency haptic sensor data from the Edge node. The micro-tremor analysis indicates normal gait patterns, ruling out any immediate fall risk.";
                          source = "Edge Agent + MCP"; actions = ["View Micro-Tremor Graph", "Log Note"];
                        } else if (chip.prompt.toLowerCase().includes('camera') || chip.prompt.toLowerCase().includes('video')) {
                          responseText = "I requested video analysis from the Vision Agent. The Gemini 1.5 Pro multimodal model confirms she is resting comfortably in the living room.";
                          source = "Vision Agent (A2A)"; actions = ["View Frame", "Dismiss"];
                        } else if (chip.prompt.toLowerCase().includes('alert') || chip.prompt.toLowerCase().includes('anomaly')) {
                          responseText = "The alert triggered because her step count dropped 40% below her 30-day baseline. I used the MCP tool to query Qdrant vectors and determined she simply went to bed 2 hours earlier than usual.";
                          source = "Gemini 1.5 Pro + Nano Banana"; actions = ["View Qdrant Vectors", "Dismiss Alert"];
                        } else if (chip.prompt.toLowerCase().includes('sleep')) {
                          responseText = "BigQuery sleep logs show 5h 12m vs a 7h 30m baseline. The Edge wearable detected 3 micro-wake events. Recommend reviewing medication schedule for late-evening stimulants.";
                          source = "BigQuery + ADK"; actions = ["View Sleep Chart", "Flag for Review"];
                        } else if (chip.prompt.toLowerCase().includes('triage')) {
                          responseText = "Full AI Triage complete. Heart Rate: 89 bpm (elevated). SpO₂: 97% (normal). Mobility Index: Low (-40% from baseline). Recommendation: Initiate Caregiver Review Protocol.";
                          source = "Medical Triage Agent — Gemini 1.5 Pro"; actions = ["Initiate Protocol", "Export Report"];
                        }
                        setAgentMessages(prev => {
                          const filtered = prev.filter(m => m.text !== "Routing query to the Clinical Context Agent...");
                          return [...filtered, { role: 'ai', text: responseText, source, actions }];
                        });
                      }, 2500);
                    }, 500);
                  }}
                  className="shrink-0 text-xs px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full hover:bg-emerald-500/20 transition-colors whitespace-nowrap"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-white/10 bg-white/5">
              <form onSubmit={handleAgentChatSubmit} className="relative">
                <input 
                  type="text" 
                  value={agentChatInput}
                  onChange={(e) => setAgentChatInput(e.target.value)}
                  placeholder="Ask the Medical Triage Agent..." 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <button type="submit" className="absolute right-2 top-2 p-1.5 bg-emerald-500 rounded-lg text-white shadow-md hover:bg-emerald-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
              </form>
            </div>
          </div>
        )}


        {activeTab === 'Family Chat' && (
          <div className="flex flex-col h-[75vh] bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <div>
                  <h3 className="text-white font-medium">Family Collaboration Hub</h3>
                  <p className="text-xs text-purple-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span> Sarah, Michael & Priya Online</p>
                </div>
              </div>
              <span className="text-xs text-neutral-500 bg-black/30 border border-white/5 px-3 py-1 rounded-full">🔒 HIPAA Secure</span>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5">
              <div className="flex justify-center">
                <span className="text-xs text-neutral-500 bg-white/5 px-3 py-1 rounded-full">Today — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </div>
              
              {familyMessages.map((msg, i) => {
                if (msg.role === 'family') {
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-neutral-500 mr-1">{msg.author || 'Family Member'}</span>
                        <div className="flex items-end gap-2">
                          <div className="max-w-[70%] bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl rounded-tr-sm p-4 text-sm text-white shadow-lg">
                            {msg.text}
                          </div>
                          <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${msg.color || 'from-purple-400 to-pink-500'} flex items-center justify-center text-xs font-bold text-white shrink-0`}>{msg.avatar || 'F'}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                } else if (msg.role === 'ai') {
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-white mt-1 shrink-0">AI</div>
                        <div className="max-w-[80%]">
                          <div className="text-xs text-emerald-400 mb-1 ml-1">{msg.author}</div>
                          <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl rounded-tl-sm p-3 text-sm text-emerald-100">
                            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">✨ AI Translation</span>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                } else {
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold text-white mt-1 shrink-0">MD</div>
                        <div className="max-w-[80%]">
                          <div className="text-xs text-neutral-400 mb-1 ml-1">{msg.author}</div>
                          <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-sm p-3 text-sm text-neutral-200">
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
              })}
              
              {/* Typing Indicator */}
              {familyTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-400 to-pink-500 flex items-center justify-center text-xs font-bold text-white mt-1 shrink-0">F</div>
                    <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-sm p-3 flex items-center gap-1">
                      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Quick-send Suggestion Chips */}
            <div className="px-4 py-2 border-t border-white/5 flex gap-2 overflow-x-auto scrollbar-none">
              {familySuggestions.map((s) => (
                <button 
                  key={s} 
                  onClick={() => handleFamilyChatSubmit(undefined, s)}
                  className="shrink-0 text-xs px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full hover:bg-purple-500/20 transition-colors whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <form onSubmit={handleFamilyChatSubmit} className="relative">
                <input 
                  type="text" 
                  value={familyChatInput}
                  onChange={(e) => setFamilyChatInput(e.target.value)}
                  placeholder="Message Family Chat as Dr. Smith..." 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <button type="submit" className="absolute right-2 top-2 p-1.5 bg-purple-500 rounded-lg text-white shadow-md hover:bg-purple-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
