import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export const metadata = {
  title: 'Contact Us | CatchMe AI',
  description: 'Contact CatchMe AI',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-brand-900 text-white selection:bg-brand-blue/30 overflow-x-hidden flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-[1000px] mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-6">Contact Us</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Need help with CatchMe AI? Whether you need technical assistance, sales information, partnership opportunities, or product guidance, our team is available to help.
          </p>
        </div>
        
        <div className="grid md:grid-cols-5 gap-12">
          <div className="md:col-span-3 bg-white/5 p-8 rounded-2xl border border-white/10">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Full Name</label>
                  <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50 transition-colors" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email Address</label>
                  <input type="email" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50 transition-colors" placeholder="john@example.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Company Name</label>
                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50 transition-colors" placeholder="Acme Inc." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Subject</label>
                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50 transition-colors" placeholder="How can we help?" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Message</label>
                <textarea rows={5} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50 transition-colors resize-none" placeholder="Your message here..."></textarea>
              </div>

              <button type="button" className="w-full py-4 bg-brand-blue hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                Send Message
              </button>
            </form>
          </div>
          
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 h-full">
              <h3 className="text-2xl font-bold mb-8 text-white">Support Information</h3>
              
              <div className="space-y-8">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Technical Support</p>
                  <a href="mailto:support@catchme.ai" className="text-brand-blue hover:text-blue-400 font-medium text-lg transition-colors">support@catchme.ai</a>
                </div>
                
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Business Inquiries</p>
                  <a href="mailto:business@catchme.ai" className="text-brand-blue hover:text-blue-400 font-medium text-lg transition-colors">business@catchme.ai</a>
                </div>
                
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Partnerships</p>
                  <a href="mailto:partners@catchme.ai" className="text-brand-blue hover:text-blue-400 font-medium text-lg transition-colors">partners@catchme.ai</a>
                </div>
                
                <div className="pt-8 border-t border-white/10 mt-8">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Response Time</p>
                  <p className="text-gray-300">Most inquiries receive a response within 24 to 48 business hours.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
