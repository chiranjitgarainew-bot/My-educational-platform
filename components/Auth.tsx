import React, { useState } from 'react';
import { User } from '../types';
import { BookOpen, AlertCircle, CheckCircle, Mail, Lock, User as UserIcon, Chrome } from 'lucide-react';
import { userDb } from '../services/db';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Basic Validation
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate network delay for realistic feel
      await new Promise(resolve => setTimeout(resolve, 800));

      const existingUser = await userDb.getUser(email);

      if (isLogin) {
        // --- LOGIN LOGIC ---
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

        // Success: Login
        userDb.setSession(existingUser);
        onLogin(existingUser);
      } else {
        // --- SIGN UP LOGIC ---
        if (existingUser) {
          setError('Account already exists with this email. Please Log In.');
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setIsLoading(false);
          return;
        }

        // Create new user object
        const newUser: User = {
          id: Date.now().toString(),
          name: name,
          email: email,
          password: password, // Store password (In real app, hash this!)
          role: 'student', // Default role
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`,
          village: '',
          address: '',
          dob: '',
          phone: '',
          bio: 'New student at Your study platform',
          enrolledBatches: []
        };
        
        // Save to Database (Async)
        await userDb.saveUser(newUser);
        
        // Auto login after sign up
        userDb.setSession(newUser);
        onLogin(newUser);
      }
    } catch (err) {
      console.error(err);
      setError("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert("To enable Google Sign-In (Gmail Storage), you need to connect this app to Firebase Project.\n\nCurrently using Local Database.");
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col md:flex-row">
        
        {/* Form Section */}
        <div className="w-full p-8">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
              <BookOpen size={28} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="text-center text-gray-500 mb-6 text-sm">
            {isLogin ? 'Enter your details to access your account' : 'Create an account to start learning'}
          </p>

          {/* Error / Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2 border border-red-100 animate-fade-in">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 text-xs rounded-lg flex items-center gap-2 border border-green-100 animate-fade-in">
              <CheckCircle size={14} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                  placeholder="Full Name"
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                placeholder="Email Address"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                placeholder="Password"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 flex justify-center items-center shadow-md active:transform active:scale-95 text-sm"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or continue with</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full border border-gray-200 bg-white text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm mb-4"
          >
            <Chrome size={18} className="text-red-500" /> Google
          </button>

          <div className="text-center">
            <p className="text-gray-600 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={toggleMode}
                className="text-blue-600 font-bold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;