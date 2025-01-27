import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield, Zap, Heart, Github, Twitter, Linkedin, X, Lock, Shield as ShieldCheck, UserCheck, Mail, KeyRound, Plus } from 'lucide-react';

// Types for auth
interface LoginRequest {
  email: string;
  password: string;
}

interface UserCreate extends LoginRequest {
  name: string;
}

interface Token {
  access_token: string;
  refresh_token: string;
}

interface WorkspaceCreate {
  name: string;
  description: string;
}

const API_URL = 'https://box-201.arbibox.com';

function Dashboard() {
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const accessToken = sessionStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/workspace/create_protected`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: workspaceName,
          description: workspaceDescription
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create workspace');
      }

      const data = await response.json();
      // Reset form after successful creation
      setWorkspaceName('');
      setWorkspaceDescription('');
      alert('Workspace created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Welcome to Your Dashboard</h2>
          
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={workspaceDescription}
                onChange={(e) => setWorkspaceDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-t-white border-r-white border-b-white border-l-transparent"></span>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Create Workspace
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<UserCreate>({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/user/login' : '/user/register';
      const payload = isLogin ? {
        email: formData.email,
        password: formData.password
      } : formData;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Authentication failed');
      }

      const data = await response.json();
      
      // Store tokens in sessionStorage
      if (data.access_token && data.refresh_token) {
        sessionStorage.setItem('access_token', data.access_token);
        sessionStorage.setItem('refresh_token', data.refresh_token);
        window.location.href = '/dashboard';
      }
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="heading-lg text-gray-900 mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-t-white border-r-white border-b-white border-l-transparent"></span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

function LandingPage({ onShowAuth }: { onShowAuth: () => void }) {
  return (
    <>
      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80"
            alt="Background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="heading-xl text-white mb-6">
            Innovate. Create. Succeed.
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Transform your ideas into reality with our cutting-edge solutions and expert team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onShowAuth}
              className="btn-white flex items-center justify-center"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button onClick={() => setShowModal(true)} className="btn-outline">
              Learn More
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="section bg-gray-50">
        <div className="container">
          <h2 className="heading-lg text-center text-gray-900 mb-16">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="feature-icon">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Lightning Fast</h3>
              <p className="text-gray-600">Experience blazing fast performance with our optimized solutions.</p>
            </div>
            <div className="text-center">
              <div className="feature-icon">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure by Design</h3>
              <p className="text-gray-600">Your data is protected with enterprise-grade security measures.</p>
            </div>
            <div className="text-center">
              <div className="feature-icon">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Built with Love</h3>
              <p className="text-gray-600">Crafted with attention to detail and passion for excellence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-lg text-gray-900 mb-8">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of satisfied customers who trust our solutions.
          </p>
          <button 
            onClick={onShowAuth}
            className="btn-primary"
          >
            Contact Us Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Company Name</h3>
            <p className="text-gray-400 max-w-md">
              Creating innovative solutions for tomorrow's challenges.
            </p>
          </div>
          <div className="flex justify-start md:justify-end items-center gap-6">
            <a href="#" className="social-link">
              <Github className="h-6 w-6" />
            </a>
            <a href="#" className="social-link">
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="social-link">
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
        </div>
        <div className="container mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Company Name. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

function App() {
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const accessToken = sessionStorage.getItem('access_token');
    setIsAuthenticated(!!accessToken);
  }, []);

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Security Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="heading-lg text-gray-900 mb-6">Our Security Features</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Lock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">End-to-End Encryption</h3>
                  <p className="text-gray-600">Your data is encrypted at rest and in transit using industry-standard AES-256 encryption.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <ShieldCheck className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Regular Security Audits</h3>
                  <p className="text-gray-600">We conduct regular penetration testing and security audits to ensure your data remains protected.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Advanced Access Control</h3>
                  <p className="text-gray-600">Role-based access control and multi-factor authentication ensure only authorized users can access sensitive data.</p>
                </div>
              </div>
            </div>
            <button onClick={() => setShowModal(false)} className="mt-8 w-full btn-primary">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      <LandingPage onShowAuth={() => setShowAuthModal(true)} />
    </div>
  );
}

export default App;