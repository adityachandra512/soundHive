import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmitSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // Instead of storing user and navigating, show success and switch to sign in
        setSuccessMessage('Account created successfully! Please sign in.');
        setIsSignUp(false);
        // Clear the password field for security
        setPassword('');
        // We don't navigate yet - user needs to sign in first
      } else {
        setError(data.message || 'Failed to sign up');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full filter blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Music note decoration */}
      <div className="absolute top-10 left-10 animate-float">
        <svg className="w-12 h-12 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>

      <div className="w-full max-w-md backdrop-blur-xl bg-black/30 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              SoundHive
            </h1>
            <p className="text-gray-300 text-lg">
              {isSignUp ? 'Join the Music Revolution' : 'Welcome Back, Maestro!'}
            </p>
          </div>

          {successMessage && (
            <div className="p-3 bg-green-900/50 border border-green-400/30 rounded-lg flex items-center space-x-2 text-green-300">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-400/30 rounded-lg flex items-center space-x-2 text-red-300">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={isSignUp ? handleSubmitSignup : handleSubmitSignIn} className="space-y-6">
            {isSignUp && (
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/50 text-white placeholder-gray-400 transition-all"
                  placeholder="UserName"
                />
                <div className="absolute right-4 top-4 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
              </div>
            )}

            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/50 text-white placeholder-gray-400 transition-all"
                placeholder="Email"
              />
              <div className="absolute right-4 top-4 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
            </div>

            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/50 text-white placeholder-gray-400 transition-all"
                placeholder="••••••••"
              />
              <div className="absolute right-4 top-4 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-bold text-white hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg"
            >
              {isSignUp ? 'Start Listening Now' : 'Unlock Your Music'}
            </button>
          </form>
          <p className="text-center text-gray-400">
            {isSignUp ? 'Already have an account? ' : 'New to SoundHive? '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccessMessage('');
              }}
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;