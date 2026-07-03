import React from 'react'; // Force reload
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-brand-900 border-t border-white/5 pt-16 pb-8">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-6">
              <span className="text-lg font-bold text-white tracking-tight">CatchMe AI</span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Catch, Analyze, and Resolve System Failures in Real Time. The future of incident response.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Product</h4>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Company</h4>
            <ul className="space-y-3">
              <li><Link href="#about" className="text-sm text-gray-400 hover:text-white transition-colors">About</Link></li>
              <li><Link href="#contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="#careers" className="text-sm text-gray-400 hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="#blog" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#status" className="text-sm text-gray-400 hover:text-white transition-colors">Status</Link></li>
              <li><Link href="#security" className="text-sm text-gray-400 hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2026 CatchMe AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#privacy" className="text-sm text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#terms" className="text-sm text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
