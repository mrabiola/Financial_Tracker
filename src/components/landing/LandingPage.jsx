import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Shield, 
  Globe,
  ArrowRight,
  Check,
  Activity,
  Layers,
  Zap,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

// Mini Sparkline Component
const MiniSparkline = () => {
  const data = [30, 45, 35, 55, 40, 60, 50, 70, 65, 80, 75, 90];
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(79, 133, 255)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(79, 133, 255)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon 
        points={`0,100 ${points} 100,100`}
        fill="url(#sparkGradient)"
      />
      <polyline
        points={points}
        fill="none"
        stroke="rgb(79, 133, 255)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Mini Bar Chart Component
const MiniBarChart = () => {
  const bars = [45, 65, 55, 80, 70, 90, 75];
  return (
    <div className="flex items-end justify-between gap-1 h-12">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="flex-1 bg-brand-500 rounded-t"
          initial={{ height: 0 }}
          whileInView={{ height: `${height}%` }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  const stats = [
    { value: '10,000+', label: 'Active Users' },
    { value: '$2.5B+', label: 'Assets Tracked' },
    { value: '30+', label: 'Currencies' },
    { value: '99.9%', label: 'Uptime' },
  ];

  const testimonials = [
    {
      quote: "Finally, a simple tool that shows me exactly where I stand financially. The health score changed how I think about money.",
      author: "Maria K.",
      role: "Software Engineer",
      avatar: "MK"
    },
    {
      quote: "Tracking across multiple accounts and currencies used to be a nightmare. WealthTrak made it effortless.",
      author: "James T.",
      role: "Marketing Director",
      avatar: "JT"
    },
    {
      quote: "No more spreadsheet chaos. I can finally see my net worth grow over time in one beautiful dashboard.",
      author: "Priya S.",
      role: "Product Manager",
      avatar: "PS"
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="default" showText={true} />
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate('/login')}
                className="text-slate-600 hover:text-slate-900 px-3 sm:px-4 py-2 text-sm font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-brand-500 hover:bg-brand-600 text-white px-4 sm:px-5 py-2 text-sm font-medium rounded-full transition-all shadow-md hover:shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 lg:pt-28 lg:pb-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-mesh-gradient" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-50" />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left: Copy */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.div 
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 border border-brand-100 rounded-full mb-6"
              >
                <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-sm font-medium text-brand-700">
                  Free Financial Health Check
                </span>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tighter leading-[1.1] mb-6"
              >
                Your complete
                <span className="block text-brand-500">financial picture,</span>
                <span className="block">in one place.</span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-lg sm:text-xl text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0"
              >
                Track all your assets, debts, and goals across accounts and currencies. 
                Get your financial health score in 2 minutes.
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
              >
                <button
                  onClick={() => navigate('/diagnostic')}
                  className="group inline-flex items-center justify-center px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white text-lg font-semibold rounded-full transition-all shadow-glow hover:shadow-glow-lg transform hover:-translate-y-0.5"
                >
                  <Activity className="mr-2 h-5 w-5" />
                  Check Your Score
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 text-lg font-semibold rounded-full border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  Create Free Account
                </button>
              </motion.div>
              
              {/* Trust indicators */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 justify-center lg:justify-start"
              >
                {['No credit card', '2-min setup', 'Bank-level security'].map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-brand-500" />
                    {item}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Hero Card (3D Floating Effect) */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={scaleIn}
              className="relative hidden lg:block"
            >
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-brand-500/20 rounded-3xl blur-3xl transform scale-90" />
              
              {/* Main Card */}
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 p-8 animate-float">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Financial Health Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-slate-900">B+</span>
                      <span className="text-sm font-medium text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full">78/100</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                {/* Score Bars */}
                <div className="space-y-4 mb-6">
                  {[
                    { label: 'Liquidity', score: 83, color: 'bg-brand-500' },
                    { label: 'Solvency', score: 73, color: 'bg-brand-400' },
                    { label: 'Savings Rate', score: 80, color: 'bg-brand-600' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-600">{item.label}</span>
                        <span className="font-medium text-slate-900">{item.score}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${item.color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Quick Win */}
                <div className="p-4 bg-brand-50/50 border border-brand-100 rounded-2xl">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-brand-600">🎯 Quick Win:</span> Add $4,000 to your emergency fund to reach an A grade.
                  </p>
                </div>
                
                {/* Decorative Badge */}
                <div className="absolute -top-3 -right-3 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  LIVE DEMO
                </div>
              </div>
              
              {/* Secondary Floating Card */}
              <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-xl border border-slate-200/60 p-4 w-48">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-xs text-slate-500">Net Worth</span>
                </div>
                <p className="text-xl font-bold text-slate-900">$127,450</p>
                <p className="text-xs text-green-600 font-medium">+12.4% this year</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="relative py-8 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                className="text-center"
              >
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bento Features Grid */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tighter mb-4"
            >
              Everything you need to
              <span className="text-brand-500"> build wealth</span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-slate-600 max-w-2xl mx-auto"
            >
              Powerful features designed to give you complete clarity over your financial life
            </motion.p>
          </motion.div>

          {/* Bento Grid */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          >
            {/* Large: Net Worth Visualization - 2 cols */}
            <motion.div 
              variants={fadeInUp}
              className="md:col-span-2 group bg-slate-50 hover:bg-white rounded-3xl p-8 border border-slate-200/60 hover:border-slate-200 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-2xl bg-brand-100 text-brand-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-brand-600 bg-brand-50 px-3 py-1 rounded-full">Popular</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Net Worth Visualization</h3>
              <p className="text-slate-600 mb-6">Track your wealth growth over time with intuitive, beautiful charts.</p>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Total Net Worth</span>
                  <span className="font-semibold text-slate-900">$127,450</span>
                </div>
                <MiniSparkline />
              </div>
            </motion.div>

            {/* Multi-Currency - 2 cols */}
            <motion.div 
              variants={fadeInUp}
              className="md:col-span-2 group bg-slate-50 hover:bg-white rounded-3xl p-8 border border-slate-200/60 hover:border-slate-200 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="p-3 rounded-2xl bg-brand-100 text-brand-600 inline-block mb-6">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Multi-Currency Support</h3>
              <p className="text-slate-600 mb-6">30+ currencies with live exchange rates. Perfect for global finances.</p>
              <div className="flex flex-wrap gap-2">
                {['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'SGD'].map((currency) => (
                  <span key={currency} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
                    {currency}
                  </span>
                ))}
                <span className="px-3 py-1.5 bg-brand-50 text-brand-600 rounded-lg text-sm font-medium">
                  +22 more
                </span>
              </div>
            </motion.div>

            {/* Multi-Account - 1 col */}
            <motion.div 
              variants={fadeInUp}
              className="group bg-slate-50 hover:bg-white rounded-3xl p-6 border border-slate-200/60 hover:border-slate-200 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="p-3 rounded-2xl bg-brand-100 text-brand-600 inline-block mb-3">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Multi-Account</h3>
              <p className="text-sm text-slate-600 mb-3">Banks, investments, crypto — all in one dashboard.</p>
              {/* Mini account icons */}
              <div className="flex items-center gap-1.5">
                {['🏦', '📈', '💳', '₿'].map((icon, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm"
                  >
                    {icon}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Financial Goals - 1 col */}
            <motion.div 
              variants={fadeInUp}
              className="group bg-slate-50 hover:bg-white rounded-3xl p-6 border border-slate-200/60 hover:border-slate-200 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="p-3 rounded-2xl bg-brand-100 text-brand-600 inline-block mb-3">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Financial Goals</h3>
              <p className="text-sm text-slate-600 mb-3">Set targets and track progress toward each milestone.</p>
              {/* Mini progress bar */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-brand-500 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: '75%' }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-500">75%</span>
                </div>
              </div>
            </motion.div>

            {/* Cash Flow - 1 col */}
            <motion.div 
              variants={fadeInUp}
              className="group bg-slate-50 hover:bg-white rounded-3xl p-6 border border-slate-200/60 hover:border-slate-200 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="p-3 rounded-2xl bg-brand-100 text-brand-600 inline-block mb-3">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Cash Flow</h3>
              <p className="text-sm text-slate-600 mb-3">Understand your income and expense patterns.</p>
              <MiniBarChart />
            </motion.div>

            {/* Security - 1 col */}
            <motion.div 
              variants={fadeInUp}
              className="group bg-slate-50 hover:bg-white rounded-3xl p-6 border border-slate-200/60 hover:border-slate-200 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="p-3 rounded-2xl bg-brand-100 text-brand-600 inline-block mb-3">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Bank-Level Security</h3>
              <p className="text-sm text-slate-600 mb-3">Your data is encrypted and never shared.</p>
              {/* Security badges */}
              <div className="flex items-center gap-1.5">
                <div className="px-2 py-1 bg-emerald-50 border border-emerald-200 rounded text-xs font-medium text-emerald-700">256-bit</div>
                <div className="px-2 py-1 bg-emerald-50 border border-emerald-200 rounded text-xs font-medium text-emerald-700">SSL</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Diagnostic CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 border border-white/25 rounded-full mb-6"
            >
              <Zap className="h-4 w-4 text-brand-100" />
              <span className="text-sm font-medium text-white">Free • No signup required</span>
            </motion.div>
            
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tighter mb-4"
            >
              Get your Financial Health Score
              <span className="block text-brand-100">in 2 minutes</span>
            </motion.h2>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-white/80 mb-8 max-w-2xl mx-auto"
            >
              Answer 4 quick questions and get your personalized financial health grade, 
              plus actionable recommendations to improve.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8"
            >
              {['Health Grade (A-F)', 'Personalized Tips', 'Freedom Timeline', 'Instant Results'].map((item, i) => (
                <span key={i} className="flex items-center gap-2 text-white/90 text-sm">
                  <Check className="h-4 w-4 text-brand-100" />
                  {item}
                </span>
              ))}
            </motion.div>
            
            <motion.button
              variants={fadeInUp}
              onClick={() => navigate('/diagnostic')}
              className="group inline-flex items-center justify-center px-10 py-5 bg-white text-brand-600 text-lg font-bold rounded-full transition-all shadow-2xl hover:shadow-glow transform hover:-translate-y-1"
            >
              <Activity className="mr-2 h-6 w-6" />
              Start Free Assessment
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-10"
          >
            <motion.p 
              variants={fadeInUp}
              className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-4"
            >
              Testimonials
            </motion.p>
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tighter"
            >
              Loved by people like you
            </motion.h2>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-4 lg:gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 border border-slate-100"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-brand-500 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-slate-700 mb-4 leading-relaxed text-sm">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-semibold text-xs">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.author}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tighter mb-4"
            >
              Ready to take control of
              <span className="block text-brand-500">your financial future?</span>
            </motion.h2>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto"
            >
              Join thousands of people who've transformed their relationship with money using WealthTrak.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={() => navigate('/diagnostic')}
                className="group inline-flex items-center justify-center px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white text-lg font-semibold rounded-full transition-all shadow-glow hover:shadow-glow-lg transform hover:-translate-y-0.5"
              >
                <Activity className="mr-2 h-5 w-5" />
                Get Your Free Score
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 text-lg font-semibold rounded-full border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                Create Free Account
              </button>
            </motion.div>
            
            <motion.p 
              variants={fadeInUp}
              className="mt-6 text-sm text-slate-500"
            >
              No credit card required • Free forever tier available
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Logo size="small" showText={true} variant="dark" />
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">
                Privacy Policy
              </button>
              <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">
                Terms of Service
              </button>
              <a href="mailto:support@wealthtrak.xyz" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} WealthTrak
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
