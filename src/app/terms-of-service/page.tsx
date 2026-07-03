import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export const metadata = {
  title: 'Terms of Service | CatchMe AI',
  description: 'CatchMe AI Terms of Service',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-brand-900 text-white selection:bg-brand-blue/30 overflow-x-hidden flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-[800px] mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-black mb-4">Terms of Service</h1>
        <div className="text-gray-400 mb-12 space-y-1">
          <p>Effective Date: {new Date().toLocaleDateString()}</p>
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-3 text-white">1. Acceptance of Terms</h2>
            <p className="text-gray-300">By creating an account, accessing, or using CatchMe AI, you agree to be bound by these Terms of Service. If you do not agree with these terms, you may not access or use the platform.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-white">2. Platform Description</h2>
            <p className="text-gray-300">CatchMe AI provides AI-powered monitoring, incident detection, security analysis, repository insights, and remediation assistance for software development teams.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-white">3. User Responsibilities</h2>
            <p className="text-gray-300 mb-2">Users are responsible for:</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-300">
              <li>Maintaining account security.</li>
              <li>Protecting authentication credentials.</li>
              <li>Ensuring lawful use of the platform.</li>
              <li>Reviewing all remediation recommendations before implementation.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-white">4. GitHub and Third-Party Integrations</h2>
            <div className="space-y-3 text-gray-300">
              <p>Users may connect GitHub and other third-party services.</p>
              <p>Users retain ownership of all repositories, code, intellectual property, and content connected to CatchMe AI.</p>
              <p>CatchMe AI receives only the permissions necessary to provide authorized services.</p>
              <p>Users may revoke integration access at any time.</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-white">5. AI-Generated Recommendations</h2>
            <div className="space-y-3 text-gray-300">
              <p>CatchMe AI may generate recommendations, remediation suggestions, incident reports, risk assessments, and pull request proposals.</p>
              <p>These outputs are generated using artificial intelligence and may contain inaccuracies.</p>
              <p>Users are solely responsible for reviewing, testing, validating, and approving any recommendations before deployment.</p>
              <p>CatchMe AI does not guarantee that generated recommendations will resolve issues or prevent future incidents.</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-white">6. Security and Availability</h2>
            <div className="space-y-3 text-gray-300">
              <p>We strive to maintain secure and reliable services but cannot guarantee uninterrupted availability.</p>
              <p>The platform may occasionally experience maintenance periods, outages, or service interruptions.</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-white">7. Prohibited Activities</h2>
            <p className="text-gray-300 mb-2">Users may not:</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-300">
              <li>Attempt unauthorized access.</li>
              <li>Reverse engineer the platform.</li>
              <li>Upload malicious content.</li>
              <li>Abuse platform resources.</li>
              <li>Violate applicable laws or regulations.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-white">8. Intellectual Property</h2>
            <div className="space-y-3 text-gray-300">
              <p>CatchMe AI owns the platform, software, branding, documentation, and proprietary technologies associated with the service.</p>
              <p>Users retain ownership of their repositories, code, and organizational data.</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-white">9. Limitation of Liability</h2>
            <p className="text-gray-300">To the maximum extent permitted by law, CatchMe AI shall not be liable for indirect, incidental, special, consequential, or punitive damages arising from use of the platform.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-white">10. Termination</h2>
            <p className="text-gray-300">We reserve the right to suspend or terminate accounts that violate these terms or present security risks.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-white">11. Changes to Terms</h2>
            <p className="text-gray-300">We may update these Terms of Service periodically. Continued use of the platform after updates constitutes acceptance of the revised terms.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-white">12. Governing Law</h2>
            <p className="text-gray-300">These Terms shall be governed by applicable laws and regulations of the jurisdiction in which CatchMe AI operates.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-white">13. Contact Information</h2>
            <p className="text-gray-300">Questions regarding these Terms may be directed to: <a href="mailto:legal@catchme.ai" className="text-brand-blue hover:underline transition-colors">legal@catchme.ai</a></p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
