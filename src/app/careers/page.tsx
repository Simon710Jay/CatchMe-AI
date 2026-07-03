import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export const metadata = {
  title: 'Careers | CatchMe AI',
  description: 'Careers at CatchMe AI',
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-brand-900 text-white selection:bg-brand-blue/30 overflow-x-hidden flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-[1000px] mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-6">Careers at CatchMe AI</h1>
          <p className="text-xl text-brand-blue font-medium mb-6">Build the future of software reliability.</p>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            At CatchMe AI, we are building intelligent systems that help engineering teams prevent outages, reduce operational risks, and automate remediation workflows.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-2">Why Join Us?</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <span className="text-brand-blue text-xl mt-0.5">✦</span>
                <span className="text-gray-200">Work on cutting-edge AI technology.</span>
              </li>
              <li className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <span className="text-brand-blue text-xl mt-0.5">✦</span>
                <span className="text-gray-200">Solve real-world engineering challenges.</span>
              </li>
              <li className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <span className="text-brand-blue text-xl mt-0.5">✦</span>
                <span className="text-gray-200">Collaborate with talented professionals.</span>
              </li>
              <li className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <span className="text-brand-blue text-xl mt-0.5">✦</span>
                <span className="text-gray-200">Help shape the future of software operations.</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-2">Current Opportunities</h2>
            <div className="space-y-3">
              {[
                'Software Engineer',
                'Frontend Engineer',
                'Backend Engineer',
                'AI Engineer',
                'DevOps Engineer',
                'Product Designer',
                'Technical Support Specialist'
              ].map((role) => (
                <div key={role} className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5 hover:border-brand-blue/30 transition-colors group">
                  <span className="font-medium text-white">{role}</span>
                  <span className="text-brand-blue text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Apply <span className="text-lg leading-none">→</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/5 p-8 md:p-12 rounded-3xl border border-white/10">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">Application Form</h2>
          <form className="space-y-6 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Name</label>
                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50 transition-colors" placeholder="Full Name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <input type="email" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50 transition-colors" placeholder="Email Address" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Position Applying For</label>
              <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none">
                <option value="">Select a position...</option>
                <option value="software">Software Engineer</option>
                <option value="frontend">Frontend Engineer</option>
                <option value="backend">Backend Engineer</option>
                <option value="ai">AI Engineer</option>
                <option value="devops">DevOps Engineer</option>
                <option value="design">Product Designer</option>
                <option value="support">Technical Support Specialist</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Resume Upload</label>
                <div className="w-full bg-black/40 border border-white/10 border-dashed rounded-xl px-4 py-3 text-gray-400 text-center cursor-pointer hover:border-brand-blue/50 transition-colors">
                  Click to upload PDF
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Portfolio Link</label>
                <input type="url" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50 transition-colors" placeholder="https://" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Cover Letter</label>
              <textarea rows={4} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50 transition-colors resize-none" placeholder="Tell us why you'd be a great fit..."></textarea>
            </div>

            <div className="pt-4">
              <button type="button" className="w-full py-4 bg-brand-blue hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
