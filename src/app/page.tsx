import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Pricing } from '@/components/landing/Pricing';
import { AuthCTA } from '@/components/landing/AuthCTA';
import { Footer } from '@/components/landing/Footer';

export const metadata = {
  title: 'CatchMe AI | Real-Time Incident Detection & AI-Powered Remediation',
  description: 'Catch, Analyze, and Resolve System Failures in Real Time.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-900 text-white selection:bg-brand-blue/30 overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <AuthCTA />
      <Footer />
    </div>
  );
}
