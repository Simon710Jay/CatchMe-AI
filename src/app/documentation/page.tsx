import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export const metadata = {
  title: 'Documentation | CatchMe AI',
  description: 'Monitor. Detect. Remediate. Protect.',
};

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-brand-900 text-white selection:bg-brand-blue/30 overflow-x-hidden flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-[800px] mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-black mb-4">CatchMe AI Documentation</h1>
        <p className="text-xl text-brand-blue mb-12 font-medium">Monitor. Detect. Remediate. Protect.</p>
        
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-gray-300 mb-6 leading-relaxed">
            CatchMe AI is an intelligent software monitoring and remediation platform designed to help development teams identify production issues, security vulnerabilities, performance regressions, and repository risks before they impact customers.
          </p>
          <p className="text-gray-300 mb-12 leading-relaxed">
            Our platform continuously analyzes connected repositories, deployment environments, and application signals to generate actionable insights and automated remediation recommendations.
          </p>

          <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-2">Core Features</h2>
          
          <div className="space-y-8 mb-16">
            <div>
              <h3 className="text-lg font-bold mb-2 text-white">1. Repository Monitoring</h3>
              <p className="text-gray-400">CatchMe AI continuously analyzes connected GitHub repositories to identify security risks, dependency vulnerabilities, code quality concerns, and deployment issues.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2 text-white">2. AI-Powered Incident Detection</h3>
              <p className="text-gray-400">The platform uses advanced AI models to identify unusual patterns, operational anomalies, failed deployments, suspicious changes, and emerging risks.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2 text-white">3. Automated Remediation</h3>
              <p className="text-gray-400">Generate remediation recommendations and pull requests directly from identified incidents to accelerate resolution times.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2 text-white">4. Security Monitoring</h3>
              <p className="text-gray-400">Detect exposed secrets, vulnerable dependencies, configuration risks, and security weaknesses across monitored projects.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2 text-white">5. Production Visibility</h3>
              <p className="text-gray-400">Track incidents, system health, remediation status, and operational trends through a centralized dashboard.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2 text-white">6. Team Collaboration</h3>
              <p className="text-gray-400">Enable engineering teams to review incidents, assign ownership, track remediation progress, and maintain operational awareness.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-2">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold mb-2 text-white">Q: Does CatchMe AI modify my repositories automatically?</h3>
              <p className="text-gray-400">A: No. CatchMe AI only performs actions explicitly authorized by the user.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold mb-2 text-white">Q: Does CatchMe AI store my source code?</h3>
              <p className="text-gray-400">A: CatchMe AI analyzes repository metadata and authorized content required to provide services. Repository ownership remains with the customer.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold mb-2 text-white">Q: Can I disconnect GitHub at any time?</h3>
              <p className="text-gray-400">A: Yes. Integrations can be revoked and removed at any time through account settings.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
