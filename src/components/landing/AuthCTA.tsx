import React from 'react';
import Link from 'next/link';

export const AuthCTA = () => {
  return (
    <section className="py-24 bg-brand-900 relative border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/5 to-brand-purple/5 pointer-events-none" />
      
      <div className="max-w-[800px] mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Start Monitoring Your Repositories Today</h2>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
          Join leading engineering teams using CatchMe AI to automate incident detection, investigation, and remediation.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/register" className="w-full sm:w-auto px-8 py-4 bg-white text-brand-900 font-bold rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Sign Up Free
          </Link>
          <Link href="/auth/login" className="w-full sm:w-auto px-8 py-4 glass glass-hover text-white font-bold rounded-xl">
            Login
          </Link>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl -translate-y-1/2 -z-10" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl -translate-y-1/2 -z-10" />
    </section>
  );
};
