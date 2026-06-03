import React from 'react';
import Link from 'next/link';

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-brand-900 relative">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Simple, transparent pricing</h2>
          <p className="text-gray-400 text-lg">
            Start for free, upgrade when you need advanced AI analysis and team collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-[1000px] mx-auto">
          {/* Starter Plan */}
          <div className="glass p-8 rounded-2xl flex flex-col items-center text-center">
            <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
            <div className="text-4xl font-black text-white mb-2">$0<span className="text-lg text-gray-500 font-normal">/month</span></div>
            <p className="text-sm text-gray-400 mb-8 h-10">Perfect for individual developers and small projects.</p>
            
            <ul className="w-full space-y-4 mb-8 text-left">
              <li className="flex items-center gap-3 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                1 repository
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                Basic monitoring
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                Community support
              </li>
            </ul>
            
            <Link href="/auth/register" className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10">
              Get Started
            </Link>
          </div>

          {/* Professional Plan (Highlighted) */}
          <div className="glass p-8 rounded-2xl flex flex-col items-center text-center relative transform md:scale-105 border-brand-blue/50 shadow-[0_0_30px_rgba(59,130,246,0.15)] bg-gradient-to-b from-brand-blue/10 to-transparent">
            <div className="absolute -top-4 bg-gradient-to-r from-brand-blue to-brand-purple text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
            <div className="text-4xl font-black text-white mb-2">$29<span className="text-lg text-gray-500 font-normal">/month</span></div>
            <p className="text-sm text-gray-400 mb-8 h-10">Advanced AI features for professional teams.</p>
            
            <ul className="w-full space-y-4 mb-8 text-left">
              <li className="flex items-center gap-3 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                10 repositories
              </li>
              <li className="flex items-center gap-3 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                AI analysis & remediation
              </li>
              <li className="flex items-center gap-3 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                Real-time alerts
              </li>
              <li className="flex items-center gap-3 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                Team dashboards
              </li>
            </ul>
            
            <Link href="/auth/register" className="w-full py-3 bg-brand-blue hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]">
              Start 14-Day Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="glass p-8 rounded-2xl flex flex-col items-center text-center">
            <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
            <div className="text-3xl font-black text-white mb-2 pt-1 pb-1">Custom</div>
            <p className="text-sm text-gray-400 mb-8 h-10">Dedicated infrastructure for large organizations.</p>
            
            <ul className="w-full space-y-4 mb-8 text-left">
              <li className="flex items-center gap-3 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                Unlimited repositories
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                Advanced AI workflows
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                Custom integrations
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                Dedicated support
              </li>
            </ul>
            
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
