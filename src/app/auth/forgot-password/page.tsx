import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Forgot Password - CatchMe AI',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-brand-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <span className="text-xl font-bold text-white tracking-tight">CatchMe AI</span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Reset Password</h1>
          <p className="text-gray-400">Enter your email and we'll send you a reset link</p>
        </div>

        <div className="glass p-8 rounded-2xl border border-white/10 shadow-2xl">
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email Address</label>
              <input 
                type="email" 
                placeholder="you@company.com" 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50 transition-colors"
                required
              />
            </div>
            
            <button type="button" className="w-full py-3 bg-brand-blue hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] mt-4">
              Send Reset Link
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-400">
            Remembered your password? <Link href="/auth/login" className="text-brand-blue font-bold hover:text-blue-400">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
