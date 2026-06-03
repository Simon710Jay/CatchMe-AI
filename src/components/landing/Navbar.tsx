"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-brand-900/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold text-white tracking-tight">CatchMe AI</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Pricing</Link>
          <Link href="#solutions" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Solutions</Link>
          <Link href="/docs" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Documentation</Link>
          <Link href="#about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">About</Link>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">Login</Link>
          <Link href="/auth/register" className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Sign Up
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMobileMenuOpen ? (
              <path d="M18 6 6 18M6 6l12 12"/>
            ) : (
              <path d="M4 12v.01M4 6v.01M4 18v.01M8 12h12M8 6h12M8 18h12"/>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-brand-900 border-b border-white/5 px-6 py-4 flex flex-col gap-4 shadow-2xl">
          <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 font-medium py-2">Features</Link>
          <Link href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 font-medium py-2">Pricing</Link>
          <Link href="#solutions" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 font-medium py-2">Solutions</Link>
          <div className="h-px bg-white/5 my-2" />
          <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 font-medium py-2">Login</Link>
          <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)} className="bg-brand-blue text-white font-bold py-3 rounded-lg text-center mt-2">Sign Up Free</Link>
        </div>
      )}
    </nav>
  );
};
