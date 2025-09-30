import React from 'react';
import { ArrowLeft, Home, FileText, Shield, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../Logo';

const LegalPageLayout = ({ 
  title, 
  effectiveDate, 
  lastUpdated, 
  children, 
  documentType = 'legal' 
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Navigate back to previous page or dashboard if no history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and App Link */}
            <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Logo size="default" />
            </Link>

            {/* Navigation Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Back</span>
              </button>
              
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="Go to dashboard"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Document Header Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-8 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                {documentType === 'privacy' ? (
                  <Shield className="w-6 h-6 text-blue-600" />
                ) : (
                  <FileText className="w-6 h-6 text-blue-600" />
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                  {effectiveDate && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Effective Date:</span>
                      <time dateTime={effectiveDate}>{effectiveDate}</time>
                    </div>
                  )}
                  
                  {lastUpdated && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Last Updated:</span>
                      <time dateTime={lastUpdated}>{lastUpdated}</time>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                <strong>Need help?</strong> Contact us at{' '}
                <a
                  href="mailto:customerservice@techbrov.com"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  customerservice@techbrov.com
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <Link
                  to="/terms"
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/privacy"
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Document Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <article className="prose prose-gray max-w-none px-6 py-8">
            <div className="legal-content">
              {children}
            </div>
          </article>
        </div>

        {/* Footer Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <div className="px-6 py-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Logo size="small" />
                <div>
                  <p className="text-sm font-medium text-gray-900">WealthTrak Financial Tracker</p>
                  <p className="text-xs text-gray-600">Secure financial management platform</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <a
                  href="mailto:customerservice@techbrov.com"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <span>Get Support</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>© 2025 Techbrov. All rights reserved.</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Link
                  to="/terms"
                  className="hover:text-gray-900 transition-colors"
                >
                  Terms
                </Link>
                <Link
                  to="/privacy"
                  className="hover:text-gray-900 transition-colors"
                >
                  Privacy
                </Link>
                <a
                  href="mailto:customerservice@techbrov.com"
                  className="hover:text-gray-900 transition-colors"
                >
                  Legal
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Styles for Legal Content */}
      <style jsx>{`
        .legal-content h1 {
          @apply text-3xl font-bold text-gray-900 mt-12 mb-6 first:mt-0;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 1rem;
          position: relative;
          margin-left: 0;
          padding-left: 0;
        }
        
        .legal-content h1::before {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #1e40af);
        }
        
        .legal-content h2 {
          @apply text-xl font-semibold text-blue-800 mt-8 mb-4;
          background: linear-gradient(90deg, #eff6ff, transparent);
          padding: 0.75rem 0.5rem;
          margin-left: 0;
        }
        
        .legal-content h3 {
          @apply text-lg font-semibold text-blue-700 mt-6 mb-3;
          margin-left: 2.5rem;
        }
        
        .legal-content h4 {
          @apply text-base font-semibold text-gray-800 mt-4 mb-2;
        }
        
        .legal-content p {
          @apply text-gray-700 mb-5 leading-relaxed text-base;
          line-height: 1.7;
          margin-left: 1.5rem;
        }
        
        .legal-content ul {
          @apply mb-6 space-y-3;
          list-style: none;
          margin-left: 4rem;
          padding-left: 0;
        }
        
        .legal-content ul li {
          @apply text-gray-700 leading-relaxed relative pl-6;
          line-height: 1.6;
        }
        
        .legal-content ul li::before {
          content: '•';
          @apply text-blue-600 font-bold absolute left-0 top-0;
          font-size: 1.2em;
        }
        
        .legal-content ol {
          @apply list-decimal list-inside mb-6 space-y-3 pl-4;
        }
        
        .legal-content ol li {
          @apply text-gray-700 leading-relaxed pl-2;
          line-height: 1.6;
        }
        
        .legal-content strong {
          @apply font-semibold text-gray-900 bg-yellow-50 px-1 py-0.5 rounded;
        }
        
        .legal-content em {
          @apply italic text-gray-800;
        }
        
        .legal-content .back-to-top {
          @apply inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-8 mb-4 font-medium;
          transition: all 0.2s ease;
        }
        
        .legal-content .back-to-top:hover {
          transform: translateY(-1px);
        }
        
        .legal-content .highlight-box {
          @apply bg-blue-50 border border-blue-200 p-4 my-6 rounded-lg;
        }
        
        .legal-content .warning-box {
          @apply bg-amber-50 border border-amber-200 p-4 my-6 rounded-lg;
        }
        
        .legal-content .important-notice {
          @apply bg-red-50 border border-red-200 p-4 my-6 rounded-lg;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Section spacing */
        .legal-content section {
          @apply mb-12;
        }
        
        .legal-content section:last-child {
          @apply mb-6;
        }
        
        /* Reset margin for top-level introductory paragraphs */
        .legal-content > p:first-child,
        .legal-content section > p:first-of-type {
          margin-left: 0;
        }
        
        /* Paragraphs that are direct descriptions under H2 */
        .legal-content h2 + p {
          margin-left: 1.5rem;
        }
        
        /* Paragraphs under H3 subheadings */
        .legal-content h3 + p {
          margin-left: 2.5rem;
        }
        
        .legal-content a {
          @apply text-blue-600 hover:text-blue-700 underline;
        }
        
        .legal-content blockquote {
          @apply border border-blue-200 p-4 mb-4 bg-blue-50 italic text-gray-700 rounded-lg;
        }
        
        .legal-content code {
          @apply bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800;
        }
        
        .legal-content pre {
          @apply bg-gray-100 p-4 rounded-lg mb-4 overflow-x-auto;
        }
        
        .legal-content pre code {
          @apply bg-transparent p-0;
        }
        
        .legal-content table {
          @apply w-full border-collapse border border-gray-300 mb-4;
        }
        
        .legal-content th {
          @apply bg-gray-100 border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900;
        }
        
        .legal-content td {
          @apply border border-gray-300 px-4 py-2 text-gray-700;
        }
        
        .legal-content hr {
          @apply border-gray-300 my-8;
        }
        
        /* Responsive text scaling */
        @media (max-width: 640px) {
          .legal-content h1 {
            @apply text-xl;
          }
          
          .legal-content h2 {
            @apply text-lg;
          }
          
          .legal-content h3 {
            @apply text-base;
          }
        }
        
        /* Enhanced accessibility */
        .legal-content:focus-within {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        /* Print styles */
        @media print {
          .legal-content {
            font-size: 12pt;
            line-height: 1.4;
            color: black;
          }
          
          .legal-content h1,
          .legal-content h2,
          .legal-content h3 {
            color: black;
            page-break-after: avoid;
          }
          
          .legal-content ul,
          .legal-content ol {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default LegalPageLayout;