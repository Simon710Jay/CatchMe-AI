"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export const Hero = () => {
  const { isAuthenticated, isLoading } = useAuth();
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
          alt="Abstract AI background" 
          className="w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/80 via-brand-900/90 to-brand-900" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-[1000px] mx-auto px-6 md:px-12 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-brand-blue/30 text-brand-blue text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
          CatchMe AI v2.0 Is Live
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 tracking-tight leading-tight mb-6 drop-shadow-2xl animate-fade-in-up animation-delay-100">
          Catch, Analyze, and Resolve System Failures in Real Time.
        </h1>

        <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl leading-relaxed animate-fade-in-up animation-delay-200">
          CatchMe AI continuously monitors repositories, deployments, logs, and production systems to detect incidents, investigate root causes, and help engineering teams resolve issues faster.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up animation-delay-300">
          {!isLoading && (
            <Link href={isAuthenticated ? "/overview" : "/auth/register"} className="w-full sm:w-auto px-8 py-4 bg-brand-blue hover:bg-blue-600 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2">
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          )}
          <button className="w-full sm:w-auto px-8 py-4 glass glass-hover text-white font-bold rounded-xl flex items-center justify-center gap-2">
            Book Demo
          </button>
          {!isLoading && (
            <Link href={isAuthenticated ? "/overview" : "/auth/login"} className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 text-gray-300 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
              View Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-900 to-transparent z-10" />
    </section>
  );
};
