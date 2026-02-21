import usePageTitle from "../hooks/usePageTitle";
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  usePageTitle("Login | VERIDIAN HAVELI");
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { login, user } = useAuth(); // Extracted 'user' state
  const navigate = useNavigate(); // Hook for redirection

  // NEW: Watch for login success and redirect based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(credentials);
  };

  return (
    <main className="pt-32 pb-16 min-h-screen bg-haveli-bg flex items-center justify-center">
      <div className="lux-card max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-haveli-section border border-haveli-border rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            {/* FIXED: Changed to fas to ensure icon renders correctly */}
            <i className="fas fa-user-circle text-haveli-accent text-4xl"></i>
          </div>
          <h2 className="text-3xl font-bold font-display text-haveli-heading">Welcome Back</h2>
          <p className="text-haveli-muted mt-3 font-light">Sign in to manage your heritage stay</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-haveli-heading uppercase tracking-wider">Username</label>
            <div className="relative">
              {/* FIXED: Changed to fas */}
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
              {/* FIXED: Changed to fas */}
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
          {/* UPDATED: Added Design System Button Classes */}
          <button 
            type="submit" 
            className="btn btn-secondary btn-block h-12 mt-6 shadow-sm tracking-wide"
          >
            <i className="fas fa-sign-in-alt mr-2"></i> Sign In
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-haveli-muted border-t border-haveli-border pt-6 font-light">
          Don't have an account yet? <br/>
          <Link to="/register" className="text-haveli-accent font-bold hover:text-haveli-accentHover mt-2 inline-block transition">Create an Account</Link>
        </div>
      </div>
    </main>
  );
};

export default Login;