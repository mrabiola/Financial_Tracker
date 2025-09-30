import React, { useEffect } from 'react';
import { ChevronUp, Clock, AlertCircle, FileText } from 'lucide-react';
import LegalPageLayout from '../components/legal/LegalPageLayout';

const TermsOfService = () => {
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
      title="Terms of Service"
      effectiveDate="September 6, 2025"
      lastUpdated="September 6, 2025"
      documentType="legal"
    >
      {/* Reading Time & Summary */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span><strong>Estimated reading time:</strong> 8-10 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span><strong>Document type:</strong> Legal Agreement</span>
          </div>
        </div>

        <div className="highlight-box">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Key Terms Summary
          </h3>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Age requirement:</strong> You must be 18+ to use WealthTrak</li>
            <li>• <strong>Personal use only:</strong> For tracking your own financial information</li>
            <li>• <strong>No financial advice:</strong> WealthTrak provides tools, not investment guidance</li>
            <li>• <strong>Data responsibility:</strong> You're responsible for accuracy of information you enter</li>
            <li>• <strong>Account security:</strong> Keep your login credentials secure and private</li>
          </ul>
        </div>
      </div>

      {/* Enhanced Table of Contents */}
      <section className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Table of Contents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <a href="#agreement" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">1. Agreement to Terms</a>
          <a href="#service-description" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">2. Description of Service</a>
          <a href="#user-accounts" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">3. User Accounts</a>
          <a href="#acceptable-use" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">4. Acceptable Use</a>
          <a href="#financial-disclaimers" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">5. Financial Information</a>
          <a href="#intellectual-property" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">6. Intellectual Property</a>
          <a href="#privacy-data" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">7. Privacy and Data</a>
          <a href="#payment-terms" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">8. Payment Terms</a>
          <a href="#limitation-liability" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">9. Limitation of Liability</a>
          <a href="#indemnification" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">10. Indemnification</a>
          <a href="#dispute-resolution" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">11. Dispute Resolution</a>
          <a href="#termination" className="text-blue-700 hover:text-blue-900 underline hover:bg-blue-100 p-2 rounded transition-colors">12. Termination</a>
        </div>
      </section>

      {/* Agreement to Terms */}
      <section id="agreement">
        <h1>Agreement to Terms</h1>
        <p>
          By accessing or using WealthTrak ("<strong>the Service</strong>," "<strong>our Service</strong>"), you agree to be bound by these Terms of Service ("<strong>Terms</strong>"). If you disagree with any part of these terms, you may not access the Service.
        </p>
        <p>
          WealthTrak is operated by Techbrov ("<strong>we</strong>," "<strong>us</strong>," or "<strong>our</strong>"). These Terms govern your use of our financial tracking application and related services.
        </p>
      </section>

      {/* Description of Service */}
      <section id="service-description">
        <h1>Description of Service</h1>

        <h2>Overview</h2>
        <p>WealthTrak is a personal financial management application that helps users:</p>
        <ul>
          <li>Track assets and liabilities</li>
          <li>Monitor net worth over time</li>
          <li>Set and track financial goals</li>
          <li>Generate financial reports and analytics</li>
          <li>Import and export financial data</li>
          <li>Manage multi-currency portfolios</li>
        </ul>

        <h2>Service Availability</h2>
        <ul>
          <li>The Service is provided on an "as is" and "as available" basis</li>
          <li>We strive for 99.9% uptime but do not guarantee uninterrupted access</li>
          <li>Scheduled maintenance will be announced in advance when possible</li>
          <li>Emergency maintenance may be performed without notice</li>
        </ul>
      </section>

      {/* User Accounts */}
      <section id="user-accounts">
        <h1>User Accounts</h1>

        <h2>Account Creation</h2>
        <p>To use WealthTrak, you must:</p>
        <ul>
          <li>Be at least 18 years of age</li>
          <li>Provide accurate and complete information</li>
          <li>Maintain the security of your account credentials</li>
          <li>Promptly update any changes to your information</li>
          <li>Use the Service only for lawful purposes</li>
        </ul>

        <h2>Account Security</h2>
        <p>You are responsible for:</p>
        <ul>
          <li>Maintaining the confidentiality of your password</li>
          <li>All activities that occur under your account</li>
          <li>Immediately notifying us of any unauthorized use</li>
          <li>Using strong passwords and enabling two-factor authentication</li>
          <li>Logging out of shared or public devices</li>
        </ul>

        <h2>Account Termination</h2>
        <p>We may terminate or suspend your account if you:</p>
        <ul>
          <li>Violate these Terms of Service</li>
          <li>Engage in fraudulent or illegal activities</li>
          <li>Attempt to compromise system security</li>
          <li>Harass other users or our staff</li>
          <li>Fail to pay applicable fees (if any)</li>
        </ul>
      </section>

      {/* Acceptable Use */}
      <section id="acceptable-use">
        <h1>Acceptable Use</h1>

        <h2>Permitted Uses</h2>
        <p>You may use WealthTrak to:</p>
        <ul>
          <li>Manage your personal financial information</li>
          <li>Track your financial goals and progress</li>
          <li>Generate reports for personal use</li>
          <li>Export your data in supported formats</li>
          <li>Share the Service with family members (if authorized)</li>
        </ul>

        <div className="highlight-box">
          <p className="font-semibold text-blue-800 mb-2">Pro Tip</p>
          <p className="text-sm text-blue-700">
            WealthTrak works best when you regularly update your financial data and set realistic goals for tracking progress.
          </p>
        </div>

        <h2>Prohibited Activities</h2>
        <p>You may not:</p>
        <ul>
          <li>Use the Service for any illegal purpose</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Upload malicious code or software</li>
          <li>Interfere with the Service's operation</li>
          <li>Reverse engineer or decompile our software</li>
          <li>Create accounts through automated means</li>
          <li>Sell, transfer, or assign your account</li>
          <li>Impersonate others or provide false information</li>
          <li>Use the Service to store non-financial data inappropriately</li>
          <li>Attempt to bypass security measures</li>
        </ul>

        <div className="back-to-top">
          <button onClick={scrollToTop} className="inline-flex items-center gap-1">
            <ChevronUp className="w-4 h-4" />
            Back to top
          </button>
        </div>
      </section>

      {/* Financial Information and Disclaimers */}
      <section id="financial-disclaimers">
        <h1>Financial Information and Disclaimers</h1>

        <h2>Not Financial Advice</h2>
        <p>WealthTrak provides tools for tracking and analyzing your financial information but does not provide:</p>
        <ul>
          <li>Investment advice or recommendations</li>
          <li>Tax preparation services</li>
          <li>Legal or financial planning advice</li>
          <li>Professional consultation services</li>
          <li>Guarantee of financial outcomes</li>
        </ul>

        <h2>Data Accuracy</h2>
        <ul>
          <li>You are responsible for the accuracy of data you input</li>
          <li>We do not verify the accuracy of your financial information</li>
          <li>Currency exchange rates are provided for reference only</li>
          <li>Historical data may not reflect current market conditions</li>
          <li>You should consult with qualified professionals for financial decisions</li>
        </ul>

        <h2>Third-Party Financial Data</h2>
        <p>When using integrated financial services:</p>
        <ul>
          <li>Data accuracy depends on third-party providers</li>
          <li>We are not responsible for third-party service failures</li>
          <li>Connection issues may affect data synchronization</li>
          <li>You are responsible for verifying imported data accuracy</li>
        </ul>

        <div className="important-notice">
          <p className="font-semibold text-red-800 mb-2">Important Notice</p>
          <p className="text-sm text-red-700">
            WealthTrak is a financial tracking tool only. Always consult with qualified financial professionals before making investment decisions.
          </p>
        </div>

        <div className="back-to-top">
          <button onClick={scrollToTop} className="inline-flex items-center gap-1">
            <ChevronUp className="w-4 h-4" />
            Back to top
          </button>
        </div>
      </section>

      {/* Intellectual Property Rights */}
      <section id="intellectual-property">
        <h1>Intellectual Property Rights</h1>

        <h2>Our Rights</h2>
        <p>
          WealthTrak and its original content, features, and functionality are owned by Techbrov and are protected by:
        </p>
        <ul>
          <li>Copyright laws</li>
          <li>Trademark laws</li>
          <li>Patent laws</li>
          <li>Trade secret laws</li>
          <li>Other intellectual property laws</li>
        </ul>

        <h2>Your Rights</h2>
        <p>You retain ownership of:</p>
        <ul>
          <li>Your personal financial data</li>
          <li>Content you create using the Service</li>
          <li>Files you upload or import</li>
          <li>Custom categories and tags you create</li>
        </ul>

        <h2>License to Use</h2>
        <p>We grant you a limited, non-exclusive, non-transferable license to:</p>
        <ul>
          <li>Use the Service for personal purposes</li>
          <li>Access and use our mobile and web applications</li>
          <li>Export your data in supported formats</li>
          <li>Share reports with authorized parties (e.g., financial advisors)</li>
        </ul>

        <h2>User-Generated Content</h2>
        <p>By using WealthTrak, you grant us a license to:</p>
        <ul>
          <li>Store and process your financial data</li>
          <li>Generate analytics and reports</li>
          <li>Provide customer support</li>
          <li>Improve our services (using anonymized data only)</li>
        </ul>

        <div className="back-to-top">
          <button onClick={scrollToTop} className="inline-flex items-center gap-1">
            <ChevronUp className="w-4 h-4" />
            Back to top
          </button>
        </div>
      </section>

      {/* Privacy and Data Protection */}
      <section id="privacy-data">
        <h1>Privacy and Data Protection</h1>

        <h2>Data Collection</h2>
        <p>
          Our collection and use of your information is governed by our{' '}
          <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
            Privacy Policy
          </a>
          , which is incorporated into these Terms by reference.
        </p>

        <h2>Data Security</h2>
        <p>We implement industry-standard security measures including:</p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security audits and assessments</li>
          <li>Access controls and authentication systems</li>
          <li>Monitoring for suspicious activities</li>
        </ul>

        <h2>Data Retention</h2>
        <ul>
          <li>We retain your data as long as your account is active</li>
          <li>Data may be retained for legal and regulatory compliance</li>
          <li>You may request data deletion subject to legal requirements</li>
          <li>Deleted data may remain in backups for up to 90 days</li>
        </ul>

        <div className="back-to-top">
          <button onClick={scrollToTop} className="inline-flex items-center gap-1">
            <ChevronUp className="w-4 h-4" />
            Back to top
          </button>
        </div>
      </section>

      {/* Payment Terms */}
      <section id="payment-terms">
        <h1>Payment Terms (Future Implementation)</h1>

        <h2>Subscription Services</h2>
        <p>If we introduce paid features:</p>
        <ul>
          <li>Pricing will be clearly displayed before purchase</li>
          <li>Subscriptions will auto-renew unless cancelled</li>
          <li>Refunds will be provided according to our refund policy</li>
          <li>Price changes will be communicated with 30 days notice</li>
        </ul>

        <h2>Free Tier</h2>
        <ul>
          <li>Basic features will remain available at no cost</li>
          <li>Usage limits may apply to free accounts</li>
          <li>We reserve the right to modify free tier features</li>
          <li>Premium features may require subscription</li>
        </ul>

        <div className="back-to-top">
          <button onClick={scrollToTop} className="inline-flex items-center gap-1">
            <ChevronUp className="w-4 h-4" />
            Back to top
          </button>
        </div>
      </section>

      {/* Limitation of Liability */}
      <section id="limitation-liability">
        <h1>Limitation of Liability</h1>

        <h2>Service Disclaimer</h2>
        <p>
          WealthTrak is provided "as is" without warranties of any kind, either express or implied, including but not limited to:
        </p>
        <ul>
          <li>Merchantability</li>
          <li>Fitness for a particular purpose</li>
          <li>Non-infringement</li>
          <li>Uninterrupted operation</li>
          <li>Data accuracy or completeness</li>
        </ul>

        <h2>Limitation of Damages</h2>
        <p>To the maximum extent permitted by law, Techbrov shall not be liable for:</p>
        <ul>
          <li>Indirect, incidental, or consequential damages</li>
          <li>Loss of profits, data, or use</li>
          <li>Business interruption</li>
          <li>Personal injury or property damage</li>
          <li>Financial losses resulting from Service use</li>
        </ul>

        <h2>Maximum Liability</h2>
        <p>Our total liability to you for any damages shall not exceed:</p>
        <ul>
          <li>The amount paid by you for the Service in the 12 months preceding the claim</li>
          <li>$100 if you have not paid for the Service</li>
          <li>The minimum amount required by applicable law</li>
        </ul>

        <div className="back-to-top">
          <button onClick={scrollToTop} className="inline-flex items-center gap-1">
            <ChevronUp className="w-4 h-4" />
            Back to top
          </button>
        </div>
      </section>

      {/* Indemnification */}
      <section id="indemnification">
        <h1>Indemnification</h1>
        <p>
          You agree to defend, indemnify, and hold harmless Techbrov and its officers, directors, employees, and agents from any claims, damages, obligations, losses, liabilities, costs, and expenses arising from:
        </p>
        <ul>
          <li>Your use of the Service</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any third-party rights</li>
          <li>Any content you submit through the Service</li>
          <li>Your negligent or wrongful conduct</li>
        </ul>

        <div className="back-to-top">
          <button onClick={scrollToTop} className="inline-flex items-center gap-1">
            <ChevronUp className="w-4 h-4" />
            Back to top
          </button>
        </div>
      </section>

      {/* Dispute Resolution */}
      <section id="dispute-resolution">
        <h1>Dispute Resolution</h1>

        <h2>Governing Law</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws of [Jurisdiction], without regard to conflict of law principles.
        </p>

        <h2>Arbitration Agreement</h2>
        <p>
          Any dispute, controversy, or claim arising out of or relating to these Terms or the Service shall be resolved through binding arbitration conducted by [Arbitration Service] in accordance with their rules.
        </p>

        <h2>Class Action Waiver</h2>
        <p>
          You agree that disputes will be resolved on an individual basis and waive any right to participate in class action lawsuits or class-wide arbitration.
        </p>

        <h2>Small Claims Exception</h2>
        <p>
          Either party may pursue claims in small claims court if the claim qualifies and remains in small claims court.
        </p>

        <div className="back-to-top">
          <button onClick={scrollToTop} className="inline-flex items-center gap-1">
            <ChevronUp className="w-4 h-4" />
            Back to top
          </button>
        </div>
      </section>

      {/* Modifications to Service and Terms */}
      <section id="modifications">
        <h1>Modifications to Service and Terms</h1>

        <h2>Service Changes</h2>
        <p>We reserve the right to:</p>
        <ul>
          <li>Modify or discontinue features</li>
          <li>Update the Service with improvements</li>
          <li>Change system requirements</li>
          <li>Alter data storage or processing methods</li>
          <li>Add or remove third-party integrations</li>
        </ul>

        <h2>Terms Updates</h2>
        <p>We may modify these Terms at any time by:</p>
        <ul>
          <li>Posting updated Terms on our website</li>
          <li>Sending email notification to registered users</li>
          <li>Displaying in-app notifications</li>
          <li>Providing 30 days notice for material changes</li>
        </ul>

        <h2>Continued Use</h2>
        <p>
          Your continued use of the Service after Terms modifications constitutes acceptance of the updated Terms.
        </p>

        <div className="back-to-top">
          <button onClick={scrollToTop} className="inline-flex items-center gap-1">
            <ChevronUp className="w-4 h-4" />
            Back to top
          </button>
        </div>
      </section>

      {/* Termination */}
      <section id="termination">
        <h1>Termination</h1>

        <h2>Termination by You</h2>
        <p>You may terminate your account at any time by:</p>
        <ul>
          <li>Using the account deletion feature in settings</li>
          <li>Contacting our customer support</li>
          <li>Sending written notice to our business address</li>
        </ul>

        <h2>Termination by Us</h2>
        <p>We may terminate your access immediately if:</p>
        <ul>
          <li>You breach these Terms of Service</li>
          <li>You engage in prohibited activities</li>
          <li>Required by law or court order</li>
          <li>We cease operations (with 30 days notice)</li>
        </ul>

        <h2>Effect of Termination</h2>
        <p>Upon termination:</p>
        <ul>
          <li>Your right to use the Service immediately ceases</li>
          <li>Your data may be deleted after a grace period</li>
          <li>Outstanding obligations survive termination</li>
          <li>You may request data export before deletion</li>
        </ul>

        <div className="back-to-top">
          <button onClick={scrollToTop} className="inline-flex items-center gap-1">
            <ChevronUp className="w-4 h-4" />
            Back to top
          </button>
        </div>
      </section>

      {/* Miscellaneous */}
      <section id="miscellaneous">
        <h1>Miscellaneous</h1>

        <h2>Entire Agreement</h2>
        <p>
          These Terms, together with our Privacy Policy, constitute the entire agreement between you and Techbrov regarding the Service.
        </p>

        <h2>Severability</h2>
        <p>
          If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
        </p>

        <h2>Waiver</h2>
        <p>
          Our failure to enforce any right or provision of these Terms will not constitute a waiver of such right or provision.
        </p>

        <h2>Assignment</h2>
        <p>
          You may not assign or transfer these Terms or your account without our written consent. We may assign these Terms without restriction.
        </p>

        <h2>Force Majeure</h2>
        <p>
          We are not liable for any failure to perform our obligations due to causes beyond our reasonable control, including natural disasters, war, terrorism, or government actions.
        </p>

        <h2>Survival</h2>
        <p>
          Provisions that by their nature should survive termination will survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
        </p>

        <div className="back-to-top">
          <button onClick={scrollToTop} className="inline-flex items-center gap-1">
            <ChevronUp className="w-4 h-4" />
            Back to top
          </button>
        </div>
      </section>

      {/* Contact Information */}
      <section id="contact">
        <h1>Contact Information</h1>

        <h2>Customer Support</h2>
        <p>For questions about these Terms or the Service:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:customerservice@techbrov.com">customerservice@techbrov.com</a></li>
          <li><strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM PST</li>
        </ul>

        <h2>Legal Notices</h2>
        <p>For legal matters and formal communications:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:customerservice@techbrov.com">customerservice@techbrov.com</a></li>
          <li><strong>Mail:</strong> Techbrov Legal Department, [Physical Address]</li>
        </ul>

        <h2>Business Information</h2>
        <ul>
          <li><strong>Company:</strong> Techbrov</li>
          <li><strong>Registration:</strong> [Business Registration Details]</li>
          <li><strong>Address:</strong> [Official Business Address]</li>
        </ul>

        <div className="back-to-top">
          <button onClick={scrollToTop} className="inline-flex items-center gap-1">
            <ChevronUp className="w-4 h-4" />
            Back to top
          </button>
        </div>
      </section>

      {/* Final Note */}
      <section>
        <hr />
        <p className="text-center text-sm text-gray-600 mt-8">
          <strong>By using WealthTrak, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
        </p>
        <p className="text-center text-sm text-gray-500">
          © 2025 Techbrov. All rights reserved.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default TermsOfService;