import usePageTitle from "../hooks/usePageTitle";
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  usePageTitle("Create Account | VERIDIAN HAVELI");
  const [details, setDetails] = useState({ username: '', email: '', password: '' });
  const { register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    register(details);
  };

  return (
    <main className="pt-32 pb-16 min-h-screen bg-haveli-bg flex items-center justify-center">
      <div className="lux-card max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-haveli-section border border-haveli-border rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            {/* FIXED: Changed to fas */}
            <i className="fas fa-user-plus text-haveli-accent text-4xl"></i>
          </div>
          <h2 className="text-3xl font-bold font-display text-haveli-heading">Create Account</h2>
          <p className="text-haveli-muted mt-3 font-light">Join Veridian Haveli for exclusive amenities</p>
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
                placeholder="Choose a username"
                value={details.username}
                onChange={(e) => setDetails({...details, username: e.target.value})}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-haveli-heading uppercase tracking-wider">Email</label>
            <div className="relative">
              {/* FIXED: Changed to fas */}
              <i className="fas fa-envelope absolute left-4 top-4 text-haveli-accent text-sm"></i>
              <input 
                type="email" 
                className="w-full h-12 pl-12 pr-4 bg-haveli-section border border-haveli-border rounded-xl focus:outline-none focus:border-haveli-primary text-haveli-body font-light transition-all"
                placeholder="Enter your email"
                value={details.email}
                onChange={(e) => setDetails({...details, email: e.target.value})}
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
                placeholder="Create a password"
                value={details.password}
                onChange={(e) => setDetails({...details, password: e.target.value})}
                required
              />
            </div>
          </div>
          {/* UPDATED: Added Design System Button Classes */}
          <button 
            type="submit" 
            className="btn btn-secondary btn-block h-12 mt-6 shadow-sm tracking-wide"
          >
            <i className="fas fa-check-circle mr-2"></i> Join The Haveli
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-haveli-muted border-t border-haveli-border pt-6 font-light">
          Already have an account? <br/>
          <Link to="/login" className="text-haveli-accent font-bold hover:text-haveli-accentHover mt-2 inline-block transition">Sign In Here</Link>
        </div>
      </div>
    </main>
  );
};

export default Register;