import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  BarChart3, 
  Briefcase, 
  Layers, 
  Award, 
  ShieldCheck, 
  Zap, 
  Play, 
  ChevronRight, 
  ChevronDown, 
  Mail, 
  Github, 
  Linkedin, 
  MapPin, 
  Users, 
  Percent, 
  GraduationCap,
  MessageSquare,
  Search,
  BookOpen,
  Target,
  Trophy
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { THEMES } from '../lib/themes.ts';
import { ThemeSelector } from '../components/ThemeSelector.tsx';
import { Logo } from '../components/Logo.tsx';
import { motion, AnimatePresence } from 'motion/react';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const hoverScaleButton = {
  hover: { scale: 1.025, y: -2, transition: { type: "spring", stiffness: 400, damping: 10 } },
  tap: { scale: 0.975, y: 0 }
};

interface LandingProps {
  user: any;
  onNavigate: (page: 'login' | 'register' | 'history' | 'new-analysis') => void;
}

export function Landing({ user, onNavigate }: LandingProps) {
  const { theme, setTheme } = useTheme();
  
  // Mock interactive job role selector state for Hero visual
  const [selectedRole, setSelectedRole] = useState<'frontend' | 'data' | 'product'>('frontend');
  
  // Pricing billing period toggle
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  // FAQ open/close state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Demo modal or video player overlay state
  const [showDemo, setShowDemo] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setTimeout(() => {
      setContactLoading(false);
      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactMsg('');
      setTimeout(() => setContactSuccess(false), 5000);
    }, 1200);
  };

  // Roles details for interactive Hero Dashboard mockup
  const roleDetails = {
    frontend: {
      title: "Senior Full-Stack Engineer",
      match: 78,
      atsScore: 84,
      skills: [
        { name: "React & TypeScript", type: "matched" },
        { name: "GraphQL & REST", type: "matched" },
        { name: "Docker", type: "partial" },
        { name: "Tailwind CSS", type: "matched" },
        { name: "Node.js (Express)", type: "partial" },
        { name: "PostgreSQL / Prisma", type: "missing" },
        { name: "Kubernetes Orchestration", type: "missing" }
      ],
      roadmap: [
        { step: "1. Advanced Backend Development", time: "Week 1-2", status: "In Progress" },
        { step: "2. Database Design & SQL Masterclass", time: "Week 3-4", status: "Upcoming" },
        { step: "3. Docker & Kubernetes Fundamentals", time: "Week 5-6", status: "Upcoming" }
      ]
    },
    data: {
      title: "Data Scientist (AI/ML)",
      match: 62,
      atsScore: 71,
      skills: [
        { name: "Python (Pandas/NumPy)", type: "matched" },
        { name: "SQL & Relational Databases", type: "matched" },
        { name: "Scikit-Learn", type: "partial" },
        { name: "TensorFlow & PyTorch", type: "missing" },
        { name: "Data Visualization (D3.js)", type: "partial" },
        { name: "Hadoop & Spark", type: "missing" },
        { name: "MLOps & Deployments", type: "missing" }
      ],
      roadmap: [
        { step: "1. Deep Learning Neural Networks", time: "Week 1-3", status: "In Progress" },
        { step: "2. Large Scale Distributed Systems", time: "Week 4-5", status: "Upcoming" },
        { step: "3. AWS SageMaker & MLOps Pipeline", time: "Week 6-8", status: "Upcoming" }
      ]
    },
    product: {
      title: "Technical Product Manager",
      match: 85,
      atsScore: 91,
      skills: [
        { name: "Agile & Scrum Methodologies", type: "matched" },
        { name: "System Architecture Design", type: "partial" },
        { name: "Product Roadmap Planning", type: "matched" },
        { name: "SQL Data Analytics", type: "matched" },
        { name: "User Research & Interviews", type: "matched" },
        { name: "A/B Testing Strategies", type: "partial" },
        { name: "Financial Modeling", type: "missing" }
      ],
      roadmap: [
        { step: "1. Microservices & APIs deep-dive", time: "Week 1-2", status: "In Progress" },
        { step: "2. Advanced Data-Driven Analytics", time: "Week 3", status: "Upcoming" },
        { step: "3. Corporate Finance Essentials", time: "Week 4-5", status: "Upcoming" }
      ]
    }
  };

  const activeMockup = roleDetails[selectedRole];

  return (
    <div className={`w-full relative font-sans min-h-screen transition-colors duration-300 ${theme.isDark ? 'text-slate-100' : 'text-slate-800'}`}>
      {/* Absolute floating gradient backgrounds */}
      {theme.isDark && (
        <>
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
          <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 left-10 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        </>
      )}

      {/* Sticky Navbar */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
        theme.isDark 
          ? 'bg-neutral-950/80 border-white/10 text-white' 
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm shadow-slate-100/50'
      }`} style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 h-20 flex justify-between items-center gap-4">
          {/* Left-aligned Group: Logo & Navigation */}
          <div className="flex items-center gap-4 lg:gap-8 flex-1 min-w-0">
            {/* Logo */}
            <div className="cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Logo isDark={theme.isDark} size="md" />
            </div>

            {/* Desktop Navigation - shifted left, shown on larger screens to avoid congestion */}
            <nav className={`hidden lg:flex items-center gap-4 xl:gap-6 text-xs font-bold tracking-wider uppercase shrink-0 ${theme.isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <a href="#features" className="hover:text-blue-500 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-blue-500 transition-colors">How It Works</a>
              <a href="#dashboard-preview" className="hover:text-blue-500 transition-colors">Dashboard</a>
              <a href="#pricing" className="hover:text-blue-500 transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-blue-500 transition-colors">FAQ</a>
              <a href="#contact" className="hover:text-blue-500 transition-colors">Contact</a>
            </nav>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Dynamic Theme Selection dropdown on Landing */}
            <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />

            {user ? (
              <motion.button
                variants={hoverScaleButton}
                whileHover="hover"
                whileTap="tap"
                onClick={() => onNavigate('history')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  theme.isDark 
                    ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                    : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                }`}
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 text-blue-500" />
              </motion.button>
            ) : (
              <>
                <motion.button
                  variants={hoverScaleButton}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => onNavigate('login')}
                  className={`hidden sm:inline-block px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                    theme.isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </motion.button>
                <motion.button
                  variants={hoverScaleButton}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => onNavigate('register')}
                  className="px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Get Started</span>
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
          >
            <motion.div 
              variants={staggerItem}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] uppercase tracking-widest font-black ${
                theme.isDark ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              <Cpu className={`h-3.5 w-3.5 ${theme.isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              Next-Gen AI Semantic Match Engine
            </motion.div>
            
            <motion.h1 
              variants={staggerItem}
              className={`text-5xl sm:text-6xl md:text-7xl font-display font-black leading-[1.05] tracking-tighter ${theme.isDark ? 'text-white' : 'text-slate-900'}`}
            >
              Bridge the <br className="hidden sm:inline" />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
                theme.isDark 
                  ? 'from-sky-400 via-indigo-400 to-fuchsia-500' 
                  : 'from-blue-600 via-indigo-600 to-purple-600'
              }`}>
                Knowledge Gap
              </span> with AI
            </motion.h1>
            
            <motion.p 
              variants={staggerItem}
              className={`text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}
            >
              An intelligent semantic analyzer that parses raw candidate experiences against elite job descriptors. Discover structural alignment, track ATS metadata, and gain a clear career roadmap instantly.
            </motion.p>
 
            <motion.div 
              variants={staggerItem}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
            >
              <motion.button
                variants={hoverScaleButton}
                whileHover="hover"
                whileTap="tap"
                onClick={() => user ? onNavigate('new-analysis') : onNavigate('login')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                Analyze Resume Now
                <ArrowRight className="h-4 w-4" />
              </motion.button>
              <motion.button
                variants={hoverScaleButton}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setShowDemo(true)}
                className={`w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  theme.isDark 
                    ? 'text-slate-300 bg-white/5 border-white/10 hover:bg-white/10' 
                    : 'text-slate-700 bg-slate-100 border-slate-200 hover:bg-slate-200 shadow-sm'
                }`}
              >
                <Play className={`h-4 w-4 ${theme.isDark ? 'text-blue-400 fill-blue-400' : 'text-blue-600 fill-blue-600'}`} />
                Watch 1-Min Demo
              </motion.button>
            </motion.div>
 
            {/* Micro proof counts */}
            <motion.div 
              variants={staggerItem}
              className={`flex flex-wrap justify-center lg:justify-start items-center gap-x-8 gap-y-3 pt-8 border-t text-xs font-bold ${
                theme.isDark ? 'border-white/5 text-slate-500' : 'border-slate-200 text-slate-500'
              }`}
            >
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-blue-500" /> 100% GDPR Privacy Compliant</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-blue-500" /> ATS Optimization Metrics</span>
            </motion.div>
          </motion.div>

          {/* Hero Right Content: Futuristic AI Interactive Dashboard */}
          <motion.div 
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: 1,
              y: [0, -8, 0]
            }}
            transition={{
              opacity: { duration: 0.8, ease: "easeOut" },
              x: { duration: 0.8, ease: "easeOut" },
              scale: { duration: 0.8, ease: "easeOut" },
              y: {
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut"
              }
            }}
            className="lg:col-span-6 relative"
          >
            {/* Glowing element shadow background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl -z-10 animate-pulse"></div>
            
            <div className={`p-6 shadow-2xl relative flex flex-col gap-5 overflow-hidden ${theme.card}`}>
              {/* Window Header */}
              <div className={`flex justify-between items-center pb-4 border-b ${theme.isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                  <span className={`text-[10px] font-mono ml-2 ${theme.isDark ? 'text-slate-500' : 'text-slate-400'}`}>skill-gap-agent.v1</span>
                </div>
                {/* Active Interactive Role Tabs */}
                <div className="flex gap-1">
                  {(['frontend', 'data', 'product'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        selectedRole === role 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : theme.isDark 
                            ? 'bg-white/5 text-slate-400 hover:text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Analysis Dashboard Content wrapped in AnimatePresence */}
              <div className="relative min-h-[350px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedRole}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className={`text-sm font-black ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>{activeMockup.title}</h3>
                        <p className={`text-[10px] uppercase tracking-widest font-semibold ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Mock Resume Score Assessment</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-2.5 py-1 text-center">
                          <span className="block text-xs font-black text-blue-500">{activeMockup.match}%</span>
                          <span className={`block text-[8px] font-bold uppercase tracking-wider ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Match</span>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-2.5 py-1 text-center">
                          <span className="block text-xs font-black text-purple-500">ATS {activeMockup.atsScore}</span>
                          <span className={`block text-[8px] font-bold uppercase tracking-wider ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Score</span>
                        </div>
                      </div>
                    </div>

                    {/* Simulated Progress ring */}
                    <div className={`rounded-2xl p-4 flex items-center justify-between gap-4 border ${
                      theme.isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="space-y-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Semantic Evaluation</span>
                        <p className={`text-xs leading-relaxed font-semibold ${theme.isDark ? 'text-slate-300' : 'text-slate-600'}`}>Your resume exhibits strong core matches, but is missing critical deployment architectures requested by typical hiring panels.</p>
                      </div>
                      <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="rgba(128,128,128,0.1)" strokeWidth="4" fill="transparent" />
                          <circle cx="32" cy="32" r="28" stroke="#3b82f6" strokeWidth="4" fill="transparent"
                            strokeDasharray={175}
                            strokeDashoffset={175 - (175 * activeMockup.match) / 100}
                            className="transition-all duration-700 ease-out"
                          />
                        </svg>
                        <span className={`absolute text-xs font-black font-mono ${theme.isDark ? 'text-white' : 'text-slate-950'}`}>{activeMockup.match}%</span>
                      </div>
                    </div>

                    {/* Semantic skill tags profile */}
                    <div className="space-y-1.5">
                      <span className={`text-[10px] font-black uppercase tracking-widest block ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Skills Evaluated</span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeMockup.skills.map((skill, idx) => {
                          const style = skill.type === 'matched'
                            ? 'bg-blue-500/15 border-blue-500/20 text-blue-500'
                            : skill.type === 'partial'
                              ? 'bg-amber-500/15 border-amber-500/20 text-amber-500'
                              : 'bg-rose-500/15 border-rose-500/20 text-rose-500';
                          return (
                            <span key={idx} className={`px-2 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${style}`}>
                              {skill.name} {skill.type === 'partial' && '(adjacent)'}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Customized learning plan mock timeline */}
                    <div className={`space-y-2 pt-2 border-t ${theme.isDark ? 'border-white/5' : 'border-slate-100'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-black uppercase tracking-widest block ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>AI-Powered Roadmap Preview</span>
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
                          <Zap className="h-3 w-3" /> Personalized
                        </span>
                      </div>
                      <div className="space-y-2">
                        {activeMockup.roadmap.map((item, idx) => (
                          <div key={idx} className={`flex justify-between items-center rounded-xl p-2 text-xs border ${
                            theme.isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-150'
                          }`}>
                            <div className="flex items-center gap-2 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-md shadow-blue-500/50"></span>
                              <span className={`truncate max-w-[200px] ${theme.isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.step}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold font-mono ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.time}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase ${
                                item.status === 'In Progress' ? 'bg-blue-600/20 text-blue-500' : theme.isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-200 text-slate-500'
                              }`}>{item.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={`relative py-16 border-y ${theme.isDark ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className={`text-3xl sm:text-4xl font-black bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>50,000+</div>
            <div className={`text-[10px] font-bold uppercase tracking-widest ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Resumes Analyzed</div>
          </div>
          <div className="space-y-1">
            <div className={`text-3xl sm:text-4xl font-black bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>95%</div>
            <div className={`text-[10px] font-bold uppercase tracking-widest ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Analysis Accuracy</div>
          </div>
          <div className="space-y-1">
            <div className={`text-3xl sm:text-4xl font-black bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>1M+</div>
            <div className={`text-[10px] font-bold uppercase tracking-widest ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Skills Evaluated</div>
          </div>
          <div className="space-y-1">
            <div className={`text-3xl sm:text-4xl font-black bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500 ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>500+</div>
            <div className={`text-[10px] font-bold uppercase tracking-widest ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Job Roles Supported</div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Architectural Features</span>
          <h2 className={`text-4xl sm:text-5xl font-display font-black tracking-tight leading-[1.1] ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
            Elite Technology Behind the Engine
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed font-semibold ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Advanced semantic parsers built to decrypt complex job descriptions and mapping your true career capability without generic boilerplate checks.
          </p>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Feature 1 */}
          <motion.div variants={staggerItem} className={`${theme.card} p-6 border hover:border-blue-500/30 transition-all hover:-translate-y-1.5 flex flex-col gap-4 group`}>
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Resume Analysis</h3>
            <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              We decompose technical frameworks, tool stacks, and core capabilities from plain-text files or raw structures instantly.
            </p>
          </motion.div>
 
          {/* Feature 2 */}
          <motion.div variants={staggerItem} className={`${theme.card} p-6 border hover:border-indigo-500/30 transition-all hover:-translate-y-1.5 flex flex-col gap-4 group`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Job Comparison</h3>
            <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Seamless mapping of job description requirements directly against your parsed candidate parameters utilizing intelligent synonyms.
            </p>
          </motion.div>
 
          {/* Feature 3 */}
          <motion.div variants={staggerItem} className={`${theme.card} p-6 border hover:border-purple-500/30 transition-all hover:-translate-y-1.5 flex flex-col gap-4 group`}>
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Award className="h-5 w-5" />
            </div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Skill Gap Detection</h3>
            <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Immediate identification of matched, partially matched, and completely missing technological requirements.
            </p>
          </motion.div>
 
          {/* Feature 4 */}
          <motion.div variants={staggerItem} className={`${theme.card} p-6 border hover:border-pink-500/30 transition-all hover:-translate-y-1.5 flex flex-col gap-4 group`}>
            <div className="w-10 h-10 rounded-xl bg-pink-600/10 border border-pink-500/20 flex items-center justify-center text-pink-500 group-hover:bg-pink-600 group-hover:text-white transition-all">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>AI Learning Roadmap</h3>
            <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Custom-built action paths sorted by priority milestones, complete with contextual reasoning on why they are important.
            </p>
          </motion.div>
 
          {/* Feature 5 */}
          <motion.div variants={staggerItem} className={`${theme.card} p-6 border hover:border-blue-500/30 transition-all hover:-translate-y-1.5 flex flex-col gap-4 group`}>
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Learning Resources</h3>
            <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Curated resource suggestions dynamically populated with accurate learning URLs targeting specific technologies.
            </p>
          </motion.div>
 
          {/* Feature 6 */}
          <motion.div variants={staggerItem} className={`${theme.card} p-6 border hover:border-indigo-500/30 transition-all hover:-translate-y-1.5 flex flex-col gap-4 group`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Career Insights</h3>
            <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Dynamic real-time professional advice from simulated coaching frameworks pointing out critical career-changing actions.
            </p>
          </motion.div>
 
          {/* Feature 7 */}
          <motion.div variants={staggerItem} className={`${theme.card} p-6 border hover:border-purple-500/30 transition-all hover:-translate-y-1.5 flex flex-col gap-4 group`}>
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>ATS Resume Score</h3>
            <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              A comprehensive scoring engine analyzing semantic density, keywords presence, and structural formatting.
            </p>
          </motion.div>
 
          {/* Feature 8 */}
          <motion.div variants={staggerItem} className={`${theme.card} p-6 border hover:border-pink-500/30 transition-all hover:-translate-y-1.5 flex flex-col gap-4 group`}>
            <div className="w-10 h-10 rounded-xl bg-pink-600/10 border border-pink-500/20 flex items-center justify-center text-pink-500 group-hover:bg-pink-600 group-hover:text-white transition-all">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Progress Tracking</h3>
            <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Keep a detailed historical log of previous scans and track your readiness scores over multiple targeted applications.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={`relative py-24 border-t ${theme.isDark ? 'border-white/5 bg-white/2' : 'border-slate-200 bg-slate-50'}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Seamless Flow</span>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
              Six Simple Steps to Career Transformation
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              From raw documents to a comprehensive personalized learning journey. No configurations, no fluff.
            </p>
          </div>

          {/* Steps Horizontal/Vertical timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className={`${theme.card} p-6 flex flex-col gap-4 relative border`}>
              <span className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black font-mono text-sm shadow-lg shadow-blue-500/20">
                01
              </span>
              <div className="pt-4 space-y-2">
                <h3 className={`text-base font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Upload Resume</h3>
                <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Provide your existing resume via copy-paste or simple file upload. We support various textual layouts directly.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`${theme.card} p-6 flex flex-col gap-4 relative border`}>
              <span className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black font-mono text-sm shadow-lg shadow-indigo-500/20">
                02
              </span>
              <div className="pt-4 space-y-2">
                <h3 className={`text-base font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Enter JD</h3>
                <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Paste the requirements, technical expectations, and details of the job listing you are actively aiming for.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`${theme.card} p-6 flex flex-col gap-4 relative border`}>
              <span className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center font-black font-mono text-sm shadow-lg shadow-purple-500/20">
                03
              </span>
              <div className="pt-4 space-y-2">
                <h3 className={`text-base font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>AI Analyzes Skills</h3>
                <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  The semantic agent runs immediate checks parsing frameworks, context synonyms, and core developer tools.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className={`${theme.card} p-6 flex flex-col gap-4 relative border`}>
              <span className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-600 text-white flex items-center justify-center font-black font-mono text-sm shadow-lg shadow-pink-500/20">
                04
              </span>
              <div className="pt-4 space-y-2">
                <h3 className={`text-base font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>View Gap Report</h3>
                <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Inspect comprehensive visualizations showing exact matches alongside critical gaps requiring immediate attention.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className={`${theme.card} p-6 flex flex-col gap-4 relative border`}>
              <span className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-orange-600 text-white flex items-center justify-center font-black font-mono text-sm shadow-lg shadow-rose-500/20">
                05
              </span>
              <div className="pt-4 space-y-2">
                <h3 className={`text-base font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Receive Learning Plan</h3>
                <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Acquire tailored priority roadmaps, resources, and concrete steps needed to secure active qualifications.
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className={`${theme.card} p-6 flex flex-col gap-4 relative border`}>
              <span className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-blue-600 text-white flex items-center justify-center font-black font-mono text-sm shadow-lg shadow-orange-500/20">
                06
              </span>
              <div className="pt-4 space-y-2">
                <h3 className={`text-base font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Track Progress</h3>
                <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Save historical summaries to track score improvements over multiple custom job hunts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="dashboard-preview" className="py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">High Fidelity Preview</span>
          <h2 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
            The Professional Workspace Interface
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            A sneak-peek of the real user analytics dashboard. Simple layouts, deep custom insights, and rich visual telemetry.
          </p>
        </div>

        {/* Detailed High Fidelity Mockup */}
        <div className={`${theme.card} p-6 md:p-8 shadow-2xl relative overflow-hidden border`}>
          {/* Glowing dot highlights */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left overview */}
            <div className={`lg:col-span-4 flex flex-col justify-between gap-6 border rounded-2xl p-6 ${
              theme.isDark ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="space-y-4">
                <span className="text-[10px] bg-blue-500/10 text-blue-500 font-extrabold px-3 py-1.5 rounded-full border border-blue-500/20">Workspace Overview</span>
                <h3 className={`text-xl font-black ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>ATS Readiness Index</h3>
                <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  A high score indicates strong keyword correlation, semantic coverage of frameworks, and minimal layout errors.
                </p>
              </div>

              {/* Progress and scores */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={theme.isDark ? 'text-slate-300' : 'text-slate-700'}>Technical Skill Alignment</span>
                    <span className="text-blue-500 font-bold">88%</span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${theme.isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={theme.isDark ? 'text-slate-300' : 'text-slate-700'}>Soft Skill Core Alignment</span>
                    <span className="text-purple-500 font-bold">74%</span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${theme.isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '74%' }}></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={theme.isDark ? 'text-slate-300' : 'text-slate-700'}>Industry Relevance Check</span>
                    <span className="text-cyan-500 font-bold">91%</span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${theme.isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '91%' }}></div>
                  </div>
                </div>
              </div>

              <div className={`pt-4 border-t flex items-center justify-between text-[11px] font-mono ${theme.isDark ? 'border-white/5 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                <span>Evaluated: 2026-07-02</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Verified</span>
              </div>
            </div>

            {/* Right details panel */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`border rounded-2xl p-4 space-y-2 ${theme.isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Skills</span>
                  <p className={`text-2xl font-black ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>42</p>
                  <p className={`text-[10px] font-semibold leading-none ${theme.isDark ? 'text-slate-500' : 'text-slate-400'}`}>Mapped across CV</p>
                </div>
                <div className={`border rounded-2xl p-4 space-y-2 ${theme.isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Critical Gaps</span>
                  <p className="text-2xl font-black text-rose-500">5</p>
                  <p className="text-[10px] text-rose-500/80 font-semibold leading-none">Requires roadmap action</p>
                </div>
                <div className={`border rounded-2xl p-4 space-y-2 ${theme.isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Readiness Meter</span>
                  <p className="text-2xl font-black text-blue-500">High</p>
                  <p className={`text-[10px] font-semibold leading-none ${theme.isDark ? 'text-slate-500' : 'text-slate-400'}`}>Highly competitive status</p>
                </div>
              </div>

              {/* Dynamic simulated chart placeholder or detailed summary */}
              <div className={`border rounded-2xl p-5 space-y-4 ${theme.isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest block ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>AI Priority Analysis Output</span>
                <div className="space-y-3">
                  <div className={`border rounded-xl p-3.5 space-y-1 ${theme.isDark ? 'bg-rose-500/5 border-rose-500/10' : 'bg-rose-50 border-rose-150'}`}>
                    <div className="flex justify-between items-center text-xs font-bold text-rose-500">
                      <span>Missing: Distributed Caching (Redis/Memcached)</span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-[9px]">High Priority</span>
                    </div>
                    <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>Critical for web-scale system architecture described in Section 4. Prepare microservice response scenarios.</p>
                  </div>
                  <div className={`border rounded-xl p-3.5 space-y-1 ${theme.isDark ? 'bg-amber-500/5 border-amber-500/10' : 'bg-amber-50 border-amber-150'}`}>
                    <div className="flex justify-between items-center text-xs font-bold text-amber-500">
                      <span>Partial Match: Cloud Native Containerization (Docker)</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-[9px]">Medium Priority</span>
                    </div>
                    <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>Adjacent infrastructure detected. Focus on explaining multi-stage builds and optimization strategies.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Why Us</span>
          <h2 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
            Crafted for Tangible Career Growth
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            We don't just dump lists of keywords. We deliver a cohesive, personalized journey built on real industry standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={`${theme.card} p-6 border space-y-4`}>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Users className="h-5 w-5" />
            </div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Save Countless Hours</h3>
            <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Skip researching what a tech role requires. Get a concise breakdown of missing technologies in less than a single minute.
            </p>
          </div>

          <div className={`${theme.card} p-6 border space-y-4`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Improve Employability</h3>
            <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Map your development precisely to job markets. Focus heavily on acquiring skills that directly influence real hiring budgets.
            </p>
          </div>

          <div className={`${theme.card} p-6 border space-y-4`}>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Better Interview Prep</h3>
            <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Understand the "why" behind every missing skill. Step into screening interviews confident of what managers want to hear.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-24 border-y ${theme.isDark ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Success Stories</span>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
              Trusted by Job Seekers Worldwide
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              See how modern software engineers, product leaders, and students level up their interview readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className={`${theme.card} p-6 border flex flex-col justify-between gap-6`}>
              <p className={`text-xs leading-relaxed font-medium italic ${theme.isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                "SkillGapAgent changed how I approach job hunting. It pointed out I was missing advanced Redis configurations in my resume. Added it, practiced, and got my offer!"
              </p>
              <div className={`flex items-center gap-3 pt-4 border-t ${theme.isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="w-9 h-9 rounded-full bg-blue-600/20 flex items-center justify-center text-xs font-bold text-blue-500">
                  AK
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Alex Kowalski</h4>
                  <p className="text-[9px] text-slate-500 font-semibold uppercase">Full-stack Engineer at Vercel</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className={`${theme.card} p-6 border flex flex-col justify-between gap-6`}>
              <p className={`text-xs leading-relaxed font-medium italic ${theme.isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                "As a CS student, mapping out the technologies requested in real roles felt incredibly overwhelming. This agent organized a beautiful step-by-step priority roadmap."
              </p>
              <div className={`flex items-center gap-3 pt-4 border-t ${theme.isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="w-9 h-9 rounded-full bg-indigo-600/20 flex items-center justify-center text-xs font-bold text-indigo-500">
                  SM
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Sarah Miller</h4>
                  <p className="text-[9px] text-slate-500 font-semibold uppercase">Computer Science Student, Stanford</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className={`${theme.card} p-6 border flex flex-col justify-between gap-6`}>
              <p className={`text-xs leading-relaxed font-medium italic ${theme.isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                "The semantic matching is extremely sophisticated. It doesn't just do word matching; it actually understands adjacent technological systems and tools perfectly."
              </p>
              <div className={`flex items-center gap-3 pt-4 border-t ${theme.isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="w-9 h-9 rounded-full bg-purple-600/20 flex items-center justify-center text-xs font-bold text-purple-500">
                  JH
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Jason Huang</h4>
                  <p className="text-[9px] text-slate-500 font-semibold uppercase">Senior Technical Recruiter</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Clear & Fair Pricing</span>
          <h2 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
            Flexible Plans for Any Stage
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Start completely free or upgrade to receive unlimited AI analyses, deep custom resource compilation, and historic tracking.
          </p>

          {/* Billing period switcher */}
          <div className={`inline-flex items-center gap-2 border rounded-full p-1 mt-4 ${theme.isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                billingPeriod === 'monthly' ? 'bg-blue-600 text-white shadow-md' : (theme.isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                billingPeriod === 'yearly' ? 'bg-blue-600 text-white shadow-md' : (theme.isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan 1 */}
          <div className={`${theme.card} p-8 border flex flex-col justify-between gap-8 transition-all hover:border-blue-500/20`}>
            <div className="space-y-4">
              <div>
                <h3 className={`text-sm font-black uppercase tracking-wider ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Free Starter</h3>
                <p className={`text-xs font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>For casual review & baseline check</p>
              </div>
              <div className="flex items-baseline gap-1 pt-4">
                <span className={`text-4xl font-black ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>$0</span>
                <span className="text-xs text-slate-500 font-bold uppercase">forever</span>
              </div>
              <ul className={`space-y-3 pt-6 border-t text-xs font-medium ${theme.isDark ? 'border-white/5 text-slate-300' : 'border-slate-100 text-slate-600'}`}>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> 2 Detailed Resume Scans</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Basic Skill Gap Profiles</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Static Learning Roadmap</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Standard Parsing Synonyms</li>
              </ul>
            </div>
            <button 
              onClick={() => user ? onNavigate('new-analysis') : onNavigate('register')}
              className={`w-full py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                theme.isDark ? 'text-white bg-white/5 border-white/10 hover:bg-white/10' : 'text-slate-800 bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
              }`}
            >
              Get Started Free
            </button>
          </div>

          {/* Plan 2 - Highlighted Pro */}
          <div className={`${theme.card} p-8 border border-blue-500/30 flex flex-col justify-between gap-8 relative transition-all hover:border-blue-500/50 shadow-blue-500/5 shadow-2xl`}>
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white font-black uppercase text-[9px] tracking-widest shadow-md">
              MOST POPULAR
            </span>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-blue-500 uppercase tracking-wider">Pro Analyst</h3>
                <p className={`text-xs font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>For active job hunters & professionals</p>
              </div>
              <div className="flex items-baseline gap-1 pt-4">
                <span className={`text-4xl font-black ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
                  ${billingPeriod === 'yearly' ? '12' : '15'}
                </span>
                <span className="text-xs text-slate-500 font-bold uppercase">/ month</span>
              </div>
              <ul className={`space-y-3 pt-6 border-t text-xs font-medium ${theme.isDark ? 'border-white/5 text-slate-300' : 'border-slate-100 text-slate-600'}`}>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Unlimited Resume Scans</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Advanced Semantic Mapping</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Personalized Learning Resources</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> High-Accuracy ATS Optimization</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Save Historical Analysis Logs</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Career Coach Advice Panel</li>
              </ul>
            </div>
            <button 
              onClick={() => user ? onNavigate('new-analysis') : onNavigate('register')}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              Unlock Pro Potential
            </button>
          </div>

          {/* Plan 3 */}
          <div className={`${theme.card} p-8 border flex flex-col justify-between gap-8 transition-all hover:border-blue-500/20`}>
            <div className="space-y-4">
              <div>
                <h3 className={`text-sm font-black uppercase tracking-wider ${theme.isDark ? 'text-purple-400' : 'text-purple-600'}`}>Enterprise</h3>
                <p className={`text-xs font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>For universities & bootcamp cohorts</p>
              </div>
              <div className="flex items-baseline gap-1 pt-4">
                <span className={`text-4xl font-black ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Custom</span>
              </div>
              <ul className={`space-y-3 pt-6 border-t text-xs font-medium ${theme.isDark ? 'border-white/5 text-slate-300' : 'border-slate-100 text-slate-600'}`}>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Cohort Progress Tracking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Custom DB Integrations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> SLA & Security Assurances</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Dedicated Account Manager</li>
              </ul>
            </div>
            <a 
              href="#contact"
              className={`w-full py-3 rounded-xl text-xs font-bold text-center border transition-all block cursor-pointer ${
                theme.isDark ? 'text-slate-300 bg-white/5 border-white/10 hover:bg-white/10' : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
              }`}
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className={`py-24 border-t ${theme.isDark ? 'bg-white/2 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">GOT QUESTIONS?</span>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
              Frequently Asked Questions
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Everything you need to know about security, parsing algorithms, and accuracy levels.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is my resume kept private and secure?",
                a: "Yes, absolutely. We prioritize candidate security. Your raw resume contents are encrypted and evaluated on secure server channels. We never sell, distribute, or retain logs of sensitive information."
              },
              {
                q: "How accurate is the AI semantic mapping algorithm?",
                a: "Our system goes beyond simple keyword searching. By utilizing advanced LLM processing, it evaluates architectural equivalence (e.g. knowing that understanding 'PostgreSQL' maps closely to relational db requirements for 'MySQL'). This delivers an extremely accurate representation of your real knowledge."
              },
              {
                q: "What resume formats are supported?",
                a: "Our platform accepts any file type and automatically extracts readable semantic content. You can also copy and paste or dictate your resume into the raw editor area as well."
              },
              {
                q: "Can I use this for multiple distinct roles?",
                a: "Yes! Your Pro dashboard allows you to evaluate your profile against completely different job descriptions. This allows you to fine-tune distinct resume iterations tailored to various job paths."
              }
            ].map((faq, idx) => (
              <div key={idx} className={`${theme.card} p-5 border`}>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className={`w-full flex justify-between items-center text-left text-sm font-bold transition-colors cursor-pointer ${
                    theme.isDark ? 'text-white hover:text-blue-400' : 'text-slate-900 hover:text-blue-600'
                  }`}
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${openFaq === idx ? 'transform rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <p className={`text-xs leading-relaxed font-medium mt-3.5 pt-3 border-t ${
                    theme.isDark ? 'text-slate-300 border-white/5' : 'text-slate-600 border-slate-100'
                  }`}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Details */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block">Get in touch</span>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
              We'd Love to Hear From You
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Have questions about university cohorts, customized Enterprise pricing plans, or partnership integrations? Reach out to our specialized Silicon Valley engineering squad.
            </p>

            <div className={`space-y-4 pt-6 border-t text-xs font-medium ${theme.isDark ? 'border-white/5 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500" />
                <span>support@skillgapagent.ai</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span>San Francisco, California, USA</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <a href="https://github.com/Sakthi2430" target="_blank" rel="noopener noreferrer" className={`p-2.5 rounded-xl border transition-all ${
                theme.isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-sm'
              }`}>
                <Github className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/sakthi-ganesh-8990b1322/" target="_blank" rel="noopener noreferrer" className={`p-2.5 rounded-xl border transition-all ${
                theme.isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-sm'
              }`}>
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Right Contact Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleContactSubmit} className={`${theme.card} p-8 border space-y-6`}>
              {contactSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-semibold text-emerald-400 text-center animate-bounce">
                  ✓ Message transmitted successfully! We will follow up shortly.
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme.isDark ? 'bg-slate-900/50 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    placeholder="e.g. Sarah Smith"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme.isDark ? 'bg-slate-900/50 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    placeholder="e.g. sarah@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Message</label>
                <textarea
                  required
                  rows={4}
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme.isDark ? 'bg-slate-900/50 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="Tell us about your organization or inquiry details..."
                />
              </div>

              <button
                type="submit"
                disabled={contactLoading}
                className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {contactLoading ? 'Transmitting...' : 'Send Message'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className={`border-t py-16 text-xs transition-all ${
        theme.isDark ? 'bg-slate-950 border-white/5 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-4">
            <div>
              <Logo isDark={theme.isDark} size="sm" />
            </div>
            <p className={`leading-relaxed font-medium ${theme.isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Bridging candidate technical gaps utilizing advanced LLM semantic evaluations and diagnostic timelines.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-4">
            <h4 className={`font-bold uppercase tracking-wider text-[10px] ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Product</h4>
            <ul className="space-y-2.5 font-medium text-slate-500">
              <li><a href="#features" className={`transition-colors ${theme.isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>Features</a></li>
              <li><a href="#how-it-works" className={`transition-colors ${theme.isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>How It Works</a></li>
              <li><a href="#dashboard-preview" className={`transition-colors ${theme.isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>Dashboard Preview</a></li>
              <li><a href="#pricing" className={`transition-colors ${theme.isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>Pricing Options</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-4">
            <h4 className={`font-bold uppercase tracking-wider text-[10px] ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Resources</h4>
            <ul className="space-y-2.5 font-medium text-slate-500">
              <li><a href="#" className={`transition-colors ${theme.isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>Career Blog</a></li>
              <li><a href="#" className={`transition-colors ${theme.isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>ATS Guidebook</a></li>
              <li><a href="#" className={`transition-colors ${theme.isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>API Documentation</a></li>
              <li><a href="#" className={`transition-colors ${theme.isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>Privacy Policy</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-4">
            <h4 className={`font-bold uppercase tracking-wider text-[10px] ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Newsletter</h4>
            <p className="text-slate-500 leading-relaxed font-medium">
              Receive high-paying technical scope trends directly in your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@domain.com"
                className={`px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1 ${
                  theme.isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button 
                onClick={() => alert('Successfully subscribed!')}
                className="px-3 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors cursor-pointer"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 mt-12 pt-8 border-t text-center flex flex-col sm:flex-row justify-between items-center gap-4 font-semibold text-[11px] ${
          theme.isDark ? 'border-white/5 text-slate-600' : 'border-slate-200 text-slate-500'
        }`}>
          <span>&copy; {new Date().getFullYear()} SkillGapAgent AI. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className={`transition-colors ${theme.isDark ? 'hover:text-slate-400' : 'hover:text-slate-700'}`}>Terms of Service</a>
            <a href="#" className={`transition-colors ${theme.isDark ? 'hover:text-slate-400' : 'hover:text-slate-700'}`}>Privacy Policy</a>
            <a href="#" className={`transition-colors ${theme.isDark ? 'hover:text-slate-400' : 'hover:text-slate-700'}`}>Cookies Settings</a>
          </div>
        </div>
      </footer>

      {/* Demo Video Modal Overlay */}
      {showDemo && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`${theme.card} max-w-2xl w-full border overflow-hidden relative`}>
            <div className={`p-4 border-b flex justify-between items-center ${theme.isDark ? 'bg-slate-900/50 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
              <span className={`text-xs font-bold flex items-center gap-2 ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
                <Play className="h-4 w-4 text-blue-500 fill-blue-500" />
                SkillGapAgent Video Demo Preview
              </span>
              <button
                onClick={() => setShowDemo(false)}
                className={`text-xs font-black cursor-pointer px-2 py-1 rounded transition-colors ${
                  theme.isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                CLOSE
              </button>
            </div>
            {/* Mock custom video player */}
            <div className={`relative aspect-video flex flex-col justify-center items-center text-center p-8 border-t ${
              theme.isDark ? 'bg-slate-900 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              {/* Pulsing neon circle for aesthetic quality */}
              <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 animate-pulse mb-4">
                <Sparkles className="h-8 w-8" />
              </div>
              <h4 className={`text-sm font-black ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Interactive Walkthrough Playback</h4>
              <p className={`text-xs max-w-md mx-auto leading-relaxed mt-2 font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                "Hi! In this video, we'll show you how to upload a raw text resume, paste a target Senior React Job Description, click evaluation, inspect matched nodes, and export your 6-week priority study roadmap."
              </p>
              <button
                onClick={() => setShowDemo(false)}
                className="mt-6 px-6 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
              >
                Start Free & Try It Yourself
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
