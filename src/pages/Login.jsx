import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Store, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { loginUser } from '../Helper/apiHelper';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const responce=await loginUser(formData);
      localStorage.setItem('token',responce.data.data.token);
      localStorage.setItem('user',responce.data.data._id);

      navigate('/dashboard');
    } catch (error) {
      // Error is already handled in the auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-amber-200 to-white">

      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-50 to-primary-100 items-center justify-center p-12">
        <div className="max-w-md w-full text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 transform transition-transform duration-300 hover:scale-105">
            <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="h-10 w-10 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Vendor Portal</h3>
            <p className="text-gray-600">Manage your business with our powerful tools</p>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <div className="h-1 w-8 bg-purple-400 rounded-full"></div>
            <div className="h-1 w-8 bg-pink-400 rounded-full"></div>
            <div className="h-1 w-8 bg-yellow-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-lg text-gray-600">Sign in to continue to your vendor account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 px-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-4 border-0 focus:ring-0 rounded-xl bg-gray-50 focus:bg-white transition-colors duration-300"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 px-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-4 border-0 focus:ring-0 rounded-xl bg-gray-50 focus:bg-white transition-colors duration-300"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200 hover:text-primary-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex items-center justify-center bg-amber-300 gap-2 bg-primary-600 hover:bg-primary-700 text-black py-4 px-6 rounded-xl font-semibold shadow-md transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200 inline-flex items-center gap-1"
              >
                Sign up now
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </p>
          </div>

          <div className="mt-12 border-t border-gray-200 pt-6">
            <p className="text-xs text-center text-gray-500">
              © {new Date().getFullYear()} Vendor Platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;