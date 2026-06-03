import React from 'react';

const steps = [
  {
    number: '01',
    title: 'Connect GitHub',
    description: 'Link your repositories securely with OAuth. We listen for pushes, pull requests, and workflow events.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>
      </svg>
    )
  },
  {
    number: '02',
    title: 'Monitor Systems',
    description: 'CatchMe AI watches your live logs and GitHub activity, aggregating data to detect anomalies instantly.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    )
  },
  {
    number: '03',
    title: 'AI Investigation',
    description: 'When an incident occurs, our AI agent analyzes the stack trace, recent commits, and logs to find the root cause.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-purple">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    )
  },
  {
    number: '04',
    title: 'Resolve Faster',
    description: 'Review the AI-generated remediation PR, approve the fix, and get your system back to 100% health.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    )
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-brand-800 border-y border-white/5 relative">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">How CatchMe AI Works</h2>
          <p className="text-gray-400 text-lg">
            From detection to resolution in minutes, not hours.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[50px] left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl glass flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 group-hover:border-white/20 transition-all duration-300 shadow-xl">
                  {step.icon}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-brand-900 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-[250px]">{step.description}</p>
                
                {/* Mobile Connector */}
                {idx !== steps.length - 1 && (
                  <div className="md:hidden w-0.5 h-12 bg-white/10 my-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
