import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmitSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3002/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // Store the user data in local storage
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/'); // Redirect to the home page after signup
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
      const response = await fetch('http://localhost:3002/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const users = await response.json();
      const user = users.find((user) => user.email === email && user.password === password);

      if (user) {
        // Store the user data in local storage
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/'); // Redirect to the home page after signin
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="w-full max-w-sm mx-auto p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          {isSignUp ? 'Create Account' : 'Welcome Back!'}
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {isSignUp ? (
          <form onSubmit={handleSubmitSignup}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Sign Up
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitSignIn}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Sign In
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          {isSignUp ? (
            <p className="text-gray-600">
              Already have an account?{' '}
              <button onClick={() => setIsSignUp(false)} className="text-blue-500 hover:underline">
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-gray-600">
              Don’t have an account?{' '}
              <button onClick={() => setIsSignUp(true)} className="text-blue-500 hover:underline">
                Sign Up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
