import usePageTitle from "../hooks/usePageTitle";
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useGoogleLogin } from '@react-oauth/google'; // Import the hook
import axios from 'axios'; // Needed to fetch user info from Google

const Login = () => {
  usePageTitle("Login | VERIDIAN HAVELI");
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { login, user, googleLogin } = useAuth(); // Extracted googleLogin
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(credentials);
  };

  // --- CUSTOM GOOGLE BUTTON LOGIC ---
  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // The hook returns an access_token, not an id_token. 
      // We must fetch the user's profile info from Google's API first.
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        // Pass the fetched Google data to your AuthContext
        googleLogin(userInfo.data); 
      } catch (err) {
        console.error("Failed to fetch Google user info", err);
      }
    },
    onError: error => console.error('Google Login Failed', error)
  });

  return (
    <main className="pt-32 pb-16 min-h-screen bg-haveli-bg flex items-center justify-center">
      <div className="lux-card max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-haveli-section border border-haveli-border rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <i className="fas fa-user-circle text-haveli-accent text-4xl"></i>
          </div>
          <h2 className="text-3xl font-bold font-display text-haveli-heading">Welcome Back</h2>
          <p className="text-haveli-muted mt-3 font-light">Sign in to manage your heritage stay</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-haveli-heading uppercase tracking-wider">Username</label>
            <div className="relative">
              <i className="fas fa-user absolute left-4 top-4 text-haveli-accent text-sm"></i>
              <input 
                type="text" 
                className="w-full h-12 pl-12 pr-4 bg-haveli-section border border-haveli-border rounded-xl focus:outline-none focus:border-haveli-primary text-haveli-body font-light transition-all"
                placeholder="Enter username"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-haveli-heading uppercase tracking-wider">Password</label>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-4 text-haveli-accent text-sm"></i>
              <input 
                type="password" 
                className="w-full h-12 pl-12 pr-4 bg-haveli-section border border-haveli-border rounded-xl focus:outline-none focus:border-haveli-primary text-haveli-body font-light transition-all"
                placeholder="Enter password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="btn btn-secondary btn-block h-12 mt-6 shadow-sm tracking-wide"
          >
            <i className="fas fa-sign-in-alt mr-2"></i> Sign In
          </button>
        </form>

        {/* --- CUSTOM GOOGLE BUTTON UI --- */}
        <div className="mt-6">
          <div className="flex items-center w-full mb-6">
            <hr className="flex-grow border-haveli-border" />
            <span className="px-4 text-haveli-muted text-xs uppercase tracking-widest font-bold">Or</span>
            <hr className="flex-grow border-haveli-border" />
          </div>
          
          <button 
            onClick={() => handleGoogleAuth()}
            className="w-full h-12 bg-white border border-haveli-border rounded-xl flex items-center justify-center gap-3 text-haveli-heading font-medium hover:bg-haveli-section transition-colors shadow-sm"
          >
            {/* Google G Logo SVG */}
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            Sign in with Google
          </button>
        </div>
        {/* --- END CUSTOM BUTTON --- */}
        
        <div className="mt-8 text-center text-sm text-haveli-muted border-t border-haveli-border pt-6 font-light">
          Don't have an account yet? <br/>
          <Link to="/register" className="text-haveli-accent font-bold hover:text-haveli-accentHover mt-2 inline-block transition">Create an Account</Link>
        </div>
      </div>
    </main>
  );
};

export default Login;