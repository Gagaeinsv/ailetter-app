import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const { signInWithGoogle, user, isNewUser } = useAuth();
  const navigate = useNavigate();

  // Якщо юзер вже залогінений — одразу редіректимо
  useEffect(() => {
    if (user) {
      navigate(isNewUser ? '/onboarding' : '/dashboard');
    }
  }, [user, isNewUser, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      // Після успішного логіну — navigate спрацює через useEffect вище
      // але додаємо fallback на випадок якщо useEffect не спрацює вчасно
    } catch (error) {
      console.error('Login failed', error);
      alert('Sign in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-[600px] md:h-[600px] bg-indigo-600/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

      {/* Back to home */}
      <Link
        to="/"
        className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-white transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back
      </Link>

      <div className="w-full max-w-sm md:max-w-md bg-[#1e293b] border border-[#334155] rounded-2xl md:rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 text-center">

        {/* Logo */}
        <div className="mb-6 md:mb-8 flex justify-center">
          <Link to="/" className="flex items-center gap-2 text-xl md:text-2xl font-black tracking-tighter text-white">
            <span className="bg-indigo-600 w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-white text-[9px] md:text-[10px]">AI</span>
            AILETTER
          </Link>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-gray-400 text-sm mb-7 md:mb-8 leading-relaxed">
          Sign in to access your cover letters and history.
        </p>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-[#0f172a] font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg active:scale-95 text-sm md:text-base"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
            alt="Google"
          />
          Sign in with Google
        </button>

        <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-[#334155] space-y-4">
          <div className="flex justify-center gap-4 md:gap-6 text-xs text-gray-500">
            {['Free to start', '5 generations', 'No card needed'].map(f => (
              <span key={f} className="flex items-center gap-1">
                <span className="text-green-400">✓</span> {f}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-600">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-indigo-400 hover:underline">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;