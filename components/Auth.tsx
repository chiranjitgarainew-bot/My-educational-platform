import React, { useState } from 'react';
import { User } from '../types';
import { BookOpen, AlertCircle, CheckCircle, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { userDb } from '../services/db';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'verify'>('login');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tempEmail, setTempEmail] = useState(''); // Stores email during verification step

  // --- LOGIN LOGIC ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const existingUser = await userDb.getUser(email);

      if (!existingUser) {
        setError('Account not found. Please Sign Up first.');
        setIsLoading(false);
        return;
      }

      if (existingUser.password !== password) {
        setError('Incorrect password. Please try again.');
        setIsLoading(false);
        return;
      }

      // Check Verification
      if (!existingUser.isVerified) {
          setError('Email not verified. We sent a code.');
          setTempEmail(email);
          setMode('verify');
          
          // Re-generate OTP for demo if lost (mock)
          if (!existingUser.verificationCode) {
              existingUser.verificationCode = '123456';
              await userDb.saveUser(existingUser);
          }
          
          setIsLoading(false);
          return;
      }

      // Security: Initiate Session (Generates Device ID & Kicks others)
      const sessionUser = await userDb.initiateSession(email);
      if (sessionUser) {
          onLogin(sessionUser);
      } else {
          setError('Failed to create session.');
      }

    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- SIGNUP LOGIC ---
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setIsLoading(false);
        return;
    }

    try {
        const existingUser = await userDb.getUser(email);
        if (existingUser) {
          setError('Account already exists. Please Log In.');
          setIsLoading(false);
          return;
        }

        // Mock OTP
        const verificationCode = '123456';

        const newUser: User = {
          id: Date.now().toString(),
          name: name,
          email: email,
          password: password,
          role: 'student',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`,
          isVerified: false,
          verificationCode: verificationCode,
          bio: 'New student at Your study platform',
          enrolledBatches: []
        };
        
        await userDb.saveUser(newUser);
        
        // Move to Verification
        setTempEmail(email);
        setMode('verify');
        setSuccess(`Account created! Use code ${verificationCode} to verify.`);
        
    } catch (err) {
        setError('Registration failed.');
    } finally {
        setIsLoading(false);
    }
  };

  // --- VERIFICATION LOGIC ---
  const handleVerify = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      const result = await userDb.verifyUserEmail(tempEmail, otp);
      
      if (result.success) {
          setSuccess('Verified! Logging you in...');
          
          // Auto login after verify
          setTimeout(async () => {
              const sessionUser = await userDb.initiateSession(tempEmail);
              if (sessionUser) onLogin(sessionUser);
          }, 1000);
      } else {
          setError(result.message);
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[100px] animate-float" style={{animationDelay: '2s'}}></div>

      <div className="glass w-full max-w-md rounded-3xl shadow-glass overflow-hidden relative z-10 p-8 border border-white/40 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-glow mb-4 rotate-3 hover:rotate-0 transition-all duration-300">
            {mode === 'verify' ? <ShieldCheck size={32} /> : <BookOpen size={32} />}
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join Us' : 'Verify Email'}
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium text-center">
            {mode === 'login' ? 'Secure login with Single Device protection' : 
             mode === 'signup' ? 'Start your journey securely' : 
             `Enter the code sent to ${tempEmail}`}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur text-red-600 text-xs font-bold rounded-xl flex items-center gap-2 border border-red-100 animate-pop">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50/80 backdrop-blur text-green-600 text-xs font-bold rounded-xl flex items-center gap-2 border border-green-100 animate-pop">
            <CheckCircle size={16} /> {success}
          </div>
        )}

        {/* --- VERIFY FORM --- */}
        {mode === 'verify' && (
             <form onSubmit={handleVerify} className="space-y-5">
                 <div className="text-center mb-4 p-3 bg-yellow-50 text-yellow-800 text-xs rounded-lg border border-yellow-100">
                     <p className="font-bold">Demo OTP: 123456</p>
                 </div>
                 <div className="group">
                    <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full text-center tracking-[1em] text-2xl py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold"
                        placeholder="______"
                        maxLength={6}
                    />
                 </div>
                 <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center"
                 >
                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                 </button>
                 <div className="text-center">
                    <button type="button" onClick={() => setMode('login')} className="text-sm text-gray-500 hover:text-indigo-600">Back to Login</button>
                 </div>
             </form>
        )}

        {/* --- LOGIN / SIGNUP FORM --- */}
        {mode !== 'verify' && (
        <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-5">
          {mode === 'signup' && (
            <div className="group">
              <div className="relative transition-all duration-300 transform group-hover:-translate-y-1">
                <UserIcon className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium"
                  placeholder="Full Name"
                />
              </div>
            </div>
          )}
          
          <div className="group">
             <div className="relative transition-all duration-300 transform group-hover:-translate-y-1">
              <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium"
                placeholder="Email Address"
              />
            </div>
          </div>

          <div className="group">
            <div className="relative transition-all duration-300 transform group-hover:-translate-y-1">
              <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium"
                placeholder="Password"
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex justify-center items-center gap-2 group"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm font-medium">
            {mode === 'login' ? "New to the platform? " : "Already have an account? "}
            <button
              onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError(null);
                  setSuccess(null);
              }}
              className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-colors"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;