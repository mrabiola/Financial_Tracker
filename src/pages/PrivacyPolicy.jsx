import React, { useEffect } from 'react';
import { ChevronUp, Clock, Shield, AlertCircle } from 'lucide-react';
import LegalPageLayout from '../components/legal/LegalPageLayout';

const PrivacyPolicy = () => {
  useEffect(() => {
    // Smooth scrolling behavior for anchor links only
    const links = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <LegalPageLayout
      title="Privacy Policy"
      effectiveDate="September 6, 2025"
      lastUpdated="September 6, 2025"
      documentType="privacy"
    >
      {/* Reading Time & Summary */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span><strong>Estimated reading time:</strong> 12-15 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span><strong>Last updated:</strong> September 6, 2025</span>
          </div>
        </div>

        <div className="highlight-box">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Key Points Summary
          </h3>
          <ul className="space-y-2 text-sm">
            <li>• <strong>We don't sell your data</strong> - Your financial information is never sold to third parties</li>
            <li>• <strong>Bank-level security</strong> - AES-256 encryption and SOC 2 compliance</li>
            <li>• <strong>You control your data</strong> - Export, delete, or modify your information anytime</li>
            <li>• <strong>GDPR & CCPA compliant</strong> - Full privacy rights for EU and California residents</li>
            <li>• <strong>Transparent sharing</strong> - Clear disclosure of when and why we share data</li>
          </ul>
        </div>
      </div>

      {/* Enhanced Table of Contents */}
      <section className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Table of Contents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <a href="#introduction" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">1. Introduction</a>
          <a href="#information-we-collect" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">2. Information We Collect</a>
          <a href="#how-we-use" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">3. How We Use Your Information</a>
          <a href="#information-sharing" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">4. Information Sharing</a>
          <a href="#data-security" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">5. Data Security</a>
          <a href="#privacy-rights" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">6. Your Privacy Rights</a>
          <a href="#data-retention" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">7. Data Retention</a>
          <a href="#cookies" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">8. Cookies & Tracking</a>
          <a href="#third-party" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">9. Third-Party Services</a>
          <a href="#international-transfers" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">10. International Transfers</a>
          <a href="#children" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">11. Children's Privacy</a>
          <a href="#ccpa" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">12. California Rights (CCPA)</a>
          <a href="#gdpr" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">13. European Rights (GDPR)</a>
          <a href="#data-breach" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">14. Data Breach Procedures</a>
          <a href="#changes" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">15. Policy Changes</a>
          <a href="#contact" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">16. Contact Information</a>
        </div>
      </section>

      {/* Introduction */}
      <section id="introduction">
        <h1>Introduction</h1>
        <p>
          WealthTrak ("<strong>we</strong>," "<strong>our</strong>," or "<strong>us</strong>") is committed to protecting your privacy and the confidentiality of your financial information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our financial tracking application and related services (the "<strong>Service</strong>").
        </p>
        <p>
          <strong>By using WealthTrak, you agree to the collection and use of information in accordance with this Privacy Policy.</strong> If you do not agree with our policies and practices, do not download, register with, or use this Service.
        </p>
        <div className="important-notice">
          <p className="mb-2"><strong>Important:</strong> This Privacy Policy applies only to information collected through our Service and not to information collected offline or through third-party sites.</p>
        </div>
        <button onClick={scrollToTop} className="back-to-top">
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </section>

      {/* Information We Collect */}
      <section id="information-we-collect">
        <h1>Information We Collect</h1>
        <p>We collect several types of information from and about users of our Service:</p>
        
        <h2>Personal Information</h2>
        <p>Information by which you may be personally identified:</p>
        
        <h3>Account Information:</h3>
        <ul>
          <li><strong>Email address</strong> - Required for account creation and authentication</li>
          <li><strong>Password</strong> - Encrypted using bcrypt hashing and stored securely</li>
          <li><strong>Profile information</strong> - Name, preferences, profile settings</li>
          <li><strong>Authentication tokens</strong> - Session data and security tokens</li>
        </ul>

        <h3>Financial Data:</h3>
        <ul>
          <li><strong>Account names and types</strong> - Assets, liabilities, and custom categories</li>
          <li><strong>Account balances</strong> - Historical snapshots and current values</li>
          <li><strong>Financial goals</strong> - Goal names, target amounts, and progress tracking</li>
          <li><strong>Net worth calculations</strong> - Historical trends and projections</li>
          <li><strong>Currency preferences</strong> - Selected currencies and exchange rate data</li>
          <li><strong>Transaction data</strong> - Imported or manually entered financial transactions</li>
        </ul>

        <h2>Automatically Collected Information</h2>
        
        <h3>Usage Information:</h3>
        <ul>
          <li><strong>Device information</strong> - Browser type, operating system, device identifiers</li>
          <li><strong>IP address and location</strong> - General geographic location (city/region level)</li>
          <li><strong>Usage patterns</strong> - Feature interactions, time spent, click paths</li>
          <li><strong>Performance metrics</strong> - Error logs, load times, system performance</li>
          <li><strong>Session data</strong> - Login times, session duration, frequency of use</li>
        </ul>

        <h3>Communication Data:</h3>
        <ul>
          <li><strong>Support requests</strong> - Customer service correspondence and tickets</li>
          <li><strong>Feedback</strong> - Survey responses and user feedback submissions</li>
          <li><strong>Marketing preferences</strong> - Email subscription preferences and opt-out data</li>
        </ul>
        
        <button onClick={scrollToTop} className="back-to-top">
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </section>

      {/* How We Use Your Information */}
      <section id="how-we-use">
        <h1>How We Use Your Information</h1>
        <p>We use information that we collect about you or that you provide to us, including personal information, for the following purposes:</p>

        <h2>Service Provision & Maintenance</h2>
        <ul>
          <li>Provide, operate, and maintain the WealthTrak application</li>
          <li>Process and store your financial data securely in encrypted databases</li>
          <li>Generate financial reports, charts, and analytics dashboards</li>
          <li>Synchronize data across your devices and browser sessions</li>
          <li>Provide customer support and technical assistance</li>
          <li>Send service-related communications and notifications</li>
        </ul>

        <h2>Security & Fraud Prevention</h2>
        <ul>
          <li>Verify your identity and authenticate access to your account</li>
          <li>Detect and prevent fraudulent activities and security threats</li>
          <li>Monitor for unauthorized access and suspicious behavior patterns</li>
          <li>Implement data loss prevention and backup procedures</li>
          <li>Maintain comprehensive audit logs for security investigations</li>
          <li>Comply with anti-money laundering and financial regulations</li>
        </ul>

        <h2>Service Improvement & Analytics</h2>
        <ul>
          <li>Analyze usage patterns to improve application functionality and performance</li>
          <li>Develop new features and capabilities based on user behavior</li>
          <li>Optimize application performance and user experience</li>
          <li>Conduct research and analytics on financial management trends (anonymized data only)</li>
          <li>Personalize your dashboard and recommendations</li>
          <li>A/B test new features and interface improvements</li>
        </ul>

        <h2>Legal & Regulatory Compliance</h2>
        <ul>
          <li>Comply with applicable financial services laws and regulations</li>
          <li>Respond to legal requests, court orders, and government investigations</li>
          <li>Enforce our Terms of Service and other legal agreements</li>
          <li>Protect our rights, property, and the safety of our users</li>
          <li>Resolve disputes and prevent harm or illegal activities</li>
          <li>Meet data retention requirements for financial records</li>
        </ul>

        <button onClick={scrollToTop} className="back-to-top">
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </section>

      {/* Information Sharing and Disclosure */}
      <section id="information-sharing">
        <h1>Information Sharing and Disclosure</h1>

        <div className="important-notice">
          <h2>We Do Not Sell Your Data</h2>
          <p><strong>We do not sell, trade, or rent your personal financial information to third parties for commercial purposes. Your financial data is never used for advertising or marketing by third parties.</strong></p>
        </div>

        <h2>Limited Sharing Scenarios</h2>
        <p>We may disclose personal information that we collect or you provide only in the following circumstances:</p>

        <h3>Essential Service Providers:</h3>
        <ul>
          <li><strong>Cloud hosting</strong> - Supabase (PostgreSQL database hosting and authentication)</li>
          <li><strong>Application hosting</strong> - Vercel (static site hosting and CDN services)</li>
          <li><strong>Email services</strong> - Transactional email providers for account notifications</li>
          <li><strong>Analytics tools</strong> - Privacy-focused analytics for application performance</li>
          <li><strong>Customer support</strong> - Support ticket systems and live chat platforms</li>
          <li><strong>Security services</strong> - DDoS protection and intrusion detection systems</li>
        </ul>

        <h3>Legal & Regulatory Requirements:</h3>
        <ul>
          <li>Court orders, subpoenas, or other legal process requiring disclosure</li>
          <li>Government investigations or regulatory agency requests</li>
          <li>Law enforcement requests in connection with criminal investigations</li>
          <li>Protection of rights, property, or safety of WealthTrak, users, or the public</li>
          <li>Prevention of fraud, money laundering, or other illegal activities</li>
          <li>Compliance with financial industry regulations and reporting requirements</li>
        </ul>

        <h3>Business Transfers:</h3>
        <ul>
          <li>Mergers, acquisitions, or sale of all or part of our assets</li>
          <li>Bankruptcy, insolvency, or receivership proceedings</li>
          <li>Corporate restructuring or change of control events</li>
          <li>Due diligence processes for potential business transactions</li>
        </ul>

        <h3>With Your Explicit Consent:</h3>
        <ul>
          <li>Integration with third-party financial services you authorize</li>
          <li>Sharing with authorized family members or financial advisors</li>
          <li>Participation in research studies or surveys (anonymized data)</li>
          <li>Marketing partnerships you explicitly opt into</li>
        </ul>

        <button onClick={scrollToTop} className="back-to-top">
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </section>

      {/* Data Security */}
      <section id="data-security">
        <h1>Data Security</h1>
        <p>We implement comprehensive security measures to protect your financial information:</p>

        <h2>Encryption & Protection</h2>
        
        <h3>Data Encryption:</h3>
        <ul>
          <li><strong>TLS 1.3 encryption</strong> - All data transmitted between your browser and our servers</li>
          <li><strong>AES-256 encryption</strong> - Sensitive financial data encrypted at rest</li>
          <li><strong>Database encryption</strong> - Full database encryption with Supabase security standards</li>
          <li><strong>Key management</strong> - Automated key rotation and secure key storage</li>
          <li><strong>Password hashing</strong> - bcrypt with salt for password protection</li>
        </ul>

        <h3>Access Controls:</h3>
        <ul>
          <li><strong>Multi-factor authentication</strong> - Optional 2FA for enhanced account security</li>
          <li><strong>Role-based access</strong> - Strict employee access controls and permissions</li>
          <li><strong>Session management</strong> - Automatic session timeouts and secure token handling</li>
          <li><strong>IP restrictions</strong> - Monitoring and blocking of suspicious IP addresses</li>
          <li><strong>Security audits</strong> - Regular penetration testing and vulnerability assessments</li>
        </ul>

        <h3>Infrastructure Security:</h3>
        <ul>
          <li><strong>SOC 2 Type II compliance</strong> - Audited security controls and procedures</li>
          <li><strong>Regular updates</strong> - Automated security patches and dependency updates</li>
          <li><strong>Intrusion detection</strong> - 24/7 monitoring for security threats</li>
          <li><strong>Backup procedures</strong> - Encrypted backups with disaster recovery plans</li>
          <li><strong>Physical security</strong> - Data centers with biometric access controls</li>
        </ul>

        <div className="warning-box">
          <p><strong>Security Incident Reporting:</strong> If you suspect unauthorized access to your account, immediately change your password and contact our security team at <a href="mailto:customerservice@techbrov.com">customerservice@techbrov.com</a>.</p>
        </div>

        <button onClick={scrollToTop} className="back-to-top">
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </section>

      {/* Your Privacy Rights */}
      <section id="privacy-rights">
        <h1>Your Privacy Rights</h1>
        <p>You have significant control over your personal information and how it's used:</p>

        <h2>Access & Control Rights</h2>
        <ul>
          <li><strong>Right to Access:</strong> Request copies of all personal data we hold about you</li>
          <li><strong>Right to Rectification:</strong> Correct any inaccurate or incomplete information</li>
          <li><strong>Right to Erasure:</strong> Request deletion of your personal data (subject to legal obligations)</li>
          <li><strong>Right to Portability:</strong> Export your data in machine-readable formats (JSON, CSV, Excel)</li>
          <li><strong>Right to Restrict Processing:</strong> Limit how we use your information</li>
          <li><strong>Right to Object:</strong> Opt out of certain data processing activities</li>
          <li><strong>Right to Withdraw Consent:</strong> Revoke consent for voluntary data processing</li>
        </ul>

        <h2>Account Management</h2>
        <ul>
          <li><strong>Profile updates:</strong> Modify your name, email, and account preferences anytime</li>
          <li><strong>Data export:</strong> Download comprehensive reports of all your financial data</li>
          <li><strong>Selective deletion:</strong> Delete individual accounts, goals, or transactions</li>
          <li><strong>Account closure:</strong> Permanently delete your account and all associated data</li>
          <li><strong>Communication preferences:</strong> Control email notifications and marketing communications</li>
          <li><strong>Privacy settings:</strong> Manage data sharing and analytics preferences</li>
        </ul>

        <h2>How to Exercise Your Rights</h2>
        <div className="highlight-box">
          <h3>Quick Actions in Your Account:</h3>
          <ul className="text-sm">
            <li>• Go to <strong>Settings > Privacy</strong> to manage data preferences</li>
            <li>• Use <strong>Export Data</strong> button to download your information</li>
            <li>• Visit <strong>Account Settings > Delete Account</strong> for account closure</li>
            <li>• Contact support through <strong>Help > Contact Us</strong> for assistance</li>
          </ul>
        </div>

        <h2>Response Times</h2>
        <ul>
          <li><strong>Immediate:</strong> Profile updates and privacy settings changes</li>
          <li><strong>24-48 hours:</strong> Data export requests and account deletions</li>
          <li><strong>30 days:</strong> Complex requests requiring manual processing</li>
          <li><strong>Legal requests:</strong> Up to 45 days for GDPR/CCPA compliance</li>
        </ul>

        <button onClick={scrollToTop} className="back-to-top">
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </section>

      {/* Data Retention */}
      <section id="data-retention">
        <h1>Data Retention Periods</h1>
        <p>We retain different types of data for specific periods based on legal requirements and business needs:</p>

        <h2>Financial Data Retention</h2>
        <ul>
          <li><strong>Active accounts:</strong> Data retained while your account remains active and in use</li>
          <li><strong>Account closure:</strong> Financial data retained for 7 years after account deletion (regulatory compliance)</li>
          <li><strong>Transaction records:</strong> Maintained for 7 years for tax reporting and audit purposes</li>
          <li><strong>Goal tracking:</strong> Historical progress data retained for 3 years after goal completion</li>
        </ul>

        <h2>Technical & Usage Data</h2>
        <ul>
          <li><strong>Usage logs:</strong> Retained for 90 days for security monitoring and debugging</li>
          <li><strong>Performance metrics:</strong> Aggregated analytics data retained for 2 years</li>
          <li><strong>Error logs:</strong> Technical logs retained for 6 months for system improvement</li>
          <li><strong>Security logs:</strong> Access logs retained for 1 year for fraud prevention</li>
        </ul>

        <h2>Communication Records</h2>
        <ul>
          <li><strong>Support tickets:</strong> Customer service communications retained for 3 years</li>
          <li><strong>Email communications:</strong> Service emails retained for 1 year</li>
          <li><strong>Marketing data:</strong> Retained until you withdraw consent or unsubscribe</li>
          <li><strong>Survey responses:</strong> Anonymous feedback retained for 2 years</li>
        </ul>

        <h2>Legal Hold Exceptions</h2>
        <p>Data retention periods may be extended when:</p>
        <ul>
          <li>Legal proceedings or investigations are pending</li>
          <li>Regulatory requests require extended retention</li>
          <li>Suspected fraudulent activity is under investigation</li>
          <li>Tax audits or financial examinations are ongoing</li>
        </ul>

        <button onClick={scrollToTop} className="back-to-top">
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </section>

      {/* Cookies and Tracking */}
      <section id="cookies">
        <h1>Cookies and Tracking Technologies</h1>
        <p>We use various technologies to collect information automatically when you use our Service:</p>

        <h2>Essential Cookies</h2>
        <p>These cookies are necessary for the Service to function and cannot be disabled:</p>
        <ul>
          <li><strong>Authentication cookies:</strong> Keep you logged in securely across sessions</li>
          <li><strong>Security cookies:</strong> Protect against CSRF attacks and unauthorized access</li>
          <li><strong>Preference cookies:</strong> Remember your language, currency, and display settings</li>
          <li><strong>Session cookies:</strong> Maintain your session state and form data</li>
        </ul>

        <h2>Functional Cookies</h2>
        <p>These cookies enhance your experience but are not strictly necessary:</p>
        <ul>
          <li><strong>Remember me:</strong> Keep you logged in for extended periods (optional)</li>
          <li><strong>Form auto-fill:</strong> Remember form inputs for convenience</li>
          <li><strong>Theme preferences:</strong> Save your UI theme and layout choices</li>
          <li><strong>Dashboard customization:</strong> Remember your chart and widget preferences</li>
        </ul>

        <h2>Analytics Cookies (Optional)</h2>
        <p>With your consent, we use privacy-focused analytics to improve our Service:</p>
        <ul>
          <li><strong>Usage statistics:</strong> Anonymous data about feature usage and performance</li>
          <li><strong>Error tracking:</strong> Technical issues to help us fix bugs faster</li>
          <li><strong>Performance monitoring:</strong> Page load times and application responsiveness</li>
          <li><strong>Feature adoption:</strong> Which features are most helpful to users</li>
        </ul>

        <h2>Managing Cookies</h2>
        <div className="highlight-box">
          <h3>Your Cookie Controls:</h3>
          <ul className="text-sm">
            <li>• <strong>Browser settings:</strong> Block or delete cookies through your browser preferences</li>
            <li>• <strong>Privacy settings:</strong> Manage analytics and tracking preferences in your account</li>
            <li>• <strong>Do Not Track:</strong> We respect browser "Do Not Track" signals</li>
            <li>• <strong>Cookie banner:</strong> Manage preferences through our cookie consent banner</li>
          </ul>
        </div>

        <div className="warning-box">
          <p><strong>Important:</strong> Disabling essential cookies may prevent core functionality from working properly. Analytics cookies can be safely disabled without affecting your experience.</p>
        </div>

        <button onClick={scrollToTop} className="back-to-top">
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </section>

      {/* Third-Party Services */}
      <section id="third-party">
        <h1>Third-Party Services Disclosure</h1>
        <p>WealthTrak integrates with carefully selected third-party services to provide our functionality. Here's complete transparency about our service providers:</p>

        <h2>Core Infrastructure</h2>
        
        <h3>Supabase (Database & Authentication)</h3>
        <ul>
          <li><strong>Purpose:</strong> PostgreSQL database hosting, user authentication, and real-time data sync</li>
          <li><strong>Data shared:</strong> All your financial data, account information, and usage logs</li>
          <li><strong>Location:</strong> US-based servers with EU data residency options</li>
          <li><strong>Security:</strong> SOC 2 Type II certified, GDPR compliant</li>
          <li><strong>Privacy policy:</strong> <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a></li>
        </ul>

        <h3>Vercel (Application Hosting)</h3>
        <ul>
          <li><strong>Purpose:</strong> Static site hosting, CDN, and application deployment</li>
          <li><strong>Data shared:</strong> Application code, static assets, and basic access logs</li>
          <li><strong>Location:</strong> Global CDN with servers in multiple regions</li>
          <li><strong>Security:</strong> DDoS protection and automatic HTTPS</li>
          <li><strong>Privacy policy:</strong> <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a></li>
        </ul>

        <h2>Financial Data Services</h2>
        
        <h3>ExchangeRate-API.com (Currency Exchange)</h3>
        <ul>
          <li><strong>Purpose:</strong> Real-time currency exchange rates for multi-currency support</li>
          <li><strong>Data shared:</strong> API requests for currency conversion (no personal data)</li>
          <li><strong>Frequency:</strong> Rate updates cached for 5 minutes to minimize API calls</li>
          <li><strong>Privacy policy:</strong> <a href="https://exchangerate-api.com/privacy" target="_blank" rel="noopener noreferrer">exchangerate-api.com/privacy</a></li>
        </ul>

        <h2>Communication Services</h2>
        
        <h3>Email Service Providers</h3>
        <ul>
          <li><strong>Purpose:</strong> Account verification, password resets, and service notifications</li>
          <li><strong>Data shared:</strong> Email address and message content only</li>
          <li><strong>Retention:</strong> Email sending logs retained for 30 days maximum</li>
          <li><strong>Opt-out:</strong> All emails include unsubscribe options</li>
        </ul>

        <h2>Optional Integrations</h2>
        <p>These services are only used if you explicitly enable them:</p>
        
        <h3>Google OAuth (Optional Login)</h3>
        <ul>
          <li><strong>Purpose:</strong> Single sign-on authentication option</li>
          <li><strong>Data shared:</strong> Basic profile info (name, email, profile picture)</li>
          <li><strong>Control:</strong> You can revoke access anytime through your Google account</li>
          <li><strong>Alternative:</strong> Standard email/password authentication always available</li>
        </ul>

        <h2>Data Processing Agreements</h2>
        <p>All third-party services are bound by:</p>
        <ul>
          <li><strong>Data Processing Agreements (DPAs)</strong> that limit data use to our specified purposes</li>
          <li><strong>Security requirements</strong> meeting or exceeding our standards</li>
          <li><strong>GDPR compliance</strong> for EU resident data processing</li>
          <li><strong>Breach notification</strong> requirements within 24-72 hours</li>
        </ul>

        <button onClick={scrollToTop} className="back-to-top">
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </section>

      {/* International Data Transfers */}
      <section id="international-transfers">
        <h1>International Data Transfers</h1>
        <p>Your information may be transferred to and maintained on servers located outside your country:</p>

        <h2>Data Processing Locations</h2>
        <ul>
          <li><strong>Primary:</strong> United States (AWS/Google Cloud data centers)</li>
          <li><strong>Backup:</strong> European Union (GDPR-compliant data centers)</li>
          <li><strong>CDN:</strong> Global content delivery network for application performance</li>
          <li><strong>Analytics:</strong> Aggregated data processed in privacy-compliant jurisdictions</li>
        </ul>

        <h2>Transfer Safeguards</h2>
        <p>We ensure appropriate safeguards for international data transfers:</p>
        
        <h3>Legal Frameworks:</h3>
        <ul>
          <li><strong>Standard Contractual Clauses (SCCs):</strong> EU-approved data transfer agreements</li>
          <li><strong>Adequacy Decisions:</strong> Transfers to countries with approved data protection</li>
          <li><strong>Binding Corporate Rules:</strong> Internal policies for multinational data handling</li>
          <li><strong>Certification Programs:</strong> Privacy Shield successors and equivalents</li>
        </ul>

        <h3>Technical Safeguards:</h3>
        <ul>
          <li><strong>Encryption in transit:</strong> All data encrypted during transfer</li>
          <li><strong>Access controls:</strong> Strict limitations on who can access international data</li>
          <li><strong>Data minimization:</strong> Only necessary data transferred across borders</li>
          <li><strong>Retention limits:</strong> International copies deleted when no longer needed</li>
        </ul>

        <h2>Your Control Over International Transfers</h2>
        <ul>
          <li><strong>EU residents:</strong> Can request data processing within the EU only</li>
          <li><strong>Data localization:</strong> Option to restrict data to specific geographic regions</li>
          <li><strong>Transfer notifications:</strong> We'll inform you of significant changes to data locations</li>
          <li><strong>Objection rights:</strong> You can object to transfers to specific countries</li>
        </ul>

        <button onClick={scrollToTop} className="back-to-top">
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </section>

      {/* Children's Privacy */}
      <section id="children">
        <h1>Children's Privacy Protection</h1>
        
        <div className="important-notice">
          <p><strong>Age Restriction:</strong> WealthTrak is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18.</p>
        </div>

        <h2>Policy for Minors</h2>
        <ul>
          <li><strong>No accounts under 18:</strong> You must be 18 or older to create a WealthTrak account</li>
          <li><strong>Age verification:</strong> We may request age verification if we suspect underage use</li>
          <li><strong>Parental rights:</strong> Parents can request deletion of their child's data if discovered</li>
          <li><strong>COPPA compliance:</strong> We comply with the Children's Online Privacy Protection Act</li>
        </ul>

        <h2>If We Discover Child Data</h2>
        <p>If we learn we have collected personal information from a child under 18:</p>
        <ul>
          <li>We will delete the account and all associated data immediately</li>
          <li>We will not use the data for any purpose</li>
          <li>We will not share the data with third parties</li>
          <li>We will notify the parent/guardian if contact information is available</li>
        </ul>

        <h2>Reporting Underage Use</h2>
        <div className="highlight-box">
          <p>If you become aware of underage use of WealthTrak, please contact us immediately at <a href="mailto:customerservice@techbrov.com">customerservice@techbrov.com</a> with:</p>
          <ul className="text-sm mt-2">
            <li>• Account information or username</li>
            <li>• Estimated age of the user</li>
            <li>• Your relationship to the child (if applicable)</li>
          </ul>
        </div>

        <button onClick={scrollToTop} className="back-to-top">
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </section>

      {/* California Privacy Rights (CCPA) */}
      <section id="ccpa">
        <h1>California Privacy Rights (CCPA)</h1>
        <p>If you are a California resident, you have additional privacy rights under the California Consumer Privacy Act:</p>

        <h2>Your CCPA Rights</h2>
        
        <h3>Right to Know:</h3>
        <ul>
          <li>Categories of personal information we collect about you</li>
          <li>Specific pieces of personal information we have collected</li>
          <li>Categories of sources from which personal information is collected</li>
          <li>Business or commercial purposes for collecting personal information</li>
          <li>Categories of third parties with whom we share personal information</li>
        </ul>

        <h3>Right to Delete:</h3>
        <ul>
          <li>Request deletion of personal information we have collected about you</li>
          <li>Exceptions for data required for legal compliance or legitimate business operations</li>
          <li>We will inform you of any exceptions and the reason for retention</li>
        </ul>

        <h3>Right to Opt-Out of Sale:</h3>
        <ul>
          <li><strong>We do not sell personal information</strong> and never have</li>
          <li>This right allows you to opt-out if our practices change</li>
          <li>You can set this preference in your Privacy Settings</li>
        </ul>

        <h3>Right to Non-Discrimination:</h3>
        <ul>
          <li>We will not discriminate against you for exercising your CCPA rights</li>
          <li>No denial of services, different pricing, or reduced service quality</li>
          <li>Equal treatment regardless of privacy choices</li>
        </ul>

        <h2>How to Exercise CCPA Rights</h2>
        <div className="highlight-box">
          <h3>Request Methods:</h3>
          <ul className="text-sm">
            <li>• <strong>Email:</strong> <a href="mailto:customerservice@techbrov.com">customerservice@techbrov.com</a></li>
            <li>• <strong>Online form:</strong> Settings > Privacy > CCPA Request</li>
            <li>• <strong>Phone:</strong> 1-800-[PRIVACY] (toll-free)</li>
            <li>• <strong>Mail:</strong> Techbrov Privacy Team, [Address]</li>
          </ul>
        </div>

        <h2>Verification Process</h2>
        <p>To protect your privacy, we verify your identity before processing requests:</p>
        <ul>
          <li><strong>Account holders:</strong> Login to your account and submit request</li>
          <li><strong>Email verification:</strong> Confirm request through your registered email</li>
          <li><strong>Additional verification:</strong> May require additional proof for sensitive requests</li>
          <li><strong>Authorized agents:</strong> Must provide written authorization from you</li>
        </ul>

        <h2>Response Timeframes</h2>
        <ul>
          <li><strong>Acknowledgment:</strong> Within 10 business days</li>
          <li><strong>Response:</strong> Within 45 calendar days</li>
          <li><strong>Extension:</strong> Up to additional 45 days for complex requests</li>
          <li><strong>Free service:</strong> First two requests per year are free</li>
        </ul>

        <button onClick={scrollToTop} className="back-to-top">
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </section>

      {/* European Privacy Rights (GDPR) */}
      <section id="gdpr">
        <h1>European Privacy Rights (GDPR)</h1>
        <p>If you are in the European Economic Area (EEA), United Kingdom, or Switzerland, you have enhanced privacy rights under the General Data Protection Regulation:</p>

        <h2>Legal Basis for Processing</h2>
        <p>We process your personal data based on the following legal grounds:</p>
        
        <h3>Contract Performance:</h3>
        <ul>
          <li>Providing WealthTrak services and core functionality</li>
          <li>Account creation, authentication, and data synchronization</li>
          <li>Customer support and service communications</li>
        </ul>

        <h3>Legitimate Interest:</h3>
        <ul>
          <li>Security monitoring and fraud prevention</li>
          <li>Service improvement and feature development</li>
          <li>Anonymous analytics and performance optimization</li>
          <li>Legal compliance and dispute resolution</li>
        </ul>

        <h3>Consent:</h3>
        <ul>
          <li>Marketing communications and newsletters</li>
          <li>Optional analytics and tracking cookies</li>
          <li>Third-party integrations and data sharing</li>
          <li>Special category data processing (if applicable)</li>
        </ul>

        <h3>Legal Obligation:</h3>
        <ul>
          <li>Financial record retention requirements</li>
          <li>Tax reporting and audit compliance</li>
          <li>Anti-money laundering regulations</li>
          <li>Court orders and legal process</li>
        </ul>

        <h2>Enhanced GDPR Rights</h2>
        
        <h3>Right of Access (Article 15):</h3>
        <ul>
          <li>Comprehensive overview of all personal data we process</li>
          <li>Information about processing purposes, categories, and recipients</li>
          <li>Data retention periods and your rights</li>
          <li>Source of data if not collected directly from you</li>
        </ul>

        <h3>Right to Rectification (Article 16):</h3>
        <ul>
          <li>Correct inaccurate personal data immediately</li>
          <li>Complete incomplete data with supplementary information</li>
          <li>Update outdated information in real-time</li>
        </ul>

        <h3>Right to Erasure - "Right to be Forgotten" (Article 17):</h3>
        <ul>
          <li>Delete personal data when no longer necessary</li>
          <li>Remove data when you withdraw consent</li>
          <li>Erase data processed unlawfully</li>
          <li>Comply with legal deletion obligations</li>
        </ul>

        <h3>Right to Restrict Processing (Article 18):</h3>
        <ul>
          <li>Limit processing while disputing data accuracy</li>
          <li>Restrict unlawful processing instead of deletion</li>
          <li>Maintain data for legal claims or legitimate interests</li>
        </ul>

        <h3>Right to Data Portability (Article 20):</h3>
        <ul>
          <li>Receive your data in structured, machine-readable format</li>
          <li>Transfer data directly to another service provider</li>
          <li>Available for automated processing based on consent/contract</li>
        </ul>

        <h3>Right to Object (Article 21):</h3>
        <ul>
          <li>Object to processing based on legitimate interests</li>
          <li>Opt-out of direct marketing at any time</li>
          <li>Stop automated decision-making and profiling</li>
        </ul>

        <h2>Data Protection Authority</h2>
        <p>You have the right to lodge a complaint with supervisory authorities:</p>
        
        <h3>Lead Supervisory Authority:</h3>
        <ul>
          <li><strong>Ireland:</strong> Data Protection Commission (if EU data processing)</li>
          <li><strong>Your country:</strong> Local data protection authority in your jurisdiction</li>
          <li><strong>Contact info:</strong> Available at <a href="https://edpb.europa.eu/about-edpb/board/members_en" target="_blank" rel="noopener noreferrer">European Data Protection Board</a></li>
        </ul>

        <h2>Data Protection Officer</h2>
        <div className="highlight-box">
          <p>For GDPR-related inquiries and data protection matters:</p>
          <ul className="text-sm mt-2">
            <li>• <strong>Email:</strong> <a href="mailto:customerservice@techbrov.com">customerservice@techbrov.com</a></li>
            <li>• <strong>Response time:</strong> 72 hours for acknowledgment</li>
            <li>• <strong>Languages:</strong> English, with translation services available</li>
          </ul>
        </div>

        <button onClick={scrollToTop} className="back-to-top">
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </section>

      {/* Data Breach Notification */}
      <section id="data-breach">
        <h1>Data Breach Notification Procedures</h1>
        <p>We take data security incidents seriously and have established comprehensive breach response procedures:</p>

        <h2>Incident Response Plan</h2>
        
        <h3>Detection & Assessment (0-6 hours):</h3>
        <ul>
          <li><strong>24/7 monitoring:</strong> Automated systems detect potential security incidents</li>
          <li><strong>Immediate containment:</strong> Isolate affected systems to prevent further damage</li>
          <li><strong>Impact assessment:</strong> Determine scope, affected data, and potential harm</li>
          <li><strong>Team activation:</strong> Engage incident response team and legal counsel</li>
        </ul>

        <h3>Investigation & Mitigation (6-24 hours):</h3>
        <ul>
          <li><strong>Forensic analysis:</strong> Determine cause, extent, and method of breach</li>
          <li><strong>System restoration:</strong> Repair vulnerabilities and restore secure operations</li>
          <li><strong>Evidence preservation:</strong> Maintain logs and evidence for investigation</li>
          <li><strong>Risk evaluation:</strong> Assess likelihood and severity of harm to individuals</li>
        </ul>

        <h2>Notification Requirements</h2>
        
        <h3>Regulatory Notification:</h3>
        <ul>
          <li><strong>EU authorities:</strong> Within 72 hours of discovery (GDPR requirement)</li>
          <li><strong>US state attorneys general:</strong> As required by state breach notification laws</li>
          <li><strong>Industry regulators:</strong> Financial services regulators if applicable</li>
          <li><strong>Law enforcement:</strong> If criminal activity is suspected</li>
        </ul>

        <h3>User Notification:</h3>
        <ul>
          <li><strong>High risk breaches:</strong> Individual notification without undue delay</li>
          <li><strong>Notification method:</strong> Email, in-app notification, or postal mail</li>
          <li><strong>Public disclosure:</strong> Website notice for widespread incidents</li>
          <li><strong>Media notification:</strong> Press release for significant breaches</li>
        </ul>

        <h2>What We Tell You</h2>
        <p>Our breach notifications include:</p>
        <ul>
          <li><strong>Nature of the breach:</strong> What type of incident occurred</li>
          <li><strong>Data involved:</strong> Categories and approximate number of records affected</li>
          <li><strong>Timeline:</strong> When the breach occurred and was discovered</li>
          <li><strong>Steps taken:</strong> Our response actions and remediation measures</li>
          <li><strong>Your actions:</strong> Recommended steps to protect yourself</li>
          <li><strong>Contact information:</strong> How to reach our response team</li>
          <li><strong>Support services:</strong> Identity monitoring or credit protection if warranted</li>
        </ul>

        <h2>Prevention Measures</h2>
        <ul>
          <li><strong>Regular security audits:</strong> Third-party penetration testing and vulnerability assessments</li>
          <li><strong>Employee training:</strong> Security awareness and incident response training</li>
          <li><strong>Access controls:</strong> Principle of least privilege and regular access reviews</li>
          <li><strong>Encryption:</strong> Data encrypted in transit and at rest</li>
          <li><strong>Backup systems:</strong> Secure, encrypted backups for rapid recovery</li>
        </ul>

        <div className="important-notice">
          <h2>Report Security Concerns</h2>
          <p>If you discover a potential security vulnerability or have concerns about data security:</p>
          <ul>
            <li>• <strong>Security team:</strong> <a href="mailto:customerservice@techbrov.com">customerservice@techbrov.com</a></li>
            <li>• <strong>Responsible disclosure:</strong> We offer bug bounty rewards for valid reports</li>
            <li>• <strong>PGP encryption:</strong> Available for sensitive security communications</li>
          </ul>
        </div>

        <button onClick={scrollToTop} className="back-to-top">
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </section>

      {/* Changes to Privacy Policy */}
      <section id="changes">
        <h1>Changes to This Privacy Policy</h1>
        <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.</p>

        <h2>How We Notify You</h2>
        
        <h3>Material Changes:</h3>
        <ul>
          <li><strong>30 days advance notice:</strong> Email notification to all registered users</li>
          <li><strong>In-app notifications:</strong> Prominent banner when you next log in</li>
          <li><strong>Website notice:</strong> Updated effective date and change summary</li>
          <li><strong>Version history:</strong> Archive of previous policy versions</li>
        </ul>

        <h3>Minor Changes:</h3>
        <ul>
          <li><strong>Updated effective date:</strong> Posted on this page immediately</li>
          <li><strong>Change log:</strong> Summary of modifications in policy footer</li>
          <li><strong>Continued use:</strong> Implies acceptance of minor changes</li>
        </ul>

        <h2>Your Options</h2>
        <ul>
          <li><strong>Review changes:</strong> We'll highlight what's different in update notifications</li>
          <li><strong>Object to changes:</strong> Contact us if you disagree with material changes</li>
          <li><strong>Account closure:</strong> Close your account if you don't accept new terms</li>
          <li><strong>Data export:</strong> Download your data before policy changes take effect</li>
        </ul>

        <h2>Change Categories</h2>
        
        <div className="highlight-box">
          <h3>Examples of Material Changes:</h3>
          <ul className="text-sm">
            <li>• New types of personal data collection</li>
            <li>• Changes to data sharing practices</li>
            <li>• New third-party service providers</li>
            <li>• Changes to data retention periods</li>
            <li>• Modifications to your privacy rights</li>
          </ul>
        </div>

        <div className="highlight-box">
          <h3>Examples of Minor Changes:</h3>
          <ul className="text-sm">
            <li>• Clarifications to existing language</li>
            <li>• Updates to contact information</li>
            <li>• Technical corrections and typos</li>
            <li>• Additional examples or explanations</li>
            <li>• Formatting and organization improvements</li>
          </ul>
        </div>

        <button onClick={scrollToTop} className="back-to-top">
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </section>

      {/* Contact Information */}
      <section id="contact">
        <h1>Contact Information</h1>
        <p>We're here to help with any privacy questions or concerns. Here are multiple ways to reach us:</p>

        <h2>Privacy Inquiries</h2>
        <div className="highlight-box">
          <h3>General Privacy Questions:</h3>
          <ul className="text-sm">
            <li>• <strong>Email:</strong> <a href="mailto:customerservice@techbrov.com">customerservice@techbrov.com</a></li>
            <li>• <strong>Response time:</strong> 24-48 hours for most inquiries</li>
            <li>• <strong>Phone:</strong> 1-800-PRIVACY (toll-free, US)</li>
            <li>• <strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM PST</li>
          </ul>
        </div>

        <h2>Data Rights Requests</h2>
        <div className="highlight-box">
          <h3>GDPR, CCPA & Other Privacy Rights:</h3>
          <ul className="text-sm">
            <li>• <strong>Online form:</strong> Settings > Privacy > Data Rights Request</li>
            <li>• <strong>Email:</strong> <a href="mailto:customerservice@techbrov.com">customerservice@techbrov.com</a></li>
            <li>• <strong>Processing time:</strong> 30-45 days maximum</li>
            <li>• <strong>Verification:</strong> Required for all data requests</li>
          </ul>
        </div>

        <h2>Security Concerns</h2>
        <div className="important-notice">
          <h3>Report Security Issues:</h3>
          <ul className="text-sm">
            <li>• <strong>Security team:</strong> <a href="mailto:customerservice@techbrov.com">customerservice@techbrov.com</a></li>
            <li>• <strong>Incident hotline:</strong> 1-800-SECURITY (24/7)</li>
            <li>• <strong>PGP key:</strong> Available for encrypted communications</li>
            <li>• <strong>Bug bounty:</strong> Rewards for responsible disclosure</li>
          </ul>
        </div>

        <h2>Legal & Compliance</h2>
        <div className="highlight-box">
          <h3>Legal Matters:</h3>
          <ul className="text-sm">
            <li>• <strong>Legal team:</strong> <a href="mailto:customerservice@techbrov.com">customerservice@techbrov.com</a></li>
            <li>• <strong>DPO (GDPR):</strong> <a href="mailto:customerservice@techbrov.com">customerservice@techbrov.com</a></li>
            <li>• <strong>Compliance:</strong> <a href="mailto:customerservice@techbrov.com">customerservice@techbrov.com</a></li>
          </ul>
        </div>

        <h2>Postal Address</h2>
        <p>For formal legal notices and written correspondence:</p>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm">
          Techbrov Privacy Team<br/>
          [Street Address]<br/>
          [City, State ZIP Code]<br/>
          United States
        </div>

        <h2>International Contacts</h2>
        
        <h3>European Representative:</h3>
        <ul>
          <li><strong>EU Privacy Officer:</strong> <a href="mailto:customerservice@techbrov.com">customerservice@techbrov.com</a></li>
          <li><strong>Languages:</strong> English, with translation services available</li>
          <li><strong>Local time:</strong> CET/CEST business hours</li>
        </ul>

        <h3>UK Representative:</h3>
        <ul>
          <li><strong>UK Privacy Officer:</strong> <a href="mailto:customerservice@techbrov.com">customerservice@techbrov.com</a></li>
          <li><strong>ICO liaison:</strong> For Information Commissioner's Office matters</li>
        </ul>

        <h2>Response Commitments</h2>
        <ul>
          <li><strong>Acknowledgment:</strong> All emails acknowledged within 24 hours</li>
          <li><strong>Initial response:</strong> Substantive response within 72 hours</li>
          <li><strong>Resolution:</strong> Most issues resolved within 5 business days</li>
          <li><strong>Escalation:</strong> Complex matters escalated to senior privacy team</li>
          <li><strong>Follow-up:</strong> We'll check that your issue was fully resolved</li>
        </ul>

        <button onClick={scrollToTop} className="back-to-top">
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </section>

      {/* Final Note */}
      <section className="border-t border-gray-200 pt-8">
        <hr className="mb-8" />
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-gray-800">
            <strong>This Privacy Policy is effective as of September 6, 2025, and applies to all users of WealthTrak financial tracking services.</strong>
          </p>
          <p className="text-sm text-gray-600">
            <strong>Document version:</strong> 2.0 | <strong>Last review:</strong> September 6, 2025 | <strong>Next review:</strong> March 6, 2026
          </p>
          <p className="text-sm text-gray-500">
            © 2025 Techbrov. All rights reserved.
          </p>
        </div>
      </section>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;