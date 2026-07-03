import React from 'react';
import Link from 'next/link';

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-brand-900 relative">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Simple, transparent pricing</h2>
          <p className="text-gray-400 text-lg">
            Start for free, upgrade when you need more power and team collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="glass p-8 rounded-3xl flex flex-col border-t border-white/10">
            <h3 className="text-2xl font-bold text-white mb-2">Developer</h3>
            <div className="mb-6">
              <span className="text-4xl font-black text-white">$0</span>
              <span className="text-gray-400">/month</span>
            </div>
            <p className="text-gray-400 text-sm mb-8 flex-grow">
              Perfect for solo developers and small open-source projects.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <svg className="text-brand-blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Up to 3 GitHub Repositories
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <svg className="text-brand-blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Basic AI Incident Analysis
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <svg className="text-brand-blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                1 Team Member
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <svg className="text-brand-blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Community Support
              </li>
            </ul>
            <Link href="/auth/register" className="w-full py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-colors text-center">
              Start Free
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-b from-brand-800 to-brand-900 border border-brand-blue/50 p-8 rounded-3xl flex flex-col relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(59,130,246,0.15)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-blue text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
            <div className="mb-6">
              <span className="text-4xl font-black text-white">$49</span>
              <span className="text-gray-400">/month</span>
            </div>
            <p className="text-gray-400 text-sm mb-8 flex-grow">
              For growing engineering teams that need automated remediation.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <svg className="text-brand-blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Unlimited Repositories
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <svg className="text-brand-blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Advanced AI Remediation PRs
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <svg className="text-brand-blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Up to 10 Team Members
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <svg className="text-brand-blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Slack & Teams Integration
              </li>
            </ul>
            <Link href="/auth/register?plan=pro" className="w-full py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-blue-600 transition-colors text-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              Start 14-Day Trial
            </Link>
          </div>

          {/* Enterprise Tier */}
          <div className="glass p-8 rounded-3xl flex flex-col border-t border-white/10">
            <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
            <div className="mb-6">
              <span className="text-4xl font-black text-white">Custom</span>
            </div>
            <p className="text-gray-400 text-sm mb-8 flex-grow">
              For large organizations with complex infrastructure and security needs.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <svg className="text-brand-blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Everything in Pro
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <svg className="text-brand-blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Single Sign-On (SSO)
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <svg className="text-brand-blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Custom Log Ingestion Limits
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <svg className="text-brand-blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Dedicated Success Manager
              </li>
            </ul>
            <Link href="#contact" className="w-full py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-colors text-center">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
