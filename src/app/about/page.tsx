import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export const metadata = {
  title: 'About | CatchMe AI',
  description: 'About CatchMe AI',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-900 text-white selection:bg-brand-blue/30 overflow-x-hidden flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-[800px] mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-black mb-12">About CatchMe AI</h1>
        
        <div className="prose prose-invert prose-lg max-w-none">
          <h2 className="text-2xl font-bold mb-4 text-white">Mission</h2>
          <p className="text-gray-300 mb-10 leading-relaxed text-xl font-medium border-l-4 border-brand-blue pl-6">
            Our mission is to help engineering teams identify, understand, and resolve software incidents faster through intelligent automation.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-white">Story</h2>
          <div className="space-y-6 text-gray-300 mb-12">
            <p className="leading-relaxed">
              Modern software systems are becoming increasingly complex. Teams often spend valuable time identifying issues, tracing root causes, and coordinating fixes.
            </p>
            <p className="leading-relaxed font-bold text-white">
              CatchMe AI was created to reduce that burden.
            </p>
            <p className="leading-relaxed">
              By combining AI-driven analysis with development workflows, CatchMe AI empowers teams to move from detection to remediation faster while maintaining full control over their infrastructure and repositories.
            </p>
          </div>

          <h2 className="text-2xl font-bold mb-4 text-white">Vision</h2>
          <p className="text-gray-300 mb-12 leading-relaxed text-lg bg-white/5 p-6 rounded-xl border border-white/10">
            To become the most trusted AI-powered reliability platform for software teams worldwide.
          </p>

          <h2 className="text-2xl font-bold mb-6 text-white">Core Values</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/10">
              <span className="text-brand-blue font-bold text-xl">•</span>
              <span className="text-white font-medium">Transparency</span>
            </li>
            <li className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/10">
              <span className="text-brand-blue font-bold text-xl">•</span>
              <span className="text-white font-medium">Security</span>
            </li>
            <li className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/10">
              <span className="text-brand-blue font-bold text-xl">•</span>
              <span className="text-white font-medium">Reliability</span>
            </li>
            <li className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/10">
              <span className="text-brand-blue font-bold text-xl">•</span>
              <span className="text-white font-medium">Innovation</span>
            </li>
            <li className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/10 md:col-span-2 justify-center">
              <span className="text-brand-blue font-bold text-xl">•</span>
              <span className="text-white font-medium">Customer Trust</span>
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
