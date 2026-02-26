// src/pages/PrivacyPolicy.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-lg font-black text-white mb-4 pb-2 border-b border-white/5">{title}</h2>
    <div className="space-y-3 text-gray-400 text-sm leading-relaxed">{children}</div>
  </div>
);

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-black tracking-tighter text-lg">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 w-7 h-7 rounded-lg flex items-center justify-center text-[10px]">AI</span>
            AILETTER
          </Link>
          <Link to="/" className="text-xs text-gray-400 hover:text-white transition-colors">← Back to Home</Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-3">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: February 2025</p>
          <p className="text-gray-400 text-sm mt-4 leading-relaxed">
            At AIletter, we take your privacy seriously. This policy explains what data we collect, how we use it, and your rights regarding your personal information.
          </p>
        </div>

        <Section title="1. Data We Collect">
          <p><strong className="text-white">Account data:</strong> When you register, we collect your name, email address, and authentication data (via Google OAuth or email/password).</p>
          <p><strong className="text-white">CV data:</strong> When you upload a CV, its content is temporarily processed by our AI to generate cover letters. CV files are not permanently stored on our servers.</p>
          <p><strong className="text-white">Usage data:</strong> We collect anonymized information about how you use the app (feature usage, generation counts, session duration) to improve the product.</p>
          <p><strong className="text-white">Payment data:</strong> Payment information is handled entirely by Stripe. We do not store credit card numbers or full payment details on our servers.</p>
          <p><strong className="text-white">Local storage:</strong> Letter history, profile information, and settings are stored in your browser's local storage on your device.</p>
        </Section>

        <Section title="2. How We Use Your Data">
          <ul className="list-disc pl-5 space-y-2">
            <li>To provide and improve the cover letter generation service</li>
            <li>To manage your account and subscription</li>
            <li>To send transactional emails (payment receipts, account notifications)</li>
            <li>To analyze usage patterns and improve the product (anonymized)</li>
            <li>To comply with legal obligations</li>
          </ul>
          <p className="mt-3">We do not sell your personal data to third parties. We do not use your CV or generated letters to train AI models without explicit consent.</p>
        </Section>

        <Section title="3. Third-Party Services">
          <p>We use the following third-party services to operate AIletter:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong className="text-white">Firebase (Google):</strong> Authentication, database, and hosting</li>
            <li><strong className="text-white">Google Gemini AI:</strong> AI model for generating cover letters</li>
            <li><strong className="text-white">Stripe:</strong> Payment processing for Pro subscriptions</li>
          </ul>
          <p className="mt-3">Each of these services has its own privacy policy. We recommend reviewing them: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Google Privacy Policy</a>, <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Stripe Privacy Policy</a>.</p>
        </Section>

        <Section title="4. Data Security">
          <p>We implement industry-standard security measures to protect your data:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>All data transmitted between your browser and our servers is encrypted via HTTPS/TLS</li>
            <li>Firebase security rules prevent unauthorized access to user data</li>
            <li>Passwords are never stored — we use OAuth and Firebase Authentication</li>
            <li>Payment data is handled by Stripe with PCI DSS compliance</li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>We retain your account data for as long as your account is active. If you delete your account, we remove your personal data within 30 days.</p>
          <p>CV files uploaded for processing are deleted from our servers immediately after the generation is complete. They are not stored persistently.</p>
          <p>Generated letters saved to history are stored in your browser's local storage and are not on our servers.</p>
        </Section>

        <Section title="6. Your Rights (GDPR)">
          <p>If you are located in the European Economic Area, you have the following rights:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong className="text-white">Right of access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong className="text-white">Right to rectification:</strong> Request correction of inaccurate personal data</li>
            <li><strong className="text-white">Right to erasure:</strong> Request deletion of your personal data</li>
            <li><strong className="text-white">Right to portability:</strong> Receive your data in a machine-readable format</li>
            <li><strong className="text-white">Right to object:</strong> Object to processing of your data for certain purposes</li>
          </ul>
          <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:privacy@ailetter.app" className="text-indigo-400 hover:text-indigo-300 transition-colors">privacy@ailetter.app</a>. We will respond within 30 days.</p>
        </Section>

        <Section title="7. Cookies">
          <p>AIletter uses minimal cookies required for authentication (session tokens from Firebase). We do not use advertising cookies or tracking pixels.</p>
          <p>You can disable cookies in your browser settings, but this may prevent you from logging into the Service.</p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>AIletter is not intended for users under the age of 16. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it.</p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our website or sending an email to registered users.</p>
          <p>Your continued use of AIletter after changes to this policy constitutes your acceptance of the updated policy.</p>
        </Section>

        <Section title="10. Contact Us">
          <p>For privacy-related questions or to exercise your rights, contact us at:</p>
          <p className="mt-2">
            <a href="mailto:privacy@ailetter.app" className="text-indigo-400 hover:text-indigo-300 transition-colors">privacy@ailetter.app</a>
          </p>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-xs text-gray-600">
        <div className="flex justify-center gap-6 mb-3">
          <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-gray-400 transition-colors text-indigo-400">Privacy Policy</Link>
          <Link to="/" className="hover:text-gray-400 transition-colors">Home</Link>
        </div>
        © 2025 AIletter. All rights reserved.
      </footer>
    </div>
  );
};

export default PrivacyPolicy;