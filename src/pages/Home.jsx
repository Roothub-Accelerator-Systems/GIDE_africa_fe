import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { 
  FileText, Star, Users, Shield, ArrowRight, Brain, 
  Globe, Download, Zap, Target, Eye, CheckCircle,
  Upload, Sparkles, TrendingUp, Award, BookOpen,
  Mail, Phone, MapPin, Twitter, Linkedin, Instagram,
  Facebook, Youtube, ChevronUp
} from 'lucide-react';

const Home = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate(); // Add this hook

  // Remove the commented out navigate function and use the real one
  const handleNavigation = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: <Brain size={24} />,
      title: "AI-Powered Content",
      description: "Generate professional summaries, achievements, and bullet points tailored to your industry and role.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Target size={24} />,
      title: "ATS Optimization",
      description: "Real-time ATS-friendliness scoring with keyword suggestions to pass automated screening systems.",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: <Globe size={24} />,
      title: "Global Standards",
      description: "Templates designed for US, UK, Canada, EU, and Asian job markets with regional customization.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Zap size={24} />,
      title: "Job Tailoring",
      description: "Upload job descriptions and get instant resume optimization with matching keywords and skills.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <Eye size={24} />,
      title: "Live Preview",
      description: "Drag-and-drop editing with real-time preview. See changes instantly as you build your resume.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Shield size={24} />,
      title: "Privacy First",
      description: "End-to-end encryption and GDPR compliance. Your data is secure and never shared with third parties.",
      gradient: "from-gray-500 to-slate-500"
    }
  ];

  const aiFeatures = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: "Resume Parsing",
      description: "Upload your existing resume and let AI extract and enhance your information automatically."
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Content Generation",
      description: "AI generates professional summaries, achievement-based bullet points, and cover letters."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Match Scoring",
      description: "Compare your resume to job descriptions and get detailed match scores with improvement suggestions."
    }
  ];

  const exportOptions = [
    { format: "PDF", description: "Professional PDF format optimized for printing and digital sharing" },
    { format: "DOCX", description: "Microsoft Word compatible format for easy editing and customization" },
    { format: "LinkedIn", description: "Direct export to LinkedIn profile with optimized formatting" },
    { format: "Shareable Link", description: "Create a portfolio link for recruiters and hiring managers" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      company: "Google",
      quote: "Landing my dream job at Google was possible thanks to the AI-optimized resume. The ATS scoring feature was a game-changer!"
    },
    {
      name: "Michael Chen",
      role: "Marketing Manager",
      company: "Meta",
      quote: "The job tailoring feature helped me customize my resume for different roles. I got 3x more interviews!"
    },
    {
      name: "Emily Rodriguez",
      role: "Data Scientist",
      company: "Netflix",
      quote: "The AI content suggestions were spot-on. It highlighted achievements I never thought to include."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-300/20 to-purple-300/20 dark:from-blue-400/10 dark:to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-300/20 to-orange-300/20 dark:from-pink-400/10 dark:to-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-25 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 z-10">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-4 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Resume Builder
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Create Resumes
              </span>
              <br />
              <span className="text-gray-800 dark:text-gray-100">
                That Get Hired
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl mb-8 text-gray-700 dark:text-gray-300 leading-relaxed">
              Build ATS-optimized resumes with AI-powered content generation, 
              global formatting standards, and real-time job matching in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white rounded-xl font-semibold text-lg flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                onClick={() => handleNavigation('/login')}
              >
                Start Building for Free 
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              
              <button
                className="px-8 py-4 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105"
                onClick={() => handleNavigation('/templates')}
              >
                View Templates
              </button>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                <span>Advanced Ai Modals for premiuim users</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                <span>50,000+ job seekers trust us</span>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 dark:from-blue-500/30 dark:to-purple-500/30 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl dark:shadow-2xl dark:shadow-purple-500/10 p-8 transform hover:scale-105 transition-transform duration-500 border border-gray-200/50 dark:border-gray-700/50">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-2xl p-6 mb-6">
                  <FileText className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">AI Resume Builder</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center mt-2">Professional templates with smart formatting</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300">ATS-Optimized Templates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300">AI Content Generation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300">Real-time Preview</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to create professional resumes that stand out and get past ATS systems
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl dark:hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2 hover:scale-102"
            >
              <div className={`bg-gradient-to-r ${feature.gradient} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-3xl p-8 sm:p-12 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <Brain className="inline-block w-10 h-10 mr-3 text-purple-600 dark:text-purple-400" />
              AI-Powered Intelligence
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Advanced AI features that give you a competitive edge
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {aiFeatures.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 hover:scale-105 transition-transform duration-300"
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 w-16 h-16 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Export Options */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <Download className="inline-block w-10 h-10 mr-3 text-green-600 dark:text-green-400" />
            Multiple Export Options
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Export your resume in the format that works best for you
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {exportOptions.map((option, index) => (
            <div
              key={index}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl dark:shadow-lg dark:shadow-gray-900/30 dark:hover:shadow-2xl dark:hover:shadow-purple-500/20 transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1"
            >
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 dark:from-green-500 dark:to-blue-600 text-white text-lg font-bold py-2 px-4 rounded-lg mb-4 inline-block">
                  {option.format}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Join thousands who landed their dream jobs
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 hover:scale-105 transition-transform duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name[0]}
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.quote}"</p>
              <div className="flex text-yellow-400 dark:text-yellow-300 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Join over 50,000 job seekers who have successfully created professional resumes 
              and landed interviews at top companies worldwide.
            </p>
            <button
              className="px-10 py-4 bg-white text-blue-600 dark:bg-gray-100 dark:text-blue-700 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              onClick={() => handleNavigation('/signup')}
            >
              Start Building Your Resume Now
            </button>
            {/* <p className="mt-4 text-sm opacity-75">Free forever • No credit card required</p> */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold">ResumeAI</span>
              </div>
              <p className="text-gray-400 dark:text-gray-300 mb-6 leading-relaxed">
                AI-powered resume builder helping job seekers worldwide create professional resumes that get results.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors hover:scale-110 transform">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors hover:scale-110 transform">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors hover:scale-110 transform">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors hover:scale-110 transform">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors hover:scale-110 transform">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/resume-builder')}>Resume Builder</a></li>
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/cover-letter')}>Cover Letter Generator</a></li>
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/ats-scanner')}>ATS Scanner</a></li>
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/templates')}>Templates</a></li>
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/job-matching')}>Job Matching</a></li>
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/examples')}>Resume Examples</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/blog')}>Career Blog</a></li>
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/guide')}>Resume Guide</a></li>
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/interview-tips')}>Interview Tips</a></li>
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/salary-guide')}>Salary Guide</a></li>
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/insights')}>Industry Insights</a></li>
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/help')}>Help Center</a></li>
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-3 mb-6">
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/contact')}>Contact Us</a></li>
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/faq')}>FAQ</a></li>
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/privacy')}>Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/terms')}>Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors" onClick={() => handleNavigation('/gdpr')}>GDPR</a></li>
              </ul>
              <div className="space-y-2">
                <div className="flex items-center text-gray-400 dark:text-gray-300">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm">gideafrica@gmail.com</span>
                </div>
                <div className="flex items-center text-gray-400 dark:text-gray-300">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-sm">+234 (000) 000-0000</span>
                </div>
                <div className="flex items-center text-gray-400 dark:text-gray-300">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm">Uyo, Akwa Ibom</span>
                </div>
              </div>
            </div>
          </div>

          {/* Powered by Guide.Africa */}
          <div className="border-t border-gray-800 dark:border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <span className="text-gray-400 dark:text-gray-300 text-sm">Powered by</span>
                <a 
                  href="https://gide.africa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 flex items-center text-blue-400 dark:text-blue-300 hover:text-blue-300 dark:hover:text-blue-200 transition-colors hover:scale-105 transform"
                >
                  {/* <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 dark:from-green-500 dark:to-blue-600 rounded mr-2 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div> */}
                  <span className="font-semibold">Gide.Africa</span>
                </a>
                {/* <div className='font-light text-[0.9rem] relative top-7 right-28'>by the roothub</div> */}
              </div>
              
              
              <div className="text-center md:text-right">
                <p className="text-gray-400 dark:text-gray-300 text-sm">
                  © 2025 ResumeAI. All rights reserved. Made with passion for job seekers worldwide.
                </p>
                <div className="flex items-center justify-center md:justify-end mt-2 space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span> Available in 15 languages</span>
                  <span>•</span>
                  <span> 50,000+ success stories</span>
                  <span>•</span>
                  <span> 99.9% uptime</span>
                </div>
              </div>
            </div>
          </div>
                  </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        className={`fixed bottom-8 right-8 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
        onClick={scrollToTop}
      >
        <ChevronUp className="dark:text-white w-10 h-10" />
      </button>
    </div>
  );
};

export default Home;