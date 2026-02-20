import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const [details, setDetails] = useState({ username: '', email: '', password: '' });
  const { register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    register(details);
  };

  return (
    <main className="pt-32 pb-16 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-user-plus text-amber-600 text-3xl"></i>
          </div>
          <h2 className="text-3xl font-bold font-display text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-2">Join Jhankar Hotel for exclusive amenities</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Username</label>
            <div className="relative">
              <i className="fas fa-user absolute left-4 top-3.5 text-gray-400"></i>
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Choose a username"
                value={details.username}
                onChange={(e) => setDetails({...details, username: e.target.value})}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Email</label>
            <div className="relative">
              <i className="fas fa-envelope absolute left-4 top-3.5 text-gray-400"></i>
              <input 
                type="email" 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter your email"
                value={details.email}
                onChange={(e) => setDetails({...details, email: e.target.value})}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Password</label>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-3.5 text-gray-400"></i>
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Create a password"
                value={details.password}
                onChange={(e) => setDetails({...details, password: e.target.value})}
                required
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center mt-4 shadow-lg"
          >
            <i className="fas fa-check-circle mr-2"></i> Sign Up
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600 border-t pt-6">
          Already have an account? <br/>
          <Link to="/login" className="text-amber-600 font-bold hover:underline mt-2 inline-block">Log In Here</Link>
        </div>
      </div>
    </main>
  );
};

export default Register;